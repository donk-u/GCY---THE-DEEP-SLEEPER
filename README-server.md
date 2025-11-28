# Kobe Portfolio - 后端服务器

## 🚀 快速启动

### 方法一：使用启动脚本（推荐）
双击 `start.bat` 文件即可自动安装依赖并启动服务器

### 方法二：手动启动
1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动服务器：
   ```bash
   npm start
   ```

3. 开发模式（自动重启）：
   ```bash
   npm run dev
   ```

## 🌐 访问地址

- **主页**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health
- **站点信息**: http://localhost:3000/api/site-info

## 📡 API 接口

### 获取项目列表
```
GET /api/projects
```

### 获取服务列表
```
GET /api/services
```

### 获取统计数据
```
GET /api/stats
```

### 提交联系表单
```
POST /api/contact
Content-Type: application/json

{
    "name": "姓名",
    "email": "邮箱地址",
    "message": "留言内容"
}
```

## ⚙️ 环境配置

编辑 `.env` 文件来自定义配置：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kobe_portfolio
DB_USER=root
DB_PASSWORD=

# JWT密钥
JWT_SECRET=your_jwt_secret_key_here

# CORS配置
CORS_ORIGIN=http://localhost:3000

# API配置
API_VERSION=v1
API_PREFIX=/api

# 文件上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# 其他配置
SITE_NAME=Kobe Portfolio
SITE_DESCRIPTION=Deep Sleeper | 睡眠工程师
CONTACT_EMAIL=1762079094@qq.com
```

## 📁 项目结构

```
kobe-portfolio/
├── server.js              # 主服务器文件
├── package.json           # 项目配置和依赖
├── .env                   # 环境变量配置
├── start.bat              # Windows 启动脚本
├── index.html             # 主页文件
├── style.css              # 样式文件
├── script.js              # 前端脚本
├── uploads/               # 文件上传目录
└── README-server.md       # 服务器说明文档
```

## 🔧 技术栈

- **后端**: Node.js + Express.js
- **安全**: Helmet, CORS, Rate Limiting
- **日志**: Morgan
- **压缩**: Compression
- **环境变量**: dotenv
- **开发工具**: Nodemon

## 🛠️ 功能特性

- ✅ 静态文件服务
- ✅ RESTful API 接口
- ✅ 安全中间件
- ✅ 速率限制
- ✅ 请求压缩
- ✅ 错误处理
- ✅ 健康检查
- ✅ 优雅关闭
- ✅ 开发/生产环境支持

## 🐛 常见问题

### 1. 端口被占用
修改 `.env` 文件中的 `PORT` 值，例如改为 3001

### 2. 依赖安装失败
尝试清除缓存重新安装：
```bash
npm cache clean --force
npm install
```

### 3. 无法访问
检查防火墙设置，确保端口 3000 未被阻止

## 📞 联系信息

- **邮箱**: 1762079094@qq.com
- **项目地址**: https://github.com/your-username/kobe-portfolio