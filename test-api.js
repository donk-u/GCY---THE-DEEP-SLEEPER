// 测试API连接
const http = require('http');

function testAPI() {
    console.log('🧪 测试睡眠咨询系统API...');
    
    const testData = {
        userId: 'test',
        date: '2025-11-28',
        bedtime: '22:00',
        wakeup: '06:00',
        quality: 8,
        caffeine: 0,
        notes: '测试记录'
    };
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/submit-sleep-log-v2',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📥 API响应状态码:', res.statusCode);
            console.log('📥 API响应数据:', data);
            
            try {
                const result = JSON.parse(data);
                if (result.success) {
                    console.log('✅ API测试成功！');
                } else {
                    console.log('❌ API返回错误:', result.error);
                }
            } catch (error) {
                console.log('❌ JSON解析失败:', error.message);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ 网络错误:', error.message);
    });
    
    req.write(JSON.stringify(testData));
    req.end();
}

// 运行测试
testAPI();