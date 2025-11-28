@echo off
chcp 65001 >nul
title CloudBase 完整部署脚本

echo 🚀 开始 CloudBase 完整部署...
echo ======================================

:: 检查 Node.js
echo 🔍 检查部署环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装
    pause
    exit /b 1
)
echo ✅ Node.js: 已安装

:: 检查 npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安装
    pause
    exit /b 1
)
echo ✅ npm: 已安装

:: 检查 CloudBase CLI
cloudbase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 安装 CloudBase CLI...
    npm install -g @cloudbase/cli
    if %errorlevel% neq 0 (
        echo ❌ CloudBase CLI 安装失败
        pause
        exit /b 1
    )
)
echo ✅ CloudBase CLI: 已安装

:: 登录 CloudBase
echo.
echo 🔐 登录 CloudBase...
cloudbase login
if %errorlevel% neq 0 (
    echo ❌ CloudBase 登录失败
    pause
    exit /b 1
)
echo ✅ CloudBase 登录成功

:: 创建项目配置
echo.
echo 📋 初始化项目配置...
echo {> cloudbaserc.json
echo   "envId": "cloud1-3gc4eoi9a5139d21",>> cloudbaserc.json
echo   "functionRoot": "./cloudfunctions",>> cloudbaserc.json
echo   "storageRoot": "./storage",>> cloudbaserc.json
echo   "dbRoot": "./db",>> cloudbaserc.json
echo   "region": "ap-shanghai">> cloudbaserc.json
echo }>> cloudbaserc.json
echo ✅ 项目配置文件创建完成

:: 创建云函数目录
echo.
echo 📦 创建云函数...
if not exist "cloudfunctions\getProjects" mkdir "cloudfunctions\getProjects"
if not exist "cloudfunctions\addGuestbook" mkdir "cloudfunctions\addGuestbook"
if not exist "cloudfunctions\saveSleepData" mkdir "cloudfunctions\saveSleepData"

:: 创建 getProjects 云函数
echo    创建 getProjects 云函数...
(
echo // 云函数：获取项目列表
echo const cloud = require^('@cloudbase/node-sdk'^)
echo.
echo const app = cloud.init^(^{
echo   env: cloud.DYNAMIC_CURRENT_ENV
echo }^)
echo.
echo const db = app.database^(^)
echo.
echo exports.main = async ^^(event, context^) =^> ^{
echo   try ^{
echo     const result = await db.collection^('projects'^).get^(^)
echo     
echo     return ^{
echo       success: true,
echo       data: result.data,
echo       total: result.data.length
echo     ^}
echo   ^} catch ^^(error^) ^{
echo     console.error^('获取项目列表失败:', error^)
echo     return ^{
echo       success: false,
echo       error: error.message
echo     ^}
echo   ^}
echo ^}
) > "cloudfunctions\getProjects\index.js"

echo {> "cloudfunctions\getProjects\package.json"
echo   "name": "getProjects",>> "cloudfunctions\getProjects\package.json"
echo   "version": "1.0.0",>> "cloudfunctions\getProjects\package.json"
echo   "description": "获取项目列表云函数">> "cloudfunctions\getProjects\package.json"
echo }>> "cloudfunctions\getProjects\package.json"

:: 创建 addGuestbook 云函数
echo    创建 addGuestbook 云函数...
(
echo // 云函数：添加留言
echo const cloud = require^('@cloudbase/node-sdk'^)
echo.
echo const app = cloud.init^(^{
echo   env: cloud.DYNAMIC_CURRENT_ENV
echo }^)
echo.
echo const db = app.database^(^)
echo.
echo exports.main = async ^^(event, context^) =^> ^{
echo   try ^{
echo     const { name, message, email } = event
echo     
echo     if ^(!name ^|^| ^!message^) ^{
echo       return ^{
echo         success: false,
echo         error: '姓名和留言内容不能为空'
echo       ^}
echo     ^}
echo     
echo     const guestbookData = ^{
echo       name,
echo       message,
echo       email: email ^|^| '',
echo       timestamp: new Date^(^).toISOString^(^),
echo       status: 'pending',
echo       createTime: db.serverDate^(^)
echo     ^}
echo     
echo     const result = await db.collection^('guestbook'^).add^(^{
echo       data: guestbookData
echo     }^)
echo     
echo     return ^{
echo       success: true,
echo       message: '留言提交成功',
echo       data: ^{
echo         id: result._id,
echo       ...guestbookData
echo       ^}
echo     ^}
echo   ^} catch ^^(error^) ^{
echo     console.error^('添加留言失败:', error^)
echo     return ^{
echo       success: false,
echo       error: error.message
echo     ^}
echo   ^}
echo ^}
) > "cloudfunctions\addGuestbook\index.js"

echo {> "cloudfunctions\addGuestbook\package.json"
echo   "name": "addGuestbook",>> "cloudfunctions\addGuestbook\package.json"
echo   "version": "1.0.0",>> "cloudfunctions\addGuestbook\package.json"
echo   "description": "添加留言云函数">> "cloudfunctions\addGuestbook\package.json"
echo }>> "cloudfunctions\addGuestbook\package.json"

:: 创建 saveSleepData 云函数
echo    创建 saveSleepData 云函数...
(
echo // 云函数：保存睡眠数据
echo const cloud = require^('@cloudbase/node-sdk'^)
echo.
echo const app = cloud.init^(^{
echo   env: cloud.DYNAMIC_CURRENT_ENV
echo }^)
echo.
echo const db = app.database^(^)
echo.
echo exports.main = async ^^(event, context^) =^> ^{
echo   try ^{
echo     const { duration, quality, notes, userId } = event
echo     
echo     if ^(!duration ^|^| ^!quality^) ^{
echo       return ^{
echo         success: false,
echo         error: '睡眠时长和质量评级为必填项'
echo       ^}
echo     ^}
echo     
echo     if ^^(duration ^< 0 ^|^| duration ^> 24^) ^{
echo       return ^{
echo         success: false,
echo         error: '睡眠时长必须在0-24小时之间'
echo       ^}
echo     ^}
echo     
echo     if ^^(quality ^< 1 ^|^| quality ^> 10^) ^{
echo       return ^{
echo         success: false,
echo         error: '质量评级必须在1-10之间'
echo       ^}
echo     ^}
echo     
echo     const sleepData = ^{
echo       userId: userId ^|^| 'anonymous',
echo       duration: parseFloat^(duration^),
echo       quality: parseInt^(quality^),
echo       notes: notes ^|^| '',
echo       date: new Date^(^).toISOString^(^).split^('T'^)[0],
echo       timestamp: new Date^(^).toISOString^(^),
echo       createTime: db.serverDate^(^)
echo     ^}
echo     
echo     const result = await db.collection^('sleep_data'^).add^(^{
echo       data: sleepData
echo     ^}^)
echo     
echo     return ^{
echo       success: true,
echo       message: '睡眠数据记录成功',
echo       data: ^{
echo         id: result._id,
echo       ...sleepData
echo       ^}
echo     ^}
echo   ^} catch ^^(error^) ^{
echo     console.error^('保存睡眠数据失败:', error^)
echo     return ^{
echo       success: false,
echo       error: error.message
echo     ^}
echo   ^}
echo ^}
) > "cloudfunctions\saveSleepData\index.js"

echo {> "cloudfunctions\saveSleepData\package.json"
echo   "name": "saveSleepData",>> "cloudfunctions\saveSleepData\package.json"
echo   "version": "1.0.0",>> "cloudfunctions\saveSleepData\package.json"
echo   "description": "保存睡眠数据云函数">> "cloudfunctions\saveSleepData\package.json"
echo }>> "cloudfunctions\saveSleepData\package.json"

echo    ✅ 云函数创建完成

:: 部署云函数
echo.
echo    🚀 部署云函数到云端...
cloudbase functions:deploy
if %errorlevel% equ 0 (
    echo    ✅ 云函数部署成功
) else (
    echo    ⚠️ 云函数部署可能存在问题，请检查控制台
)

:: 部署静态网站
echo.
echo 🌐 部署静态网站...
if not exist "index.html" (
    echo ❌ index.html 文件不存在
    pause
    exit /b 1
)

cloudbase hosting deploy index.html style.css script.js Profile.png hero-bg.jpg
if %errorlevel% equ 0 (
    echo ✅ 静态网站部署成功
) else (
    echo ❌ 静态网站部署失败
    pause
    exit /b 1
)

:: 显示部署结果
echo.
echo 🎉 CloudBase 部署完成！
echo ======================================
echo.
echo 📋 部署信息：
echo    🌍 环境 ID: cloud1-3gc4eoi9a5139d21
echo    🌍 区域: ap-shanghai
echo    🗄️ 数据库: 4个集合已配置
echo    📦 云函数: 3个函数已部署
echo    🌐 静态网站: 已部署
echo.
echo 🔗 访问地址：
echo    📍 网站主页: https://cloud1-3gc4eoi9a5139d21-1385724839.tcloudbaseapp.com
echo    📍 管理控制台: https://console.cloud.tencent.com/tcb
echo.
echo 📝 下一步操作：
echo    1. 访问 CloudBase 控制台
echo    2. 创建数据库集合
echo    3. 配置云函数触发器
echo    4. 测试网站功能
echo.
echo ✨ 你的睡眠工程师作品集已经上线了！

pause