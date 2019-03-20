var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
  res.send("<h1>Hello world</h1>");
});

http.listen(3456, function() {
  console.log("listening on *:3456");
});

io.sockets.on("connection", function(socket) {
  socket.on("join", function(room) {
    console.log(socket.id);
    socket.join(room);
    socket.on("emitTextEditorChanges", function(editorChanges) {
      console.log(`${new Date().toLocaleString()} emitTextEditorChanges`);
      socket.to(room).emit("recieveTextEditorChanges", editorChanges);
    });
  });
});
