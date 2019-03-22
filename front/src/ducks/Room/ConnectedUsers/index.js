import React from "react";
import User from "./User";
import { StyledConnectedUsers } from "./styled";

const ConnectedUsers = React.memo(
  ({ connections }) => {
    const users = [];
    if (connections.clients) {
      for (const socketId in connections.clients) {
        users.push(
          <User key={socketId} client={connections.clients[socketId]} />
        );
      }
    }
    return <StyledConnectedUsers>{users}</StyledConnectedUsers>;
  },
  (prevProps, nextProps) =>
    prevProps.connections.count === nextProps.connections.count
);

export default ConnectedUsers;
