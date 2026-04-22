const socket = io();
let currentRoom = null;

const btnFind = document.getElementById('btn-find');
const btnStop = document.getElementById('btn-stop');
const btnSend = document.getElementById('btn-send');
const input = document.getElementById('msg-input');
const chatWindow = document.getElementById('chat-window');

btnFind.onclick = () => {
    socket.emit('find_partner');
    btnFind.innerHTML = '<span class="material-icons">sync</span> Поиск...';
};

btnStop.onclick = () => {
    socket.emit('stop_chat', { room: currentRoom });
    resetUI();
};

btnSend.onclick = sendMessage;
input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };

function sendMessage() {
    const text = input.value.trim();
    if (text && currentRoom) {
        socket.emit('message', { room: currentRoom, msg: text });
        addMsg(text, 'user');
        input.value = '';
    }
}

function addMsg(text, type) {
    const p = document.createElement('p');
    p.style.margin = "10px 0";
    p.style.textAlign = type === 'user' ? 'right' : 'left';
    p.innerHTML = `<span style="background:#333; padding:8px 12px; border-radius:8px;">${text}</span>`;
    chatWindow.appendChild(p);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function resetUI() {
    document.getElementById('screen-chat').classList.add('hidden');
    document.getElementById('screen-start').classList.remove('hidden');
    btnFind.innerHTML = '<span class="material-icons">search</span> Найти собеседника';
    chatWindow.innerHTML = '';
    currentRoom = null;
}

socket.on('chat_started', (data) => {
    currentRoom = data.room;
    document.getElementById('screen-start').classList.add('hidden');
    document.getElementById('screen-chat').classList.remove('hidden');
});

socket.on('message', (msg) => {
    addMsg(msg, 'partner');
});

socket.on('partner_disconnected', () => {
    alert('Собеседник покинул чат');
    resetUI();
});
