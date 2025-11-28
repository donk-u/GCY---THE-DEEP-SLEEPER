// 测试服务器 API 的脚本
const http = require('http');

const testApi = (path, description) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n✅ ${description}`);
        console.log(`   状态码: ${res.statusCode}`);
        console.log(`   响应: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`\n❌ ${description}`);
      console.log(`   错误: ${err.message}`);
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 开始测试服务器 API...\n');

  try {
    await testApi('/', '主页测试');
    await testApi('/api/health', '健康检查 API');
    await testApi('/api/site-info', '站点信息 API');
    await testApi('/api/projects', '项目列表 API');
    await testApi('/api/services', '服务列表 API');
    await testApi('/api/stats', '统计数据 API');
    
    console.log('\n🎉 所有测试通过！服务器运行正常。');
  } catch (error) {
    console.log('\n💥 测试失败，请确保服务器正在运行在 http://localhost:3000');
    console.log('   启动命令: npm start');
  }
};

// 延迟3秒后开始测试，给服务器启动时间
setTimeout(runTests, 3000);