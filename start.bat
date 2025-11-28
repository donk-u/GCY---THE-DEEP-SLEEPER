@echo off
echo ===========================================
echo     Kobe Portfolio 启动脚本
echo ===========================================

echo 正在检查端口 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 发现进程占用端口: %%a
    echo 正在终止进程...
    taskkill /PID %%a /F >nul 2>&1
)

echo 等待端口释放...
timeout /t 2 >nul

echo 启动服务器...
echo ===========================================
node server.js

pause