import { useEffect } from "react";
import socketIOClient from "socket.io-client";

/**
 * Hook on room load
 * @param {string} roomhash
 * @param {function} setSocket
 */
export function useOnRoomLoad(roomhash, setSocket, events) {
  useEffect(() => {
    const url =
      window.location.hostname === "localhost"
        ? "http://localhost"
        : "http://192.168.31.144";
    const socket = socketIOClient(url + ":3456");
    socket.emit("join", roomhash);
    setSocket(socket);
    connectEventHandlers(socket, events);
  }, [roomhash]);
}

/**
 *
 * @param {object} socket
 * @param {object[]} events Array of event objects like {eventName, handler}
 */
function connectEventHandlers(socket, events) {
  socket.on("connect", function() {
    console.log("connect");
  });
  socket.on("disconnect", function() {
    console.log("disconnect");
  });
  if (!events) return;
  for (const event of events) socket.on(event.eventName, event.handler);
}
