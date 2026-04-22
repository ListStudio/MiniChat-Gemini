from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'minichat_secret'
socketio = SocketIO(app, cors_allowed_origins="*")

waiting_users = []

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('find_partner')
def handle_find_partner():
    user_id = request.sid
    if waiting_users and waiting_users[0] != user_id:
        partner_id = waiting_users.pop(0)
        room = f"room_{user_id}_{partner_id}"
        
        join_room(room, sid=user_id)
        join_room(room, sid=partner_id)
        
        emit('chat_started', {'room': room}, room=room)
        
        # Запись в txt для истории (по желанию)
        with open("logs.txt", "a") as f:
            f.write(f"Session started: {room}\n")
    else:
        if user_id not in waiting_users:
            waiting_users.append(user_id)
            emit('waiting')

@socketio.on('message')
def handle_message(data):
    # Фильтруем: только текст
    room = data.get('room')
    msg = data.get('msg')
    if room and msg:
        emit('message', msg, room=room, include_self=False)

@socketio.on('stop_chat')
def handle_stop(data):
    room = data.get('room')
    emit('partner_disconnected', room=room)
    leave_room(room)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
