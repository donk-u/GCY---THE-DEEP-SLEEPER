const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== 诊断工具 ===');
console.log('Node.js 版本:', process.version);
console.log('当前目录:', __dirname);
console.log('环境变量 PORT:', process.env.PORT);
console.log('CloudBase 环境ID:', process.env.CLOUDBASE_ENV_ID);

// 测试端口
const PORT = process.env.PORT || 3000;

console.log('\n=== 测试端口占用 ===');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('服务器正常运行！');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ 端口 ${PORT} 被占用`);
    
    // 查找占用端口的进程
    const { exec } = require('child_process');
    exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
      if (stdout) {
        console.log('占用进程详情:', stdout);
        const lines = stdout.split('\n');
        lines.forEach(line => {
          if (line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            console.log(`发现进程 PID: ${pid}`);
            
            // 获取进程信息
            exec(`tasklist /FI "PID eq ${pid}" /FO TABLE`, (err2, stdout2) => {
              console.log('进程详情:');
              console.log(stdout2);
            });
          }
        });
      }
    });
  } else {
    console.log('❌ 服务器错误:', err.message);
  }
});

server.on('listening', () => {
  console.log(`✅ 端口 ${PORT} 可用，服务器启动成功！`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`🌐 访问地址: http://127.0.0.1:${PORT}`);
  
  // 等待2秒后关闭
  setTimeout(() => {
    server.close(() => {
      console.log('\n✅ 诊断完成，端口可用');
      process.exit(0);
    });
  }, 2000);
});

server.listen(PORT);