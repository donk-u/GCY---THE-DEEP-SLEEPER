# Kobe Portfolio - PowerShell 启动脚本

Write-Host "===================================" -ForegroundColor Green
Write-Host "  Kobe Portfolio 服务器启动脚本" -ForegroundColor Green  
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# 检查 Node.js 是否安装
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未检测到 Node.js" -ForegroundColor Red
    Write-Host "请先安装 Node.js: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

# 检查 npm 是否可用
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 已安装: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: npm 不可用" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

# 检查是否已安装依赖
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 正在安装依赖包..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        Read-Host "按任意键退出"
        exit 1
    }
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "✅ 依赖已存在" -ForegroundColor Green
}

# 启动服务器
Write-Host ""
Write-Host "🚀 正在启动服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "服务器将在以下地址启动:" -ForegroundColor Cyan
Write-Host "📍 主页: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 API: http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

# 直接启动服务器
npm start

Write-Host ""
Write-Host "服务器已停止" -ForegroundColor Yellow
Read-Host "按任意键退出"