# shopmall

烟花商城全栈示例：React 前端 + FastAPI 后端 + SQLite 数据库。

## 目录结构

- `frontend/` React 前端（包含商城首页、个人中心、管理员与分销商后台）。
- `backend/` FastAPI 后端（商品、订单、后台汇总接口）。

## 前端启动

```bash
cd frontend
npm install
npm run dev
```

## 后端启动

```bash
cd backend
uv  venv .venv --python 3.12
# source .venv/bin/activate 
.venv\Scripts\activate 
uv pip install -r requirements.txt
uvicorn app.main:app --reload
```
