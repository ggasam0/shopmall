import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("请输入账号和密码");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const auth = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });
      localStorage.setItem("adminAuth", JSON.stringify(auth));
      navigate(auth.role === "admin" ? "/admin" : "/distributor");
    } catch (err) {
      setError("账号或密码错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page login">
      <section className="login-card">
        <div>
          <h2>后台账号登录</h2>
          <p>管理员与分销商账号统一登录入口</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            账号
            <input
              type="text"
              name="username"
              placeholder="请输入账号"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label>
            密码
            <input
              type="password"
              name="password"
              placeholder="请输入密码"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button">
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <div className="login-hint">
          <span>默认账号示例：</span>
          <div>
            管理员：admin / admin123
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
