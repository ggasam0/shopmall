const Login = () => {
  return (
    <main className="page login">
      <section className="login-card">
        <div>
          <h2>手机号码免密登录</h2>
          <p>短信验证码验证后即可进入烟花商城</p>
        </div>
        <form className="login-form">
          <label>
            手机号
            <input
              type="tel"
              name="phone"
              placeholder="请输入手机号"
              autoComplete="tel"
            />
          </label>
          <label className="code-row">
            验证码
            <div>
              <input
                type="text"
                name="code"
                placeholder="请输入验证码"
                autoComplete="one-time-code"
              />
              <button type="button" className="ghost-button">
                获取验证码
              </button>
            </div>
          </label>
          <button type="submit" className="primary-button">
            立即登录
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
