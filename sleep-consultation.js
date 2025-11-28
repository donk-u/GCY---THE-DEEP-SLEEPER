// 🌐 睡眠咨询应用 - 前端交互逻辑
class SleepConsultationApp {
    constructor() {
        // 根据当前URL自动检测API基地址
        this.apiBase = window.location.protocol + '//' + window.location.hostname + 
            (window.location.port ? ':' + window.location.port : '');
            
        this.init();
    }

    // 🎬 初始化
    init() {
        this.initTabs();
        this.initContactForm();
        this.initSleepLogForm();
        this.initSleepTestForm();
        this.trackPageView();
        this.updateAnalytics();
        console.log('✅ 睡眠咨询应用初始化完成');
    }

    // 📱 标签页切换
    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const sections = document.querySelectorAll('.content-section');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // 更新按钮状态
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 更新内容区域
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetTab) {
                        section.classList.add('active');
                    }
                });
                
                // 追踪标签切换
                this.trackEvent('tab_switch', { targetTab });
            });
        });
    }

    // 💬 睡眠咨询表单
    initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('contactSubmitBtn');
            const originalText = submitBtn.innerHTML;
            
            // 禁用按钮，显示加载状态
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>提交中...</span><span>⏳</span>';
            
            try {
                const formData = {
                    name: document.getElementById('contactName').value.trim(),
                    email: document.getElementById('contactEmail').value.trim(),
                    consultationType: document.getElementById('consultationType').value,
                    message: document.getElementById('contactMessage').value.trim()
                };

                const result = await this.callAPI('contact', formData);
                
                if (result.success) {
                    this.showSuccess('咨询提交成功！我们会在24小时内回复您。');
                    form.reset();
                    this.updateAnalytics();
                } else {
                    this.showError('提交失败：' + result.error);
                }
                
            } catch (error) {
                this.showError('网络错误，请稍后重试');
                console.error('咨询提交错误:', error);
            } finally {
                // 恢复按钮状态
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // 📊 睡眠日志表单
    initSleepLogForm() {
        const form = document.getElementById('sleepLogForm');
        const scoreSlider = document.getElementById('sleepScore');
        const scoreValue = document.getElementById('scoreValue');
        
        if (!form) return;

        // 滑块实时显示
        scoreSlider.addEventListener('input', () => {
            scoreValue.textContent = scoreSlider.value;
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('sleepLogSubmitBtn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>记录中...</span><span>⏳</span>';
            
            try {
                const formData = {
                    userId: document.getElementById('logName').value.trim() || 'anonymous',
                    date: new Date().toISOString().split('T')[0], // 今天的日期 YYYY-MM-DD
                    bedtime: '22:00', // 默认入睡时间
                    wakeup: '06:00', // 默认起床时间
                    quality: parseInt(scoreSlider.value),
                    caffeine: 0, // 默认无咖啡因
                    notes: document.getElementById('sleepNote').value.trim()
                };

                const result = await this.callAPI('submit-sleep-log-v2', formData);
                
                if (result.success) {
                    this.showSuccess('睡眠记录成功！感谢您的分享。');
                    form.reset();
                    scoreValue.textContent = '7';
                    this.updateAnalytics();
                } else {
                    this.showError('记录失败：' + result.error);
                }
                
            } catch (error) {
                this.showError('网络错误，请稍后重试');
                console.error('睡眠日志记录错误:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // 🧪 睡眠测试表单
    initSleepTestForm() {
        const form = document.getElementById('sleepTestForm');
        const qualitySlider = document.getElementById('sleepQuality');
        const caffeineSlider = document.getElementById('caffeine');
        const qualityValue = document.getElementById('qualityValue');
        const caffeineValue = document.getElementById('caffeineValue');
        
        if (!form) return;

        // 滑块实时显示
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = qualitySlider.value;
        });
        
        caffeineSlider.addEventListener('input', () => {
            caffeineValue.textContent = caffeineSlider.value;
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('sleepTestSubmitBtn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>分析中...</span><span>⏳</span>';
            
            try {
                const formData = {
                    bedtime: document.getElementById('bedtime').value,
                    wakeup: document.getElementById('wakeup').value,
                    quality: parseInt(qualitySlider.value),
                    caffeine: parseInt(caffeineSlider.value)
                };

                const result = await this.callAPI('sleep-test', formData);
                
                if (result.success) {
                    this.displaySleepTestResult(result.data);
                    this.trackEvent('sleep_test_completed', { 
                        score: result.data.score,
                        level: result.data.level 
                    });
                } else {
                    this.showError('分析失败：' + result.error);
                }
                
            } catch (error) {
                this.showError('网络错误，请稍后重试');
                console.error('睡眠测试错误:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // 📊 显示睡眠测试结果
    displaySleepTestResult(data) {
        const resultDiv = document.getElementById('sleepTestResult');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const dreamType = document.getElementById('dreamType');
        const suggestion = document.getElementById('suggestion');
        const tipsList = document.getElementById('tipsList');
        
        // 更新显示内容
        scoreDisplay.textContent = data.score;
        dreamType.textContent = `🌙 ${data.dreamType}`;
        suggestion.textContent = data.suggestion;
        
        // 生成建议列表
        tipsList.innerHTML = data.tips.map(tip => 
            `<li>${tip}</li>`
        ).join('');
        
        // 显示结果区域
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 根据分数设置颜色
        if (data.score >= 85) {
            scoreDisplay.style.background = 'linear-gradient(45deg, #26de81, #20bf6b)';
        } else if (data.score >= 70) {
            scoreDisplay.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        } else {
            scoreDisplay.style.background = 'linear-gradient(45deg, #ff4757, #ff3742)';
        }
    }

    // 📡 API 调用
    async callAPI(functionName, data) {
        try {
            console.log(`🌐 调用云函数: ${functionName}`, data);
            
            const url = `${this.apiBase}/api/${functionName}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log('📥 API 响应:', result);
            
            if (result.code === 200) {
                return { success: true, data: result.data };
            } else {
                return { success: false, error: result.message };
            }
            
        } catch (error) {
            console.error('❌ API 调用失败:', error);
            return { success: false, error: '网络连接失败' };
        }
    }

    // 📊 用户行为追踪
    async trackEvent(eventName, data = {}) {
        try {
            const eventData = {
                event: eventName,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ...data
            };
            
            // 发送到 analytics 集合
            await this.callAPI('analytics', eventData);
        } catch (error) {
            console.log('追踪失败（非致命）:', error.message);
        }
    }

    trackPageView() {
        this.trackEvent('page_view', {
            page: 'sleep_consultation',
            referrer: document.referrer || 'direct'
        });
    }

    // 📈 更新分析数据
    async updateAnalytics() {
        try {
            // 获取统计数据（这里可以实现相应的云函数）
            const totalLogs = document.getElementById('totalLogs');
            const avgScore = document.getElementById('avgScore');
            const totalConsultations = document.getElementById('totalConsultations');
            const todayVisits = document.getElementById('todayVisits');
            
            // 显示模拟数据（实际应该从后端获取）
            if (totalLogs) totalLogs.textContent = Math.floor(Math.random() * 100) + 20;
            if (avgScore) avgScore.textContent = (Math.random() * 3 + 6).toFixed(1);
            if (totalConsultations) totalConsultations.textContent = Math.floor(Math.random() * 50) + 10;
            if (todayVisits) todayVisits.textContent = Math.floor(Math.random() * 30) + 5;
            
        } catch (error) {
            console.error('更新统计数据失败:', error);
        }
    }

    // 🔔 用户提示
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // 自动消失
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, type === 'success' ? 3000 : 5000);
    }
}

// 🎨 添加 Toast 样式
const toastStyles = `
<style>
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
}

.toast-success {
    background: linear-gradient(135deg, #26de81, #20bf6b);
}

.toast-error {
    background: linear-gradient(135deg, #ff4757, #ff3742);
}

.toast-content {
    padding: 12px 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    color: white;
    font-weight: 500;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
`;

// 注入样式
document.head.insertAdjacentHTML('beforeend', toastStyles);

// 🌍 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new SleepConsultationApp();
});