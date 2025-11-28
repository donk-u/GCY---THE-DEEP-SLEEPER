// 查找可用端口
const net = require('net');

function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => {
                resolve(true); // 端口可用
            });
            server.close();
        });
        
        server.on('error', () => {
            resolve(false); // 端口被占用
        });
    });
}

async function findFreePort(startPort = 3000) {
    for (let port = startPort; port <= 3010; port++) {
        const isFree = await checkPort(port);
        if (isFree) {
            return port;
        }
    }
    return null;
}

async function main() {
    console.log('🔍 检查端口状态...');
    
    // 检查常用端口
    const ports = [3000, 3001, 3002, 3003, 8000, 8080];
    const freePorts = [];
    
    for (const port of ports) {
        const isFree = await checkPort(port);
        if (isFree) {
            freePorts.push(port);
            console.log(`✅ 端口 ${port} 可用`);
        } else {
            console.log(`❌ 端口 ${port} 被占用`);
        }
    }
    
    if (freePorts.length > 0) {
        console.log(`\n🎯 推荐使用端口: ${freePorts[0]}`);
        console.log(`\n💡 修改 .env 文件中的 PORT=${freePorts[0]}`);
        
        // 自动更新 .env 文件
        const fs = require('fs');
        let envContent = fs.readFileSync('.env', 'utf8');
        envContent = envContent.replace(/PORT=\d+/, `PORT=${freePorts[0]}`);
        envContent = envContent.replace(/CORS_ORIGIN=http:\/\/localhost:\d+/, `CORS_ORIGIN=http://localhost:${freePorts[0]}`);
        fs.writeFileSync('.env', envContent);
        
        console.log(`✅ 已自动更新 .env 文件为端口 ${freePorts[0]}`);
    } else {
        console.log('\n❌ 没有找到可用端口');
    }
}

main().catch(console.error);