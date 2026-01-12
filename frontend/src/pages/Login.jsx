import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import { useSupplier } from "../store/supplier";
import { buildSupplierPath } from "../utils/supplier";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const supplier = useSupplier();
  const supplierPath = (path) => buildSupplierPath(supplier, path);
  const loginNotice = location.state?.message;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!phone.trim()) {
      setError("请输入手机号");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await apiRequest("/auth/phone", {
        method: "POST",
        body: JSON.stringify({ phone: phone.trim() })
      });
      localStorage.setItem("shopmallUser", JSON.stringify(user));
      window.dispatchEvent(new Event("shopmall-user-change"));
      const redirectTo = location.state?.from || supplierPath("/profile");
      navigate(redirectTo);
    } catch (err) {
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page login">
      <section className="login-card">
        <div>
          <h2>手机号码免密登录</h2>
          <p>输入手机号即可进入烟花商城</p>
        </div>
        {loginNotice ? <p className="form-error">{loginNotice}</p> : null}
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            手机号
            <input
              type="tel"
              name="phone"
              placeholder="请输入手机号"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button">
            {loading ? "登录中..." : "立即登录"}
          </button>
        </form>
      </section>
      <footer className="login-footer">
        注册/登录即表示同意《用户协议》与《隐私政策》
      </footer>
    </main>
  );
};

export default Login;
