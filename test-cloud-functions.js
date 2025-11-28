const tcbIntegration = require('./tcb-integration');

/**
 * 测试云函数 CORS 支持
 */

async function testCloudFunction(functionName, data = {}) {
  try {
    console.log(`\n🧪 测试云函数: ${functionName}`);
    
    const result = await tcbIntegration.callTool('invokeFunction', {
      name: functionName,
      params: {
        ...data,
        method: 'POST'
      }
    });
    
    if (result.success) {
      console.log(`✅ ${functionName} 调用成功`);
      console.log('返回结果:', JSON.stringify(result.data, null, 2));
      
      // 检查 CORS headers
      if (result.data.headers) {
        console.log('🌐 CORS Headers:');
        Object.entries(result.data.headers).forEach(([key, value]) => {
          if (key.toLowerCase().includes('access-control')) {
            console.log(`   ${key}: ${value}`);
          }
        });
      }
    } else {
      console.log(`❌ ${functionName} 调用失败:`, result.error);
    }
    
  } catch (error) {
    console.log(`❌ ${functionName} 测试错误:`, error.message);
  }
}

// 测试 OPTIONS 请求
async function testOptionsRequest(functionName) {
  try {
    console.log(`\n🌐 测试 OPTIONS 请求: ${functionName}`);
    
    const result = await tcbIntegration.callTool('invokeFunction', {
      name: functionName,
      params: {
        method: 'OPTIONS'
      }
    });
    
    if (result.success) {
      console.log(`✅ ${functionName} OPTIONS 请求成功`);
      console.log('返回结果:', result.data);
    } else {
      console.log(`❌ ${functionName} OPTIONS 请求失败:`, result.error);
    }
    
  } catch (error) {
    console.log(`❌ ${functionName} OPTIONS 测试错误:`, error.message);
  }
}

async function runAllTests() {
  console.log('=== CloudBase 云函数 CORS 测试 ===');
  
  // 测试 OPTIONS 请求
  await testOptionsRequest('addGuestbook');
  await testOptionsRequest('getProjects');
  await testOptionsRequest('saveSleepData');
  
  // 测试正常业务请求
  await testCloudFunction('getProjects');
  
  await testCloudFunction('addGuestbook', {
    name: '测试用户',
    message: '这是一条测试留言',
    email: 'test@example.com'
  });
  
  await testCloudFunction('saveSleepData', {
    duration: 7.5,
    quality: 8,
    notes: '测试睡眠记录',
    userId: 'test_user'
  });
  
  console.log('\n🎉 所有测试完成！');
}

// 运行测试
runAllTests().catch(console.error);