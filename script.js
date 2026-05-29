// 核心設定與變數
const targetNumber = "0987654321";
let currentInputNumber = "";
let isPhoneCompleted = false; 
let currentActiveChat = null;

// 聊天室食安文本資料
const chatData = [
    {
        id: 1,
        sender: "網紅【生活小妙招】",
        avatar: "./images/food_bread_moldy_watercolor.png",
        type: "chat",
        message: "「家人們！食品安全沒關係啦，麵包水果稍微發霉，只要用刀把發霉毛毛的地方切掉，剩下的地方乾淨照樣可以吃，省錢又健康喔！」",
        isRumor: true,
        explain: "這是【謠言詐騙】！黴菌的菌絲呈樹狀生長，肉眼能看到的只是表面發霉，其實微小的菌絲已經深入整塊食物內部，並且會釋放有害毒素。切掉表面絕對不安全，必須整顆丟棄！"
    },
    {
        id: 2,
        sender: "LINE熱心鄰居張阿姨",
        avatar: "./images/sushi_spring_rolls.png",
        type: "chat",
        message: "「重要分享！沒吃完的潤餅跟配料放在室溫下沒關係，隔天直接吃也沒事，不用麻煩冰冰箱啦，古早人都是這樣吃的！」",
        isRumor: true,
        explain: "這是【謠言詐騙】！食物在室溫下極易滋生細菌。吃剩的潤餅或熟食必須盡快放進冰箱冷藏，而且隔天食用前一定要徹底加熱，才不會食物中毒喔！"
    },
    {
        id: 3,
        sender: "食藥署食安主播",
        avatar: "./images/granddaughter_adult.png",
        type: "news",
        message: "「食安小常識！冰箱裡的食物應遵守『先進先出』原則。先買的、快到期的食物要放在冰箱外側優先食用，才能確保食材新鮮！」",
        isRumor: false,
        explain: "這是【真實安全資訊】！冰箱不是萬能保鮮盒。遵守『先進先出』原則，可以避免食物在冰箱角落被遺忘而過期腐壞，是最好的食物保存好習慣！"
    }
];

// 🔊 網頁內建音效產生器 (Web Audio API)
function playBeepSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(750, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.9, audioCtx.currentTime); // 大聲音量

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.08); // 短促清脆
    } catch (e) {
        console.log("音效撥放失敗，需點擊網頁觸發。");
    }
}

// 畫面切換主控
function switchScreen(screenId) {
    document.querySelectorAll('.screen-view').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 主畫面 App 點擊分配
function handleAppClick(type) {
    playBeepSound();
    if (type === 'phone') {
        openPhone();
    } else if (type === 'line') {
        openLine();
    }
}

// --- 電話功能區 ---
function openPhone() {
    switchScreen('dial-screen');
}

function pressKey(num) {
    playBeepSound();
    if (currentInputNumber.length < 10) {
        currentInputNumber += num;
        updateDialDisplay();
    }
}

function deleteKey() {
    playBeepSound();
    currentInputNumber = currentInputNumber.slice(0, -1);
    updateDialDisplay();
}

function updateDialDisplay() {
    const display = document.getElementById('phone-number-display');
    const callBtn = document.getElementById('call-main-btn');
    display.innerText = currentInputNumber;

    if (currentInputNumber === targetNumber) {
        callBtn.classList.add('active-green');
    } else {
        callBtn.classList.remove('active-green');
    }
}

function makeCall() {
    playBeepSound();
    if (currentInputNumber === targetNumber) {
        switchScreen('calling-screen');
    }
}

function hangUp() {
    playBeepSound();
    switchScreen('home-screen');
    
    isPhoneCompleted = true;
    document.getElementById('phone-icon').classList.remove('glowing');
    
    const lineIcon = document.getElementById('line-icon');
    const lineBtn = document.getElementById('line-app-btn');
    
    lineIcon.classList.add('glowing');
    lineBtn.classList.remove('disabled-click');
    
    currentInputNumber = "";
    updateDialDisplay();
}

// --- LINE 功能區 ---
function openLine() {
    if (!isPhoneCompleted) return;
    renderChatList();
    switchScreen('line-home');
}

function renderChatList() {
    const container = document.getElementById('chat-list-container');
    container.innerHTML = ""; 

    chatData.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        item.onclick = () => {
            playBeepSound();
            openChatRoom(chat.id);
        };

        item.innerHTML = `
            <img class="chat-avatar" src="${chat.avatar}" onerror="this.src='https://via.placeholder.com/60/e4e6eb/000000?text=Avatar'" alt="avatar">
            <div class="chat-content">
                <div class="chat-sender">${chat.sender}</div>
                <div class="chat-preview">${chat.message}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

function openChatRoom(id) {
    const chat = chatData.find(c => c.id === id);
    if (!chat) return;
    currentActiveChat = chat;

    document.getElementById('chat-room-title').innerText = chat.sender;
    document.getElementById('chat-room-avatar').src = chat.avatar;
    document.getElementById('chat-room-avatar').onerror = function() {
        this.src = 'https://via.placeholder.com/60/e4e6eb/000000?text=Avatar';
    };
    document.getElementById('chat-room-msg').innerText = chat.message;

    const explainBox = document.getElementById('explain-result');
    explainBox.classList.remove('show', 'rumor-style', 'real-style');

    switchScreen('line-chat');
}

function verifyMessage(userSelectedRumor) {
    playBeepSound();
    if (!currentActiveChat) return;

    const explainBox = document.getElementById('explain-result');
    explainBox.innerText = currentActiveChat.explain;
    explainBox.classList.add('show');

    if (currentActiveChat.isRumor) {
        explainBox.classList.add('rumor-style');
        explainBox.classList.remove('real-style');
    } else {
        explainBox.classList.add('real-style');
        explainBox.classList.remove('rumor-style');
    }
}

function backToLineHome() {
    playBeepSound();
    switchScreen('line-home');
}