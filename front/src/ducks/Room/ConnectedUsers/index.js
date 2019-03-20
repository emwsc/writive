import React from "react";
import User from "./User";
import { StyledConnectedUsers } from "./styled";

const ConnectedUsers = React.memo(({ connectionCount }) => {
  const users = [];
  for (let i = 0; i < connectionCount; i++) {
    users.push(<User key={i} userIndex={i + 1} />);
  }
  return <StyledConnectedUsers>{users}</StyledConnectedUsers>;
});

export default ConnectedUsers;
