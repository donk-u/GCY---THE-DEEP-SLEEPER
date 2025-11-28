@echo off
chcp 65001 >nul
echo ===========================================
echo     Kobe Portfolio 安全启动脚本
echo ===========================================

echo 1. 清理端口占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 发现占用进程 PID: %%a
    echo 正在终止进程...
    taskkill /PID %%a /F >nul 2>&1
    if errorlevel 1 (
        echo 进程 %%a 可能已停止或无法终止
    ) else (
        echo ✅ 进程 %%a 已终止
    )
)

echo.
echo 2. 等待端口释放...
timeout /t 3 >nul

echo.
echo 3. 检查端口状态...
netstat -ano | findstr :3000
if errorlevel 1 (
    echo ✅ 端口 3000 已释放
) else (
    echo ⚠️ 端口 3000 仍被占用
)

echo.
echo 4. 启动服务器...
echo ===========================================
echo 服务器启动后可通过以下地址访问:
echo   http://localhost:3000
echo   http://127.0.0.1:3000
echo ===========================================
echo.

node server.js

if errorlevel 1 (
    echo.
    echo ❌ 服务器启动失败
    echo 请检查:
    echo 1. Node.js 是否正确安装
    echo 2. 依赖包是否完整 (运行 npm install)
    echo 3. .env 文件配置是否正确
)

pause