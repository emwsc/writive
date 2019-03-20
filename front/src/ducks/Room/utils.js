import { useEffect } from "react";
import socketIOClient from "socket.io-client";
import { getConnectionUrl } from "../../common/utils";

/**
 * Hook on room load
 * @param {string} roomhash
 * @param {function} setSocket
 */
export function useOnRoomLoad(roomhash, setSocket, events) {
  useEffect(() => {
    const url = getConnectionUrl();
    const socket = socketIOClient(url);
    setSocket(socket);
    socket.emit("join", roomhash);
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
  for (const event of events)
    socket.on(event.eventName, function() {
      event.handler(...arguments, socket);
    });
}

/**
 * Get count of connected users
 * @param {string} roomhash
 */
export function getConnectionCount(roomhash) {
  const url = getConnectionUrl();
  return fetch(url + "/api/v1/getConnectionCount?room=" + roomhash).then(
    result => result.text()
  );
}
