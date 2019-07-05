var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
   //res.send('<h1>Hello world</h1>');
   res.sendFile(__dirname + '/view/socketDemo.html');
});

http.listen(3000, function () {
   console.log('server listening on port:3000');
});


io.on('connection', function (socket) { //监听连接，并接收sockets
   console.log('连接成功');
   /**
    * io.emit() 发送给每个用户
    * socket.broadcast.emit('hi') 将消息发给除特定 socket 外的其他用户
    * socket.on()  //接受客户端消息
    */
   
   // 当某用户连上聊天室socket服务时，给他打个招呼
   sendToSingle(socket, {
      event: 'greet_from_server',
      data: `你好${socket.id}`
   });

   // 对其他用户给出通知：某某某加入了聊天室
   broadcastExceptSelf(socket, {
      event: 'new_user_join',
      data: {user: socket.id}
   });

   // 监听用户发的聊天内容
   socket.on('chat', function (data) {
      broadcastExceptSelf(socket, { // 然后广播给其他用户：某某某说了什么
         event: 'new_chat_content',
         data: {
            user: socket.id,
            content: data
         }
      })
   });

   // 监听socket连接断开
   socket.on('disconnect', (reason) => {
      broadcastExceptSelf(socket, { // 广播给其他用户：某某某退出了聊天室
         event: 'someone_exit',
         data: {user: socket.id}
      })
   });

});

function sendToSingle(socket, param) {// 给当前socket连接单独发消息
   socket.emit('singleMsg', param);
}

function broadcastAll(param) {// 对所有socket连接发消息
   io.emit('broadcastAll', param)
}

function broadcastExceptSelf(socket, param) {// 对除当前socket连接的其他所有socket连接发消息
   socket.broadcast.emit('broadcast', param);
}