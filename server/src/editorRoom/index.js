const utils = require("../../common/utils");
const randomColor = require("randomcolor");

const roomConnections = {};

/**
 * Store connection info into global object
 * @param {string} room
 * @param {string} socketId
 */
function pushConnection(room, socketId) {
  console.log(`${new Date().toLocaleString()} pushConnection ${socketId}`);
  if (!roomConnections[room])
    roomConnections[room] = {
      clients: {},
      count: 0
    };
  if (!roomConnections[room].clients[socketId]) {
    const pokemonIndex = utils.getRandomInt(1, 50);
    roomConnections[room].count++;
    roomConnections[room].clients[socketId] = {
      color: randomColor({
        luminosity: "dark"
      }),
      socketId,
      imgSrc: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonIndex}.png`
    };
  }
}

/**
 * Handle user disconnect
 * @param {string} room
 * @param {string} socketId
 */
function popConnection(room, socketId) {
  console.log(`${new Date().toLocaleString()} popConnection ${socketId}`);
  if (roomConnections[room] && roomConnections[room].clients[socketId]) {
    roomConnections[room].count--;
    delete roomConnections[room].clients[socketId];
  }
}

/**
 * Handle room events
 * @param {object} io Socket.io object
 * @param {object} socket
 */
function handleRoom(io, socket) {
  socket.on("join", function(room) {
    socket.join(room);
    pushConnection(room, socket.id);
    io.to(room).emit("connectionsCountChanges");

    socket.on("disconnect", function() {
      popConnection(room, socket.id);
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
      socket.broadcast.to(room).emit("recieveTextEditorChanges", editorChanges);
    });
  });
}

function getConnectionsCountInRoom(room) {
  if (!roomConnections[room]) return 0;
  return roomConnections[room].count;
}

function getConnectionsInRoom(room) {
  if (!roomConnections[room]) return null;
  return roomConnections[room];
}

module.exports = {
  handleRoom,
  getConnectionsCountInRoom,
  getConnectionsInRoom
};
