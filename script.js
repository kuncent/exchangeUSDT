// DOM元素获取
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const buyAmountInput = document.getElementById('buy-amount');
const receiveAmountInput = document.getElementById('receive-amount');
const submitOrderBtn = document.getElementById('submit-order');
const announcementBanner = document.querySelector('.announcement-banner');
// 初始化汇率（根据目标网站，初始汇率为0）
let currentRate = 0;
// 存储所有订单数据
let allOrders = [];
// 当前下发记录最大数量
const MAX_CURRENT_ORDERS = 10;

// 生成唯一订单号
function generateOrderId() {
    const now = new Date();
    const timestamp = now.getTime();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${random}`;
}

// 生成模拟订单数据
function generateOrder(customDate = null) {
    // 生成buyAmount：
    // 1. 60%概率：大于20小于1000
    // 2. 40%概率：大于等于1000小于5000
    // 3. 每个范围内70%概率是10的倍数
    let buyAmount;
    
    if (Math.random() < 0.6) {
        // 60%概率：大于20小于1000
        if (Math.random() < 0.7) {
            // 70%概率：10的倍数，范围 [30, 990]
            buyAmount = Math.floor(Math.random() * (960 / 10) + 3) * 10;
        } else {
            // 30%概率：非10的倍数，范围 (20, 1000)
            buyAmount = Math.floor(Math.random() * 979 + 21);
        }
    } else {
        // 40%概率：大于等于1000小于5000
        if (Math.random() < 0.7) {
            // 70%概率：10的倍数，范围 [1000, 4990]
            buyAmount = Math.floor(Math.random() * (3990 / 10) + 100) * 10;
        } else {
            // 30%概率：非10的倍数，范围 [1000, 5000)
            buyAmount = Math.floor(Math.random() * 3999 + 1000);
        }
    }
    
    // 生成receiveAmount：根据buyAmount乘以随机倍数（1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4），允许小数
    const multiples = [1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4];
    const randomMultiple = multiples[Math.floor(Math.random() * multiples.length)];
    const calculateReceiveAmount = (amount, multiple) => {
        const result = amount * multiple;
        // 保留两位小数，允许小数存在
        return parseFloat(result.toFixed(2));
    };
    let receiveAmount = calculateReceiveAmount(buyAmount, randomMultiple);
    
    const orderDate = customDate || new Date();
    const time = orderDate.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    return {
        id: generateOrderId(),
        buyAmount: buyAmount.toString(), // 不要小數
        receiveAmount: receiveAmount.toString(), // 不要小數
        rate: (buyAmount / receiveAmount).toFixed(2),
        status: '處理中',
        time
    };
}

// 初始化生成10条当前下发记录和10条历史下发记录
function initOrders() {
    // 清空现有订单
    allOrders = [];
    const now = new Date();
    
    // 生成10條處理中狀態的訂單，每條間隔20秒
    for (let i = 0; i < 10; i++) {
        // 每條訂單的時間比前一條早20秒
        const orderDate = new Date(now.getTime() - i * 20000);
        allOrders.push(generateOrder(orderDate));
    }
    
    // 生成10條已完成狀態的歷史訂單，每條間隔20秒，時間比當前記錄更早
    for (let i = 0; i < 10; i++) {
        // 每條歷史訂單的時間比前一條早20秒，且比當前記錄最早的還要早
        const orderDate = new Date(now.getTime() - (i + 10) * 20000);
        const historyOrder = generateOrder(orderDate);
        historyOrder.status = '已完成';
        allOrders.push(historyOrder);
    }
}

// 标签页切换功能
function initTabSwitching() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // 移除所有活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 添加当前活动状态
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// 主导航菜单切换功能
function initNavMenuSwitching() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            // 添加当前活动状态
            link.classList.add('active');
        });
    });
}

// 更新汇率信息
function updateRates() {
    const activeSidebarLink = document.querySelector('.sidebar-menu a.active');
    const rateValues = document.querySelectorAll('.rate-value');
    const rateExamples = document.querySelectorAll('.rate-example p:nth-child(2)');
    const rateResults = document.querySelectorAll('.rate-example p:nth-child(3)');
    
    if (!activeSidebarLink || rateValues.length === 0) return;
    
    // 根据当前选中的菜单项设置不同的汇率
    let rates;
    switch (activeSidebarLink.textContent) {
        case '骇客盗取':
            rates = [1.20, 1.30, 1.40];
            break;
        case '电闸网闸':
            rates = [1.15, 1.20, 1.25];
            break;
        case '菠菜色播':
            rates = [1.10, 1.15, 1.20];
            break;
        default:
            rates = [1.10, 1.20, 1.30]; // 默认汇率
    }
    
    // 更新汇率值
    rateValues.forEach((rateValue, index) => {
        if (rates[index] !== undefined) {
            rateValue.textContent = `匯率${rates[index].toFixed(2)}`;
        }
    });
    
    // 更新示例计算
    const examples = [
        { amount: 50, label: '假設您下單50USDT' },
        { amount: 200, label: '假設您下單200USDT' },
        { amount: 500, label: '假設您下單500USDT' }
    ];
    
    examples.forEach((example, index) => {
        if (rates[index] !== undefined && rateExamples[index] && rateResults[index]) {
            const result = example.amount * rates[index];
            rateExamples[index].textContent = `${example.amount} × ${rates[index].toFixed(2)} = ${result.toFixed(2)}`;
            rateResults[index].textContent = `您將收到${result.toFixed(2)}USDT`;
        }
    });
}

// 更新order-header的h3标签文本
function updateOrderHeaderTitle() {
    const activeSidebarLink = document.querySelector('.sidebar-menu a.active');
    const orderHeaderH3 = document.querySelector('.order-header h3');
    if (activeSidebarLink && orderHeaderH3) {
        orderHeaderH3.textContent = activeSidebarLink.textContent;
    }
}

// 左侧边栏菜单切换功能
function initSidebarMenuSwitching() {
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    const addressElement = document.getElementById('current-adress');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // 移除所有活动状态
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // 添加当前活动状态
            link.classList.add('active');
            // 更新order-header的h3标签文本
            updateOrderHeaderTitle();
            // 更新汇率信息
            updateRates();
            // 重新计算当前输入的金额
            const currentAmount = parseFloat(buyAmountInput.value) || 0;
            if (currentAmount > 0) {
                const rate = getRateForAmount(currentAmount);
                const result = (currentAmount * rate).toFixed(2);
                receiveAmountInput.value = result;
            }
            
            // 更新current-adress地址
            if (addressElement) {
                let newAddress;
                switch (link.textContent) {
                    case '骇客盗取':
                        newAddress = 'TRFTScdiWtK31A982srPm3dRe6AUvHp3qD';
                        break;
                    case '电闸网闸':
                        newAddress = 'TGCy2MqKpGBvc7gAnFkiSVo8Rb5qKFsJTu';
                        break;
                    case '菠菜色播':
                        newAddress = 'TSE8MGE6hqozMNC2c5tNgMH9Qr1bAfGjqJ';
                        break;
                    default:
                        newAddress = 'TRFTScdiWtK31A982srPm3dRe6AUvHp3qD'; // 默认地址
                }
                
                // 保存完整地址到data属性
                addressElement.setAttribute('data-full-address', newAddress);
                
                // 显示为前8位+...+后8位的格式
                if (newAddress.length > 16) {
                    const shortAddress = `${newAddress.substring(0, 8)}...${newAddress.substring(newAddress.length - 8)}`;
                    addressElement.textContent = shortAddress;
                } else {
                    addressElement.textContent = newAddress;
                }
            }
        });
    });
}

// 初始化order-header的h3标签文本
function initOrderHeaderTitle() {
    updateOrderHeaderTitle();
}

// 初始化地址显示和复制功能
function initAddressDisplay() {
    const addressElement = document.getElementById('current-adress');
    const copyButton = document.getElementById('copy-address-btn');
    const activeSidebarLink = document.querySelector('.sidebar-menu a.active');
    
    if (addressElement) {
        // 根据当前选中的菜单项设置地址
        let fullAddress;
        if (activeSidebarLink) {
            switch (activeSidebarLink.textContent) {
                case '骇客盗取':
                    fullAddress = 'TRFTScdiWtK31A982srPm3dRe6AUvHp3qD';
                    break;
                case '电闸网闸':
                    fullAddress = 'TGCy2MqKpGBvc7gAnFkiSVo8Rb5qKFsJTu';
                    break;
                case '菠菜色播':
                    fullAddress = 'TSE8MGE6hqozMNC2c5tNgMH9Qr1bAfGjqJ';
                    break;
                default:
                    fullAddress = 'TRFTScdiWtK31A982srPm3dRe6AUvHp3qD'; // 默认地址
            }
        } else {
            // 从HTML中获取原始地址
            fullAddress = addressElement.textContent;
        }
        
        // 保存完整地址到data属性
        addressElement.setAttribute('data-full-address', fullAddress);
        
        // 强制显示为前8位+...+后8位的格式
        if (fullAddress.length > 16) {
            const shortAddress = `${fullAddress.substring(0, 8)}...${fullAddress.substring(fullAddress.length - 8)}`;
            addressElement.textContent = shortAddress;
        }
        
        // 添加复制按钮点击事件
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                // 获取完整地址
                const fullAddress = addressElement.getAttribute('data-full-address');
                const displayAddress = addressElement.textContent;
                const addressToCopy = fullAddress || displayAddress;
                
                // 确保有地址可以复制
                if (!addressToCopy) {
                    console.error('没有地址可以复制');
                    return;
                }
                
                // 使用简化的复制方法，确保兼容性
                const copyToClipboard = (text) => {
                    // 创建临时textarea元素
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    textarea.style.position = 'fixed';
                    textarea.style.left = '-999999px';
                    textarea.style.top = '-999999px';
                    document.body.appendChild(textarea);
                    
                    // 选择并复制文本
                    textarea.focus();
                    textarea.select();
                    
                    try {
                        // 执行复制命令
                        const successful = document.execCommand('copy');
                        if (successful) {
                            return Promise.resolve();
                        } else {
                            return Promise.reject(new Error('复制命令执行失败'));
                        }
                    } catch (err) {
                        return Promise.reject(err);
                    } finally {
                        // 移除临时元素
                        document.body.removeChild(textarea);
                    }
                };
                
                // 执行复制
                copyToClipboard(addressToCopy)
                    .then(() => {
                        // 复制成功，添加临时提示
                        const originalText = copyButton.textContent;
                        copyButton.textContent = '已複製';
                        copyButton.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
                        
                        // 2秒后恢复原状态
                        setTimeout(() => {
                            copyButton.textContent = originalText;
                            copyButton.style.background = '';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('复制失败:', err);
                        alert('复制失败，请手动复制地址：' + addressToCopy);
                    });
            });
        }
    }
}

// 获取当前汇率组
function getCurrentRates() {
    const activeSidebarLink = document.querySelector('.sidebar-menu a.active');
    
    if (!activeSidebarLink) {
        return [1.10, 1.20, 1.30]; // 默认汇率
    }
    
    // 根据当前选中的菜单项设置不同的汇率
    switch (activeSidebarLink.textContent) {
        case '骇客盗取':
            return [1.20, 1.30, 1.40];
        case '电闸网闸':
            return [1.15, 1.20, 1.25];
        case '菠菜色播':
            return [1.10, 1.15, 1.20];
        default:
            return [1.10, 1.20, 1.30]; // 默认汇率
    }
}

// 根据金额获取当前汇率
function getRateForAmount(amount) {
    const rates = getCurrentRates();
    
    // 根据金额范围选择不同的汇率
    if (amount >= 1000) {
        return rates[2]; // 1000USDT以上
    } else if (amount >= 200) {
        return rates[1]; // 200-1000USDT
    } else {
        return rates[0]; // 20-199USDT
    }
}

// 汇率计算功能
function initRateCalculation() {
    // 监听购买金额输入变化
    buyAmountInput.addEventListener('input', () => {
        const amount = parseFloat(buyAmountInput.value) || 0;
        
        if (amount <= 0) {
            receiveAmountInput.value = '';
            return;
        }
        
        // 根据金额获取当前汇率
        const rate = getRateForAmount(amount);
        
        // 计算收到金额
        const result = (amount * rate).toFixed(2);
        receiveAmountInput.value = result;
    });
    
    // 初始化时计算一次（如果有默认值）
    const initialAmount = parseFloat(buyAmountInput.value) || 0;
    if (initialAmount > 0) {
        const rate = getRateForAmount(initialAmount);
        const result = (initialAmount * rate).toFixed(2);
        receiveAmountInput.value = result;
    }
}

// 自定义提示框功能
function initCustomAlert() {
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const alertConfirm = document.getElementById('alertConfirm');
    
    // 显示自定义提示框
    window.showAlert = function(message) {
        alertMessage.textContent = message;
        customAlert.classList.add('active');
    };
    
    // 隐藏自定义提示框
    function hideAlert() {
        customAlert.classList.remove('active');
    }
    
    // 确认按钮点击事件
    if (alertConfirm) {
        alertConfirm.addEventListener('click', hideAlert);
    }
    
    // 点击提示框外部关闭
    if (customAlert) {
        customAlert.addEventListener('click', (e) => {
            if (e.target === customAlert) {
                hideAlert();
            }
        });
    }
}

// 表单提交功能
function initFormSubmission() {
    if (submitOrderBtn) {
        submitOrderBtn.addEventListener('click', () => {
            const buyAmount = parseFloat(buyAmountInput.value) || 0;
            
            if (buyAmount <= 0) {
                showAlert('請輸入有效的購買金額');
                return;
            }
            
            // 驗證金額是否大於20
    if (buyAmount < 20) {
        showAlert('金額小於20無法提交訂單');
        return;
    }
    
    // 模擬訂單提交
    showAlert('您的訂單已提交，請複製地址，轉入提交相同金額的USDT');
            
            // 重置表單
            buyAmountInput.value = '';
            receiveAmountInput.value = '';
        });
    }
}


// 公告横幅点击事件 - 显示/隐藏悬浮说明框
function initAnnouncementClick() {
    const tooltip = document.querySelector('.announcement-tooltip');
    const backdrop = document.querySelector('.tooltip-backdrop');
    
    // 显示/隐藏悬浮说明框和遮罩层
    const toggleTooltip = () => {
        tooltip.classList.toggle('active');
        backdrop.classList.toggle('active');
    };
    
    // 关闭悬浮说明框和遮罩层
    const closeTooltip = () => {
        tooltip.classList.remove('active');
        backdrop.classList.remove('active');
    };
    
    announcementBanner.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTooltip();
    });
    
    // 关闭按钮点击事件
    const closeTooltipBtn = document.querySelector('.close-tooltip');
    if (closeTooltipBtn) {
        closeTooltipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTooltip();
        });
    }
    
    // 点击遮罩层关闭悬浮说明框
    backdrop.addEventListener('click', () => {
        closeTooltip();
    });
    
    // 点击页面其他地方关闭悬浮说明框
    document.addEventListener('click', (e) => {
        if (!tooltip.contains(e.target) && e.target !== announcementBanner) {
            closeTooltip();
        }
    });
    
    // 点击悬浮说明框内部不关闭
    tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// 渲染订单数据
function renderOrders() {
    const currentOrdersContainer = document.getElementById('current-records');
    const historyOrdersContainer = document.getElementById('history-records');
    
    // 渲染当前下发记录（處理中状态），最多显示10条
    const currentOrders = allOrders.filter(order => order.status === '處理中').slice(0, 10);
    currentOrdersContainer.innerHTML = currentOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.buyAmount}</td>
            <td>${order.receiveAmount} USDT</td>
            <td style="color: #ff9800;">${order.status}</td>
            <td>${order.time}</td>
        </tr>
    `).join('');
    
    // 渲染歷史下發記錄（已完成狀態），最多顯示10條
    const historyOrders = allOrders.filter(order => order.status === '已完成').slice(0, 10);
    historyOrdersContainer.innerHTML = historyOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.buyAmount}</td>
            <td>${order.receiveAmount} USDT</td>
            <td style="color: #4caf50;">${order.status}</td>
            <td>${order.time}</td>
        </tr>
    `).join('');
}

// 生成新订单并插入到第一条
function generateNewOrder() {
    const newOrder = generateOrder();
    // 插入到数组开头
    allOrders.unshift(newOrder);
    
    // 检查当前下发记录数量，使用正确的繁体中文状态
    const currentOrders = allOrders.filter(order => order.status === '處理中');
    if (currentOrders.length > MAX_CURRENT_ORDERS) {
        // 将最老的当前记录转为历史记录
        // 先找到所有当前记录，然后将最后一条转为历史记录
        const currentOrderIndices = [];
        for (let i = 0; i < allOrders.length; i++) {
            if (allOrders[i].status === '處理中') {
                currentOrderIndices.push(i);
            }
        }
        
        // 如果当前记录数量超过最大值，将最老的那条转为历史记录
        if (currentOrderIndices.length > MAX_CURRENT_ORDERS) {
            // 最老的当前记录是currentOrderIndices数组中的最后一个元素
            const oldestCurrentOrderIndex = currentOrderIndices[currentOrderIndices.length - 1];
            // 获取最老的当前记录
            const oldestCurrentOrder = allOrders[oldestCurrentOrderIndex];
            // 将状态改为已完成
            oldestCurrentOrder.status = '已完成';
            // 更新时间为当前时间
            oldestCurrentOrder.time = new Date().toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            // 从原位置删除
            allOrders.splice(oldestCurrentOrderIndex, 1);
            // 插入到数组开头，使其作为最新的历史记录显示在第一条
            allOrders.unshift(oldestCurrentOrder);
        }
    }
    
    // 重新渲染订单
    renderOrders();
}

// 定时生成新订单（随机20秒内）
function startAutoGenerateOrders() {
    function generateNextOrder() {
        generateNewOrder();
        // 随机0-10秒后生成下一条
        const randomDelay = Math.floor(Math.random() * 10000);
        setTimeout(generateNextOrder, randomDelay);
    }
    
    // 等待随机时间后开始生成，而不是立即生成
    const initialDelay = Math.floor(Math.random() * 10000);
    setTimeout(generateNextOrder, initialDelay);
}

// 初始化所有功能
function init() {
    // 初始化生成10條當前下發記錄
    initOrders();
    
    initTabSwitching();
    initSidebarMenuSwitching();
    initRateCalculation();
    initFormSubmission();
    initAnnouncementClick();
    initAddressDisplay(); // 初始化地址顯示和複製功能
    initCustomAlert(); // 初始化自定義提示框
    renderOrders();
    
    // 更新匯率信息
    updateRates();
    
    // 啟動自動生成訂單
    startAutoGenerateOrders();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 添加一些交互效果
window.addEventListener('load', () => {
    // 为所有按钮添加点击波纹效果
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 创建波纹元素
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            // 添加波纹到按钮
            this.appendChild(ripple);
            
            // 移除波纹
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // 为输入框添加聚焦效果
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});

// 添加波纹CSS样式
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    </style>
`);