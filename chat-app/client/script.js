// console.log('script file')

import { io } from "socket.io-client";
const socket = io("http://localhost:8000");

const messageInput = document.getElementById('msg-input');
const form = document.getElementById('form');
const chatBox = document.querySelector('.chat-box');
const roomInput = document.getElementById('room-input');
const roomButton = document.getElementById('roombtn');


socket.on('connect', ()=>{
    console.log('client connected ');
})

let name = prompt('Enter your name');
if(name == ""){
    alert('Please Enter your name')
    let name = prompt('Enter your name');


}else{
    socket.emit('new-user',name);
}
const userName = document.createElement('h1');
userName.textContent = name;
document.querySelector('#user-name').append(name);

const displayMessage = (msg, position)=>{
    const div = document.createElement('div');
    div.innerText = msg;
    div.classList.add('msg');
    div.classList.add(position);
    chatBox.append(div);
}

socket.on('user-joined', name => {
    console.log(name)
    displayMessage(`${name} joined`, 'left');
})

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const message = messageInput.value;
    const room = roomInput.value;
    displayMessage(`You : ${message}`,'right');
    socket.emit('send', message,room);
    messageInput.value = "";
    roomInput.value="";

})


roomButton.addEventListener('click',()=>{
    const room = roomInput.value;
    socket.emit('join-room',room,()=>{
        displayMessage("",'left');
    })
})

socket.on('receive', data => {
    displayMessage(`${data.name} : ${data.message}`, 'left');
})

socket.on('left', name => {
    displayMessage(`${name} left chatting`,'left');
})