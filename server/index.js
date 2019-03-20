const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const fs = require("fs");
const path = require("path");
const utils = require("./common/utils");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", function(req, res) {
  res.send("<h1>Hello world</h1>");
});

app.get("/api/v1/generateRoomHash", (req, res) => {
  const filePath = path.join(__dirname, "words.json");
  fs.readFile(filePath, { encoding: "utf-8" }, function(err, result) {
    if (!err) {
      const { data } = JSON.parse(result);
      const randomWords = [];
      for (let i = 0; i < 5; i++) {
        const index = utils.getRandomInt(0, data.length);
        randomWords.push(data[index].word);
      }
      const roomHash = randomWords.join("-");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(roomHash);
      res.end();
    } else {
      console.log(err);
    }
  });
});

app.get("/api/v1/getConnectionCount", function(req, res) {
  io.in(req.query.room).clients((err, clients) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(clients.length.toString());
    res.end();
  });
});

http.listen(3456, function() {
  console.log("listening on *:3456");
});

io.sockets.on("connection", function(socket) {
  socket.on("join", function(room) {
    console.log(socket.id);
    socket.join(room);
    socket.to(room).emit("connectionsCountChanges");

    socket.on("disconnect", function() {
      console.log(
        `${new Date().toLocaleString()} disconnect connectionsCountChanges`
      );
      socket.to(room).emit("connectionsCountChanges");
    });

    socket.on("sendCurrentEditorState", function(data) {
      console.log(`${new Date().toLocaleString()} sendCurrentEditorState`);
      socket.broadcast
        .to(data.to)
        .emit("setCurrentEditorState", data.editorJson);
    });

    io.in(room).clients((err, clients) => {
      if (clients.length > 0)
        socket.broadcast
          .to(clients[0])
          .emit("getCurrentEditorState", socket.id);
    });

    socket.on("emitTextEditorChanges", function(editorChanges) {
      console.log(
        `${new Date().toLocaleString()} emitTextEditorChanges ${
          editorChanges.command
        }`
      );
      socket.to(room).emit("recieveTextEditorChanges", editorChanges);
    });
  });
});
