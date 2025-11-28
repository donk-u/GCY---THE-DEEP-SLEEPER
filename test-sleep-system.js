// 🧪 睡眠咨询系统测试脚本
const { exec } = require('child_process');
const http = require('http');

// 🌍 测试配置
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
    testData: {
        contact: {
            name: '测试用户',
            email: 'test@sleep.com',
            consultationType: 'deep-sleep',
            message: '这是一个测试咨询请求'
        },
        sleepLog: {
            name: '测试用户',
            email: 'test@sleep.com', 
            sleepScore: 8,
            message: '测试睡眠记录'
        },
        sleepTest: {
            bedtime: '23:00',
            wakeup: '07:00', 
            quality: 8,
            caffeine: 1
        }
    }
};

// 🌐 HTTP 请求工具
async function httpRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: responseData ? JSON.parse(responseData) : null
                    };
                    resolve(result);
                } catch (error) {
                    reject(new Error(`JSON解析失败: ${error.message}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(TEST_CONFIG.timeout, () => {
            req.destroy();
            reject(new Error('请求超时'));
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// 🧪 测试函数
class SleepSystemTester {
    constructor() {
        this.testResults = [];
    }
    
    // 📊 添加测试结果
    addResult(testName, status, result, error = null) {
        this.testResults.push({
            test: testName,
            status: status,
            result: result,
            error: error
        });
        
        const emoji = status === '✅ 通过' ? '✅' : '❌';
        console.log(`${emoji} ${testName}: ${result}`);
        if (error) {
            console.log(`   错误: ${error}`);
        }
    }
    
    // 🌐 测试服务器连接
    async testServerConnection() {
        try {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/',
                method: 'GET',
                timeout: 5000
            };
            
            const response = await httpRequest(options);
            
            if (response.statusCode === 200) {
                this.addResult('服务器连接', '✅ 通过', '服务器运行正常');
                return true;
            } else {
                this.addResult('服务器连接', '❌ 失败', `HTTP状态码: ${response.statusCode}`);
                return false;
            }
        } catch (error) {
            this.addResult('服务器连接', '❌ 异常', '连接失败', error.message);
            return false;
        }
    }
    
    // 📋 测试睡眠咨询表单
    async testContactForm() {
        try {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/api/contact',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            const response = await httpRequest(options, TEST_CONFIG.testData.contact);
            
            if (response.statusCode === 200) {
                if (response.data && response.data.success) {
                    this.addResult('睡眠咨询表单', '✅ 通过', '表单提交成功');
                } else {
                    this.addResult('睡眠咨询表单', '❌ 失败', 'API返回错误', response.data?.message);
                }
            } else {
                this.addResult('睡眠咨询表单', '❌ 失败', `HTTP状态码: ${response.statusCode}`);
            }
        } catch (error) {
            this.addResult('睡眠咨询表单', '❌ 异常', '请求失败', error.message);
        }
    }
    
    // 📊 测试睡眠日志提交
    async testSleepLog() {
        try {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/api/sleep-log',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            const response = await httpRequest(options, TEST_CONFIG.testData.sleepLog);
            
            if (response.statusCode === 200) {
                if (response.data && response.data.success) {
                    this.addResult('睡眠日志提交', '✅ 通过', '日志提交成功');
                } else {
                    this.addResult('睡眠日志提交', '❌ 失败', 'API返回错误', response.data?.message);
                }
            } else {
                this.addResult('睡眠日志提交', '❌ 失败', `HTTP状态码: ${response.statusCode}`);
            }
        } catch (error) {
            this.addResult('睡眠日志提交', '❌ 异常', '请求失败', error.message);
        }
    }
    
    // 🧪 测试睡眠测试计算
    async testSleepCalculation() {
        try {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/api/sleep-test',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            const response = await httpRequest(options, TEST_CONFIG.testData.sleepTest);
            
            if (response.statusCode === 200) {
                if (response.data && response.data.success) {
                    const score = response.data.data?.score || '未知';
                    this.addResult('睡眠测试计算', '✅ 通过', `睡眠分数: ${score}`);
                } else {
                    this.addResult('睡眠测试计算', '❌ 失败', 'API返回错误', response.data?.message);
                }
            } else {
                this.addResult('睡眠测试计算', '❌ 失败', `HTTP状态码: ${response.statusCode}`);
            }
        } catch (error) {
            this.addResult('睡眠测试计算', '❌ 异常', '请求失败', error.message);
        }
    }
    
    // 📄 测试静态页面访问
    async testStaticPages() {
        const pages = [
            { name: '睡眠咨询页面', path: '/sleep-consultation.html' },
            { name: '主页', path: '/index.html' }
        ];
        
        for (const page of pages) {
            try {
                const options = {
                    hostname: 'localhost',
                    port: 3000,
                    path: page.path,
                    method: 'GET',
                    timeout: 5000
                };
                
                const response = await httpRequest(options);
                
                if (response.statusCode === 200) {
                    this.addResult(page.name, '✅ 通过', '页面可正常访问');
                } else {
                    this.addResult(page.name, '❌ 失败', `HTTP状态码: ${response.statusCode}`);
                }
            } catch (error) {
                this.addResult(page.name, '❌ 异常', '访问失败', error.message);
            }
        }
    }
    
    // 📊 显示测试结果
    displayResults() {
        console.log('\n📊 === 测试结果汇总 ===');
        console.log('='.repeat(50));
        
        this.testResults.forEach((result, index) => {
            const statusEmoji = result.status === '✅ 通过' ? '✅' : '❌';
            console.log(`${index + 1}. ${statusEmoji} ${result.test}`);
            console.log(`   结果: ${result.result}`);
            if (result.error) {
                console.log(`   错误: ${result.error}`);
            }
            console.log('');
        });
        
        const passedTests = this.testResults.filter(r => r.status === '✅ 通过').length;
        const totalTests = this.testResults.length;
        const passRate = Math.round((passedTests / totalTests) * 100);
        
        console.log(`🎯 测试通过率: ${passedTests}/${totalTests} (${passRate}%)`);
        
        if (passedTests === totalTests) {
            console.log('🎉 所有测试通过！系统运行正常。');
        } else if (passRate >= 70) {
            console.log('⚠️ 基本通过，部分功能需要优化。');
        } else {
            console.log('❌ 测试失败较多，需要检查系统配置。');
        }
        
        return {
            passed: passedTests,
            total: totalTests,
            rate: passRate
        };
    }
    
    // 🚀 运行完整测试
    async runFullTest() {
        console.log('🧪 === 开始睡眠咨询系统测试 ===');
        console.log('='.repeat(40));
        console.log(`🌍 测试服务器: ${TEST_CONFIG.baseUrl}`);
        console.log(`⏱️  超时时间: ${TEST_CONFIG.timeout}ms`);
        console.log('');
        
        // 检查服务器连接
        const serverConnected = await this.testServerConnection();
        
        if (!serverConnected) {
            console.log('\n❌ 服务器连接失败，无法继续测试');
            this.displayResults();
            return;
        }
        
        // 运行各项测试
        console.log('\n📋 运行功能测试...');
        await this.testStaticPages();
        await this.testContactForm();
        await this.testSleepLog();
        await this.testSleepCalculation();
        
        // 显示结果
        console.log('\n' + '='.repeat(50));
        const results = this.displayResults();
        
        return results;
    }
}

// 🌟 主测试函数
async function main() {
    const tester = new SleepSystemTester();
    
    try {
        await tester.runFullTest();
    } catch (error) {
        console.error('\n💥 测试过程中发生异常:', error.message);
        console.error('堆栈:', error.stack);
    }
    
    console.log('\n📞 技术支持: 1762079094@qq.com');
    console.log('🎯 测试完成！');
}

// 🚀 启动测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { SleepSystemTester, httpRequest, TEST_CONFIG };