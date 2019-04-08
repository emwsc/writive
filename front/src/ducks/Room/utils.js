import { useEffect } from "react";
import socketIOClient from "socket.io-client";
import { getConnectionUrl } from "../../common/utils";

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

/**
 *
 * @param {object} e
 * @param {string} draggableId
 * @param {object} prevPosition
 * @param {object} editorPosition
 */
export function calculateNewPositionOfRoomItemOnDrag(
  e,
  draggableId,
  prevPosition,
  editorPosition
) {
  const handlerBounding = document
    .getElementById(draggableId)
    .getBoundingClientRect();
  const topElement = document.getElementById("top");
  const { height: topY } = topElement.getBoundingClientRect();
  if (!prevPosition[draggableId]) prevPosition[draggableId] = {};
  if (!prevPosition[draggableId].x)
    prevPosition[draggableId].x = e.pageX - handlerBounding.x;
  if (!prevPosition[draggableId].y)
    prevPosition[draggableId].y = e.pageY - handlerBounding.y;
  const diffX = e.pageX - handlerBounding.x - prevPosition[draggableId].x;
  const diffY =
    e.pageY - handlerBounding.y - prevPosition[draggableId].y - topY + 75;
  const newPosition = { ...editorPosition };
  newPosition[draggableId] = {
    x: handlerBounding.x + diffX,
    y: handlerBounding.y + diffY
  };
  return newPosition;
}

/**
 * Event handlers for sockets
 */
export function getEventHandlers({
  setTextEditorChanges,
  checkConnections,
  emitCurrentEditorState,
  setRoomItems,
  roomItems,
  setDraggableId,
  setEditorPosition
}) {
  const events = [
    {
      eventName: "recieveTextEditorChanges",
      handler: (changes, socket) => {
        if (socket.id === changes.socketId) return;
        setTextEditorChanges(changes);
      }
    },
    {
      eventName: "connectionsCountChanges",
      handler: socket => checkConnections(socket)
    },
    {
      eventName: "getCurrentEditorState",
      handler: emitCurrentEditorState
    },
    {
      eventName: "setCurrentEditorState",
      handler: data => {
        if (data) {
          const { state } = data;
          const ids = Object.keys(state);
          const roomItems = ids.map(id => ({
            id,
            initialRawContent: state[id].editorState,
            editorPosition: state[id].editorPosition
          }));
          setRoomItems(roomItems);
        }
      }
    },
    {
      eventName: "emitNewRoomItem",
      handler: ({ id, initialRawContent }) => {
        if (!id) return;
        const updatedRoomItems = roomItems;
        updatedRoomItems.push({ id, initialRawContent });
        setRoomItems([...updatedRoomItems]);
      }
    },
    {
      eventName: "moveDraggable",
      handler: ({ draggableId, newPosition }) => {
        setDraggableId(draggableId);
        if (newPosition) setEditorPosition(newPosition);
      }
    }
  ];
  return events;
}
