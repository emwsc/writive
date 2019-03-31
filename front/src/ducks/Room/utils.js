import { useEffect } from "react";
import socketIOClient from "socket.io-client";
import { getConnectionUrl } from "../../common/utils";
import calculateSize from "calculate-size";

/**
 * Hook on room load
 * @param {string} roomhash
 * @param {function} setSocket
 * @param {[]} events Array of event handlers for socket
 */
export function useOnRoomLoad(roomhash, setSocket, events) {
  useEffect(() => {
    const url = getConnectionUrl();
    const socket = socketIOClient(url);
    socket.emit("join", roomhash);
    connectEventHandlers(socket, events);
    setSocket(socket);
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

/**
 * Get info about connection to room users
 * @param {string} roomhash
 */
export function getConnections(roomhash) {
  const url = getConnectionUrl();
  return fetch(url + "/api/v1/getConnections?room=" + roomhash).then(result =>
    result.text()
  );
}

export function getTextWidth(text) {
  // const font = '14px "Montserrat", sans-serif';
  // var canvas =
  //   getTextWidth.canvas ||
  //   (getTextWidth.canvas = document.createElement("canvas"));
  // var context = canvas.getContext("2d");
  // context.font = font;
  // var metrics = context.measureText(text);
  // return metrics.width;
  const size = calculateSize(text, {
    font: '"Montserrat", sans-serif',
    fontSize: "14px"
  });

  return size.width;
}
