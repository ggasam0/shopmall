# shopmall

烟花商城全栈示例：React 前端 + FastAPI 后端 + SQLite 数据库。

## 目录结构

- `frontend/` React 前端（包含商城首页、个人中心）。
- `admin-frontend/` 管理后台前端。
- `backend/` FastAPI 后端（商品、订单、后台汇总接口）。

## Linux 远程服务器部署（全新服务器）

> 以下以 Ubuntu/Debian 为例，其他发行版请替换为对应的包管理器命令。

### 1) 基础环境与依赖安装

```bash
sudo apt update
sudo apt install -y git curl build-essential nginx

# 安装 Node.js (推荐 LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Python 3.12 + venv + uv
sudo apt install -y python3.12 python3.12-venv
python3.12 -m pip install --upgrade pip
python3.12 -m pip install uv
```

### 2) 拉取代码

```bash
cd /opt
sudo git clone <your-repo-url> shopmall
sudo chown -R $USER:$USER /opt/shopmall
cd /opt/shopmall
```

### 3) 后端启动（FastAPI）

```bash
cd /opt/shopmall/backend
uv venv .venv --python 3.12
source .venv/bin/activate
uv pip install -r requirements.txt

# 生产环境建议使用进程管理器（示例先用 uvicorn）
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4) 前端构建（商城与管理后台）

```bash
cd /opt/shopmall/frontend
npm install
npm run build

cd /opt/shopmall/admin-frontend
npm install
npm run build
```

构建后的静态文件通常在 `dist/` 目录，可用 Nginx 托管。

### 5) Nginx 反向代理与静态资源配置（示例）

编辑 `/etc/nginx/sites-available/shopmall`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 商城前端
    location / {
        root /opt/shopmall/frontend/dist;
        try_files $uri /index.html;
    }

    # 管理后台
    location /admin/ {
        alias /opt/shopmall/admin-frontend/dist/;
        try_files $uri /admin/index.html;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用并重载：

```bash
sudo ln -s /etc/nginx/sites-available/shopmall /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6) 域名注册与解析

1. 在域名注册商（如阿里云、腾讯云、Cloudflare 等）购买域名。
2. 在域名控制台添加 DNS 记录：
   - **A 记录**：主机记录 `@` 指向服务器公网 IP。
   - **A 记录**：主机记录 `www` 指向服务器公网 IP。
3. 等待解析生效（通常几分钟到数小时）。
4. 确认 DNS 解析：

```bash
nslookup your-domain.com
```

> 如需 HTTPS，请使用 Let’s Encrypt 配合 `certbot` 申请证书并配置 Nginx SSL。

---

## Windows 本地部署（开发）

### 1) 基础环境准备

- 安装 [Node.js LTS](https://nodejs.org/)
- 安装 [Python 3.12](https://www.python.org/downloads/)
- 安装 [Git](https://git-scm.com/)

### 2) 拉取代码

```powershell
git clone <your-repo-url>
cd shopmall
```

### 3) 启动后端

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4) 启动前端

```powershell
cd ..\frontend
npm install
npm run dev
```

### 5) 启动管理后台

```powershell
cd ..\admin-frontend
npm install
npm run dev
```

---

## 常见端口

- 前端开发服务器：`5173`
- 管理后台开发服务器：`5174`（如脚手架配置不同，以实际为准）
- 后端 API：`8000`

> 若部署到远程服务器，请在安全组/防火墙放行必要端口（如 80/443/8000）。
