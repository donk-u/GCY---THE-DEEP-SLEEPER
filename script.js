// 🎬 页面加载完成
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// 图片加载检测
function waitForImages() {
    const images = document.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;
    
    if (totalImages === 0) {
        return Promise.resolve();
    }
    
    return new Promise((resolve) => {
        let resolved = false;
        
        images.forEach((img) => {
            if (img.complete && img.naturalHeight !== 0) {
                loadedCount++;
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    if (loadedCount === totalImages && !resolved) {
                        resolved = true;
                        resolve();
                    }
                });
                img.addEventListener('error', () => {
                    loadedCount++;
                    if (loadedCount === totalImages && !resolved) {
                        resolved = true;
                        resolve();
                    }
                });
            }
        });
        
        // 如果所有图片都已加载完成
        if (loadedCount === totalImages && !resolved) {
            resolved = true;
            resolve();
        }
        
        // 超时保护：3秒后无论如何都继续
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                resolve();
            }
        }, 3000);
    });
}

// 使用多种方式确保加载动画消失
window.addEventListener('load', async () => {
    await waitForImages();
    setTimeout(hideLoader, 500);
    initAll();
});

// 如果load事件未触发，使用DOMContentLoaded作为备选
document.addEventListener('DOMContentLoaded', async () => {
    // 设置超时，确保即使资源加载失败也会隐藏加载动画
    setTimeout(async () => {
        await waitForImages();
        hideLoader();
        initAll();
    }, 2000);
});

function initAll() {
    try {
        initTypewriter();
        initScrollAnimations();
        initMobileMenu();
        initProfileInteraction();
        initStatsCounter();
        initCTAButton();
        initSleepSliders();
    } catch (error) {
        console.error('初始化错误:', error);
        // 即使出错也隐藏加载动画
        hideLoader();
    }
}

// 🎯 CTA按钮功能
function initCTAButton() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

// 😴 睡眠滑块实时更新
function initSleepSliders() {
    const durationSlider = document.getElementById('sleepDuration');
    const qualitySlider = document.getElementById('sleepQuality');
    const durationValue = document.getElementById('durationValue');
    const qualityValue = document.getElementById('qualityValue');
    
    if (durationSlider && durationValue) {
        durationSlider.addEventListener('input', () => {
            durationValue.textContent = `${durationSlider.value}h`;
        });
    }
    
    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = qualitySlider.value;
        });
    }
}

// ✍️ 打字机效果
function initTypewriter() {
    const subtitle = "睡眠工程师 · 梦境架构师";
    const subtitleElement = document.getElementById('subtitle');
    if (!subtitleElement) return;
    
    let i = 0;
    const timer = setInterval(() => {
        if (i < subtitle.length) {
            subtitleElement.textContent += subtitle[i];
            i++;
        } else {
            clearInterval(timer);
        }
    }, 80);
}

// 📈 数字滚动动画
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                animateNumber(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

// ✅ 弹性缓动函数
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function animateNumber(element, target) {
    const suffix = target === 7300 ? '+' : target === 20 ? '+' : '';
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        
        const current = target * eased;
        element.textContent = Math.floor(current) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = target + suffix;
        }
    };
    
    requestAnimationFrame(animate);
}

// 🔄 滚动动画
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.stat-item, .service-item, .portfolio-item').forEach(el => {
        observer.observe(el);
    });
}

// 📱 移动端菜单
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    
    btn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    });
}

// 🖱️ 头像交互
function initProfileInteraction() {
    const profileImg = document.getElementById('profileImg');
    if (!profileImg) return;
    
    // 检查图片是否加载成功
    if (profileImg.complete && profileImg.naturalHeight !== 0) {
        setupProfileInteraction(profileImg);
    } else {
        // 等待图片加载
        profileImg.addEventListener('load', () => {
            setupProfileInteraction(profileImg);
        });
        
        // 如果图片加载失败，设置超时处理
        profileImg.addEventListener('error', () => {
            console.warn('头像图片加载失败，跳过交互效果');
            // 可以在这里设置一个默认占位符
            if (profileImg.style.display === 'none') {
                profileImg.parentElement.style.display = 'none';
            }
        });
        
        // 超时保护：5秒后如果还没加载完成，就跳过交互设置
        setTimeout(() => {
            if (profileImg.complete && profileImg.naturalHeight !== 0) {
                setupProfileInteraction(profileImg);
            }
        }, 5000);
    }
}

function setupProfileInteraction(profileImg) {
    if (!profileImg || profileImg.style.display === 'none') return;
    
    profileImg.addEventListener('click', () => {
        profileImg.style.transform = 'scale(1.1) rotate(5deg)';
        setTimeout(() => {
            profileImg.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
    });
    
    // 鼠标跟随光效
    document.addEventListener('mousemove', (e) => {
        if (profileImg.style.display === 'none') return;
        
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        const intensity = 0.3 + (x + y) * 0.2;
        
        profileImg.style.boxShadow = `
            ${(x - 0.5) * 20}px ${(y - 0.5) * 20}px 30px rgba(0, 0, 0, 0.5),
            0 0 30px rgba(99, 102, 241, ${intensity})
        `;
    });
}

// 🎯 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// 😴 睡眠模式：页面闲置3分钟后进入"睡眠模式"
let sleepTimer;
function resetSleepTimer() {
    clearTimeout(sleepTimer);
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = '<span class="title-line">DEEP SLEEPER</span><span class="title-line highlight">SLEEP ENGINEER</span>';
    }
    document.body.style.filter = '';
    
    sleepTimer = setTimeout(() => {
        document.body.style.filter = 'blur(2px) brightness(0.5)';
        if (heroTitle) {
            heroTitle.innerHTML = '<span class="title-line highlight">Zzz...</span>';
        }
    }, 180000); // 3分钟
}

document.addEventListener('mousemove', resetSleepTimer);
document.addEventListener('keypress', resetSleepTimer);
document.addEventListener('scroll', resetSleepTimer);
resetSleepTimer(); // 初始化

// 📊 睡眠指数显示
function updateSleepIndex() {
    const sleepIndexEl = document.querySelector('.sleep-index');
    if (!sleepIndexEl) return;
    
    const now = new Date();
    const hour = now.getHours();
    let sleepIndex;
    
    if (hour >= 22 || hour <= 6) {
        sleepIndex = "深度睡眠黄金期";
    } else if (hour >= 13 && hour <= 14) {
        sleepIndex = "午休能量补给站";
    } else {
        sleepIndex = "清醒状态";
    }
    
    sleepIndexEl.textContent = `此刻：${sleepIndex}`;
}

// 初始化睡眠指数
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateSleepIndex();
        setInterval(updateSleepIndex, 60000);
    });
} else {
    updateSleepIndex();
    setInterval(updateSleepIndex, 60000);
}