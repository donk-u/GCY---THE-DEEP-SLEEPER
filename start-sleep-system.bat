@echo off
chcp 65001 >nul
echo ===========================================
echo     睡眠咨询全栈系统启动器
echo ===========================================

echo 1. 检查项目文件...
if not exist "sleep-consultation.html" (
    echo ❌ 睡眠咨询页面文件缺失
    pause
    exit /b 1
)

if not exist "cloudfunctions" (
    echo ❌ 云函数目录缺失
    pause
    exit /b 1
)

echo ✅ 项目文件检查通过

echo.
echo 2. 检查 Node.js 环境...
node --version
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

echo.
echo 3. 部署前准备...
echo 📋 选择部署操作:
echo    1. 本地开发启动
echo    2. 云函数部署准备
echo    3. 运行系统测试
echo    4. 生成部署文档
echo.
set /p choice=请选择操作 (1-4): 

if "%choice%"=="1" goto local_dev
if "%choice%"=="2" goto cloud_deploy
if "%choice%"=="3" goto run_test
if "%choice%"=="4" goto generate_docs

goto invalid_choice

:local_dev
echo.
echo 🚀 启动本地开发服务器...
echo 📍 睡眠咨询页面: http://localhost:3000/sleep-consultation.html
echo 📍 原始主页: http://localhost:3000/index.html
echo.

node server.js
goto end

:cloud_deploy
echo.
echo ☁️ 准备云函数部署...
node deploy-sleep-system.js
echo.
echo 📋 部署步骤:
echo    1. 进入每个云函数目录安装依赖
echo    2. 使用 tcb 命令部署云函数
echo    3. 配置 HTTP 访问路径
echo    4. 部署静态网站文件
echo.
goto end

:run_test
echo.
echo 🧪 运行系统测试...
node test-sleep-system.js
echo.
echo 📊 测试完成后请检查控制台输出
goto end

:generate_docs
echo.
echo 📄 生成部署文档...
node deploy-sleep-system.js > deployment-commands.txt
echo ✅ 部署命令已保存到 deployment-commands.txt
echo.
goto end

:invalid_choice
echo.
echo ❌ 无效选择，请重新运行脚本
goto end

:end
echo.
echo 🎯 操作完成！
echo 📞 如需技术支持: 1762079094@qq.com
pause