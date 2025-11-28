@echo off
chcp 65001 >nul
echo ===========================================
echo  Kobe Portfolio - 前后端集成启动
echo ===========================================

echo 1. 检查 Node.js 环境...
node --version
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

echo.
echo 2. 检查端口占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 发现占用进程 PID: %%a
    echo 正在终止进程...
    taskkill /PID %%a /F >nul 2>&1
)

echo 3. 等待端口释放...
timeout /t 2 >nul

echo.
echo 4. 启动后端服务器...
echo ===========================================
echo 📍 服务器地址: http://localhost:3000
echo 🌐 前端页面: http://localhost:3000
echo 📡 API接口: http://localhost:3000/api
echo 💾 CloudBase: 已连接
echo ===========================================
echo.

node server.js

if errorlevel 1 (
    echo.
    echo ❌ 服务器启动失败
    echo.
    echo 🔧 可能的解决方案:
    echo 1. 检查 .env 文件配置
    echo 2. 运行 npm install 安装依赖
    echo 3. 确认 CloudBase 连接正常
    echo.
    echo 📋 调试命令:
    echo    node diagnose.js - 诊断连接问题
    echo    node test-server-simple.js - 测试简单服务器
)

pause