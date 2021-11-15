const io=require("socket.io")(8000,{
    cors:{
        origin:["http://localhost:8080"]
    }
})

const users = {};

io.on("connection",socket =>{
    console.log(socket.id);

    socket.on('new-user', name => {
        console.log(name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined',name);
    })    

    socket.on('send', message =>{
        socket.broadcast.emit('receive', {message : message, name : users[socket.id]})
    })

    socket.on("disconnect", message => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
})