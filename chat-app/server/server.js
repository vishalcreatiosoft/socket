const io=require("socket.io")(8000,{
    cors:{
        origin:["http://localhost:8080"]
    }
})

const redis = require('redis');
const client = redis.createClient();

const users = {};

function getMessages(socket,name){
    client.lrange('messages','0','-1',(error, data)=>{
        if(error){
            throw error;
        }
        if (data != null){
            data.map(x => {
                const usernameMessage = x.split(' : ');
                const redisUserame = usernameMessage[0];
                const redisMessage = usernameMessage[1];
                const redisSentTime = usernameMessage[2];
                //console.log(name);
                if(redisUserame == name){
                    socket.emit('myMessages',{message : redisMessage, time : redisSentTime});
                }else{
                    socket.emit('oldMessages',{from : redisUserame, message : redisMessage, time : redisSentTime});
                }

               // socket.emit('oldMessages',{from : redisUserame, message : redisMessage});
                
            }) 
        }
    })
}

function addZero(num){
    return num < 10 ? `0${num}` : num ;
}


io.on("connection",socket =>{
    console.log(socket.id);
    
    socket.on('new-user', name => {
                         
        let flag = true;           
        for(const username in users){
            if(users[username] == name){
                socket.emit('userAlreadyExists',name);
                flag = false;
            }
        }
        if(flag == true)
        {   users[socket.id] = name;
            console.log(users[socket.id]);
            socket.broadcast.emit('user-joined',name);
            getMessages(socket,users[socket.id]);
        }
        
    })    

    socket.on('send', (message,room,sentTime) => {
        // console.log(message)
        // console.log(room)
        if(room == ""){
            socket.broadcast.emit('receive', {message : message, name : users[socket.id], time : sentTime })
            client.rpush(`messages`,`${users[socket.id]} : ${message} : ${sentTime.toString()} `)

        }else{
            socket.to(room).emit('receive', {message : message, name : users[socket.id], time : sentTime})
            console.log(room);
        }
        
    })

    socket.on('join-room',(room)=>{
        socket.join(room);
        
    })

    socket.on("disconnect", message => {
        const currentTime = new Date();    
        const hours = currentTime.getHours() > 12 ? currentTime.getHours()-12 : currentTime.getHours();
        const minutes = addZero(currentTime.getMinutes());
        const sentTime = `${hours}:${minutes}`;
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
})