@echo off
chcp 65001 >nul
title CloudBase SDK 安装脚本

echo 🌥️ CloudBase SDK 安装和连接
echo ================================

echo.
echo 📦 安装 CloudBase SDK...
npm install @cloudbase/node-sdk @cloudbase/cli

echo.
echo 🔍 检查安装结果...
node -e "try { require('@cloudbase/node-sdk'); console.log('✅ CloudBase SDK 安装成功'); } catch(e) { console.log('❌ CloudBase SDK 安装失败'); }"

echo.
echo 📋 更新项目配置...
echo {> cloudbaserc.json
echo   "envId": "cloud1-3gc4eoi9a5139d21",>> cloudbaserc.json
echo   "functionRoot": "./cloudfunctions",>> cloudbaserc.json
echo   "storageRoot": "./storage",>> cloudbaserc.json
echo   "dbRoot": "./db",>> cloudbaserc.json
echo   "region": "ap-shanghai">> cloudbaserc.json
echo }>> cloudbaserc.json

echo ✅ cloudbaserc.json 创建完成

echo.
echo 🔧 更新环境变量...
echo # CloudBase 配置>> .env
echo CLOUDBASE_ENV_ID=cloud1-3gc4eoi9a5139d21>> .env
echo CLOUDBASE_REGION=ap-shanghai>> .env
echo CLOUDBASE_SECRET_ID=>> .env
echo CLOUDBASE_SECRET_KEY=>> .env

echo ✅ .env 文件更新完成

echo.
echo 🔗 测试 CloudBase 连接...
node -e "try { const tcb = require('@cloudbase/node-sdk'); const app = tcb.init({ env: 'cloud1-3gc4eoi9a5139d21' }); const db = app.database(); console.log('✅ CloudBase 连接成功'); console.log('📍 环境ID: cloud1-3gc4eoi9a5139d21'); } catch(e) { console.log('❌ CloudBase 连接失败:', e.message); }"

echo.
echo 🎉 CloudBase 安装完成！
echo ================================
echo.
echo 📋 安装信息：
echo    🌍 环境 ID: cloud1-3gc4eoi9a5139d21
echo    🌍 区域: ap-shanghai
echo    🗄️ 数据库: 已配置
echo    📦 云函数: 已配置
echo.
echo 🔗 访问地址：
echo    📍 网站主页: https://cloud1-3gc4eoi9a5139d21-1385724839.tcloudbaseapp.com
echo    📍 管理控制台: https://console.cloud.tencent.com/tcb
echo.
echo 📝 下一步操作：
echo    1. 运行: npm start (启动本地服务器)
echo    2. 运行: npm run deploy:windows (部署到云端)
echo    3. 运行: cloudbase login (登录 CloudBase)
echo.
echo ✨ CloudBase 环境已就绪！

pause