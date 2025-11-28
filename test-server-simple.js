const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== 简单服务器测试 ===');
console.log('Node.js 版本:', process.version);
console.log('环境变量 PORT:', process.env.PORT);
console.log('当前目录:', __dirname);

const app = express();
const PORT = process.env.PORT || 3000;

// 基本中间件
app.use(express.json());

// 测试路由
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Kobe Portfolio 测试页面</title></head>
      <body>
        <h1>🎉 服务器运行正常！</h1>
        <p>当前时间: ${new Date().toLocaleString()}</p>
        <p>端口: ${PORT}</p>
        <p><a href="/test-api">测试 API</a></p>
      </body>
    </html>
  `);
});

app.get('/test-api', (req, res) => {
  res.json({
    status: 'success',
    message: 'API 正常工作',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    cloudbase: {
      envId: process.env.CLOUDBASE_ENV_ID || 'not configured',
      region: process.env.CLOUDBASE_REGION || 'not configured'
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务器启动成功！`);
  console.log(`📍 本地访问: http://localhost:${PORT}`);
  console.log(`📍 局域网访问: http://127.0.0.1:${PORT}`);
  console.log(`📍 API 测试: http://localhost:${PORT}/test-api`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});

server.on('error', (err) => {
  console.error('❌ 服务器启动失败:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ 端口 ${PORT} 被占用`);
    console.log('请运行: taskkill /f /im node.exe');
  }
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});