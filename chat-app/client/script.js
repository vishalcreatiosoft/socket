// console.log('script file')
import { io } from "socket.io-client";
const socket = io("http://localhost:8000");

//getting all responses into variables 
const messageInput = document.getElementById('msg-input');
const form = document.getElementById('form');
const chatBox = document.querySelector('.chat-box');
const roomInput = document.getElementById('room-input');
const roomButton = document.getElementById('roombtn');



let newName;
let name;

function newUser(name){
    socket.emit('new-user',name);
    const userName = document.createElement('h1');
    userName.textContent = name;
    document.querySelector('#user-name').innerHTML = name;
}

socket.on('connect', ()=>{
    console.log('client connected ');
})

name = prompt('Enter your name');
while(name == ""){
    alert('Please Enter your name')
    name = prompt('Enter your name');
}

newUser(name);

socket.on('userAlreadyExists',name=>{
    
    alert(`${name} is already online`);
    newName = prompt('Try another name');
    while(newName == name){
        newName = prompt('Try another name');
    }
    newUser(newName); 
})


const displayMessage = (msg, position, sentTime, time,)=>{

    const div = document.createElement('div');
    div.innerText = msg;
    div.classList.add('msg');
    div.classList.add(position);
    chatBox.append(div);

    const showTime = document.createElement('h6');
    showTime.innerText = sentTime;
    showTime.classList.add(time);
    chatBox.appendChild(showTime);
    

}

function addZero(num){
    return num < 10 ? `0${num}` : num ;
}

socket.on('user-joined', name => {
    //console.log(name)
    const currentTime = new Date();    
    const hours = currentTime.getHours() > 12 ? currentTime.getHours()-12 : currentTime.getHours();
    const minutes = addZero(currentTime.getMinutes());
    const sentTime = `${hours}:${minutes}`;
    displayMessage(`${name} joined`, 'left', sentTime, 'show-time-left');
})

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const message = messageInput.value;
    const room = roomInput.value;
    
    const currentTime = new Date();    
    const hours = currentTime.getHours() > 12 ? currentTime.getHours()-12 : currentTime.getHours();
    const minutes = addZero(currentTime.getMinutes());
    const sentTime = `${hours}:${minutes}`;

    displayMessage(`You : ${message}`,'right', sentTime, 'show-time-right');
    socket.emit('send', message,room,sentTime);
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
    displayMessage(`${data.name} : ${data.message}`, 'left', data.time, 'show-time-left');
})

socket.on('left', name => {
    const currentTime = new Date();    
    const hours = currentTime.getHours() > 12 ? currentTime.getHours()-12 : currentTime.getHours();
    const minutes = addZero(currentTime.getMinutes());
    const sentTime = `${hours}:${minutes}`;
    displayMessage(`${name} left chatting`,'left', sentTime, 'show-time-left');
})

socket.on('oldMessages', data => {
    displayMessage(`${data.from} : ${data.message}`, 'left', data.time,'show-time-left');
})

socket.on('myMessages', data => {
    displayMessage(`You : ${data.message}`,'right', data.time,'show-time-right');
})