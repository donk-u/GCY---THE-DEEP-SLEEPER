// 🎯 前端交互功能 - 连接后端API

class FrontendInteractions {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // 等待DOM完全加载
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            await this.testBackendConnection();
            this.initGuestbook();
            this.initSleepTracker();
            this.initProjectInteractions();
            this.initContactForm();
            this.initMobileMenu();
            console.log('✅ 前端交互功能初始化完成');
        } catch (error) {
            console.error('❌ 前端交互初始化失败:', error);
        }
    }

    // 🌐 测试后端连接
    async testBackendConnection() {
        try {
            await API.healthCheck();
            console.log('🎉 后端连接正常');
        } catch (error) {
            console.warn('⚠️ 后端连接失败，使用本地模式');
            API.showError('后端服务未启动，数据将保存在本地');
        }
    }

    // 💬 留言板功能
    initGuestbook() {
        const form = document.getElementById('guestbookForm');
        if (!form) return;

        // 表单提交
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.form-button');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>提交中...</span><span>⏳</span>';

            try {
                const formData = {
                    name: document.getElementById('guestName').value.trim(),
                    email: document.getElementById('guestEmail').value.trim(),
                    message: document.getElementById('guestMessage').value.trim()
                };

                await API.submitGuestbook(formData);
                form.reset();
                await this.loadGuestbookMessages();

            } catch (error) {
                console.error('留言提交失败:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>提交留言</span><span>📝</span>';
            }
        });

        // 加载现有留言
        this.loadGuestbookMessages();
    }

    // 📋 加载留言列表
    async loadGuestbookMessages() {
        try {
            const response = await API.getGuestbook();
            const messagesContainer = document.getElementById('guestbookMessages');
            
            if (!messagesContainer) return;

            if (response.success && response.data && response.data.length > 0) {
                messagesContainer.innerHTML = response.data.map(msg => `
                    <div class="guestbook-message">
                        <div class="message-header">
                            <strong class="message-name">${this.escapeHtml(msg.name)}</strong>
                            <span class="message-date">${new Date(msg.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p class="message-content">${this.escapeHtml(msg.message)}</p>
                    </div>
                `).join('');
            } else {
                messagesContainer.innerHTML = '<p class="no-messages">暂无留言，快来抢沙发吧！</p>';
            }
        } catch (error) {
            const messagesContainer = document.getElementById('guestbookMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '<p class="no-messages">留言加载失败，请刷新重试</p>';
            }
        }
    }

    // 😴 睡眠记录功能
    initSleepTracker() {
        const form = document.getElementById('sleepForm');
        const durationSlider = document.getElementById('sleepDuration');
        const qualitySlider = document.getElementById('sleepQuality');
        const durationValue = document.getElementById('durationValue');
        const qualityValue = document.getElementById('qualityValue');

        if (!form) return;

        // 滑块实时显示
        durationSlider.addEventListener('input', () => {
            durationValue.textContent = `${durationSlider.value}h`;
        });

        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = qualitySlider.value;
        });

        // 表单提交
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.form-button');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>记录中...</span><span>⏳</span>';

            try {
                const sleepData = {
                    duration: parseFloat(durationSlider.value),
                    quality: parseInt(qualitySlider.value),
                    notes: document.getElementById('sleepNotes').value.trim(),
                    userId: 'web_user'
                };

                await API.submitSleepData(sleepData);
                form.reset();
                durationValue.textContent = '7.0h';
                qualityValue.textContent = '7';
                
                // 重新加载统计数据
                await this.loadSleepStats();

            } catch (error) {
                console.error('睡眠记录失败:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>记录睡眠</span><span>💤</span>';
            }
        });

        // 加载统计数据
        this.loadSleepStats();
    }

    // 📊 加载睡眠统计
    async loadSleepStats() {
        try {
            const response = await API.getSleepData();
            
            if (response.success && response.data && response.data.stats) {
                const stats = response.data.stats;
                
                document.getElementById('totalSleeps').textContent = stats.totalSleeps || 0;
                document.getElementById('avgDuration').textContent = stats.averageDuration || 0;
                document.getElementById('avgQuality').textContent = stats.averageQuality || 0;
            }
        } catch (error) {
            console.error('睡眠统计加载失败:', error);
        }
    }

    // 🎨 项目展示功能
    initProjectInteractions() {
        // 为项目卡片添加点击事件
        const projectCards = document.querySelectorAll('.portfolio-item');
        
        projectCards.forEach((card, index) => {
            // 添加悬停效果
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.3s ease';
            
            // 鼠标悬停效果
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });

            // 点击卡片查看详情
            card.addEventListener('click', (e) => {
                // 如果点击的是链接，不阻止默认行为
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    return;
                }
                e.preventDefault();
                this.viewProjectDetails(index);
            });
        });

        // 加载项目数据
        this.loadProjects();
    }

    // 📋 加载项目数据
    async loadProjects() {
        try {
            const response = await API.getProjects();
            
            if (response.success && response.data) {
                console.log('✅ 项目数据加载成功:', response.data);
                // 这里可以根据后端数据更新项目展示
            }
        } catch (error) {
            console.error('项目数据加载失败:', error);
        }
    }

    // 🔍 查看项目详情
    viewProjectDetails(index) {
        const projects = document.querySelectorAll('.portfolio-item');
        const project = projects[index];
        
        if (!project) return;

        const title = project.querySelector('h3').textContent;
        const description = project.querySelector('p').textContent;
        const tags = Array.from(project.querySelectorAll('.tag')).map(tag => tag.textContent);
        
        // 创建详情弹窗
        this.showModal('项目详情', `
            <div style="color: white;">
                <h3 style="margin-bottom: 16px; font-size: 24px;">${title}</h3>
                <p style="margin-bottom: 16px; line-height: 1.6; opacity: 0.9;">${description}</p>
                <div style="margin-bottom: 20px;">
                    <strong style="display: block; margin-bottom: 8px;">标签：</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${tags.map(tag => `<span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px; font-size: 14px;">${tag}</span>`).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 24px;">
                    <button class="form-button" onclick="interactions.shareProject(${index})" style="flex: 1;">分享项目</button>
                    <button class="form-button" onclick="interactions.closeModal()" style="flex: 1; background: rgba(255,255,255,0.2);">关闭</button>
                </div>
            </div>
        `);
    }

    // 🔗 分享项目
    shareProject(index) {
        const projects = document.querySelectorAll('.portfolio-item');
        const project = projects[index];
        
        if (!project) return;

        const title = project.querySelector('h3').textContent;
        const shareText = `来看看这个超酷的项目：${title}`;
        const shareUrl = window.location.href + '#portfolio';
        
        if (navigator.share) {
            navigator.share({
                title: title,
                text: shareText,
                url: shareUrl
            }).catch(err => {
                console.log('分享取消或失败:', err);
            });
        } else {
            // 复制到剪贴板
            const fullText = `${shareText}\n${shareUrl}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(fullText).then(() => {
                    API.showSuccess('分享链接已复制到剪贴板！');
                }).catch(() => {
                    this.fallbackCopy(fullText);
                });
            } else {
                this.fallbackCopy(fullText);
            }
        }
    }
    
    // 备用复制方法
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            API.showSuccess('分享链接已复制到剪贴板！');
        } catch (err) {
            API.showError('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    }

    // 📱 移动端菜单功能
    initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        if (!btn || !sidebar) return;
        
        // 确保按钮有aria属性
        btn.addEventListener('click', () => {
            const isActive = sidebar.classList.contains('active');
            sidebar.classList.toggle('active');
            btn.setAttribute('aria-expanded', !isActive);
        });
        
        // 点击外部区域关闭菜单
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !btn.contains(e.target)) {
                sidebar.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 📧 联系表单功能
    initContactForm() {
        const contactLinks = document.querySelectorAll('.contact-link');
        
        contactLinks.forEach(link => {
            // 邮箱链接已经在HTML中绑定了copyEmail函数，这里只处理其他链接
            if (!link.textContent.includes('@')) {
                // GitHub和WeChat链接保持默认行为
                link.addEventListener('click', (e) => {
                    // 如果链接是#，阻止默认行为并显示提示
                    if (link.getAttribute('href') === '#' || link.getAttribute('href') === 'https://github.com/sleeper' || link.getAttribute('href') === 'https://wechat.com/sleeper') {
                        e.preventDefault();
                        this.showModal('联系我', `
                            <div style="color: white;">
                                <p style="margin-bottom: 16px;">您可以通过以下方式联系我：</p>
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <a href="mailto:1762079094@qq.com" style="color: white; text-decoration: underline;">📧 邮箱：1762079094@qq.com</a>
                                    <p style="opacity: 0.8;">💬 微信：请通过邮箱联系获取</p>
                                    <p style="opacity: 0.8;">🐙 GitHub：正在建设中...</p>
                                </div>
                                <div style="margin-top: 20px;">
                                    <button class="form-button" onclick="interactions.closeModal()">关闭</button>
                                </div>
                            </div>
                        `);
                    }
                });
            }
        });
    }

    // 📨 处理联系表单提交
    async handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            await API.submitContact(contactData);
            this.closeModal();
            
            // 打开邮件客户端
            window.location.href = `mailto:1762079094@qq.com?subject=${encodeURIComponent('来自网站的联系消息')}&body=${encodeURIComponent(`姓名：${contactData.name}\n邮箱：${contactData.email}\n\n${contactData.message}`)}`;
            
        } catch (error) {
            console.error('联系表单提交失败:', error);
        }
    }

    // 🎭 弹窗功能
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="interactions.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    // 🛡️ HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 🎨 添加弹窗样式
const modalStyles = `
    <style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    }
    
    .modal-content {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 16px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 24px 0;
        color: white;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 24px;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .modal-body {
        padding: 24px;
        color: white;
    }
    
    .modal-body .form-input,
    .modal-body .form-textarea {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
        color: white;
    }
    
    .modal-body .form-input::placeholder,
    .modal-body .form-textarea::placeholder {
        color: rgba(255, 255, 255, 0.7);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .guestbook-message {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        backdrop-filter: blur(10px);
    }
    
    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .message-name {
        color: #667eea;
        font-weight: 600;
    }
    
    .message-date {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
    }
    
    .message-content {
        margin: 0;
        line-height: 1.5;
    }
    
    .no-messages {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
    }
    </style>
`;

// 注入样式
document.head.insertAdjacentHTML('beforeend', modalStyles);

// 🌍 创建全局交互实例（延迟初始化，确保DOM已加载）
let interactions;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        interactions = new FrontendInteractions();
        window.interactions = interactions; // 确保全局可访问
    });
} else {
    interactions = new FrontendInteractions();
    window.interactions = interactions; // 确保全局可访问
}