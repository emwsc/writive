import React from "react";
import User from "./User";
import { StyledConnectedUsers } from "./styled";

const ConnectedUsers = React.memo(
  ({ connections }) => {
    const users = [];
    if (connections.clients) {
      let index = 0;
      for (const socketId in connections.clients) {
        users.push(
          <User
            key={socketId}
            client={connections.clients[socketId]}
            index={index}
          />
        );
        index++;
      }
    }
    return <StyledConnectedUsers>{users}</StyledConnectedUsers>;
  },
  (prevProps, nextProps) =>
    prevProps.connections.count === nextProps.connections.count
);

export default ConnectedUsers;
