// 🌐 API 管理模块 - 连接前端与后端
class APIManager {
    constructor() {
        // 根据环境选择API基础URL（浏览器环境检测）
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        
        // 判断是否为生产环境
        const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.');
        
        if (isProduction) {
            // 生产环境：使用当前域名
            this.baseURL = `${protocol}//${hostname}${port ? ':' + port : ''}`;
        } else {
            // 开发环境：使用 localhost:3000
            this.baseURL = 'http://localhost:3000';
        }
        
        this.apiPrefix = '/api';
        console.log('🌐 API基础URL:', this.baseURL);
    }

    // 📡 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${this.apiPrefix}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            console.log(`🌐 请求: ${config.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('✅ 响应:', data);
            return data;
            
        } catch (error) {
            console.error('❌ API请求失败:', error);
            this.showError(error.message);
            throw error;
        }
    }

    // 📊 GET 请求
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // 📤 POST 请求
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // 🎭 错误显示
    showError(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'api-error-toast';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // 自动消失
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // 🎉 成功提示
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'api-success-toast';
        successDiv.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 3000);
    }

    // 📋 留言板API
    async getGuestbook() {
        return this.get('/guestbook');
    }

    async submitGuestbook(data) {
        const result = await this.post('/guestbook', data);
        this.showSuccess('留言提交成功！审核通过后会显示。');
        return result;
    }

    // 😴 睡眠数据API
    async getSleepData() {
        return this.get('/sleep-data');
    }

    async submitSleepData(data) {
        const result = await this.post('/sleep-data', data);
        this.showSuccess('睡眠数据记录成功！');
        return result;
    }

    // 🎨 项目展示API
    async getProjects() {
        return this.get('/projects');
    }

    // 📧 联系表单API
    async submitContact(data) {
        const result = await this.post('/contact', data);
        this.showSuccess('联系信息已收到，我们会尽快回复！');
        return result;
    }

    // 🏥 健康检查
    async healthCheck() {
        return this.get('/health');
    }
}

// 🌍 创建全局API实例
const API = new APIManager();