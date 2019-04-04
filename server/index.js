const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const words = require("./src/words");
const editorRoom = require("./src/editorRoom");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/api/v1/generateRoomHash", (req, res) => {
  words.getRandomWords(5, randomWords => {
    const roomHash = randomWords.join("-");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(roomHash);
    res.end();
  });
});

app.get("/api/v1/getConnectionCount", function(req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(editorRoom.getConnectionsCountInRoom(req.query.room).toString());
  res.end();
});

app.get("/api/v1/getConnections", function(req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(JSON.stringify(editorRoom.getConnectionsInRoom(req.query.room)));
  res.end();
});

http.listen(3456, function() {
  console.log("listening on *:3456");
});

io.sockets.on("connection", function(socket) {
  editorRoom.handleRoom(io, socket);
});
