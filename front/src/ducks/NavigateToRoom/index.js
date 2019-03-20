import React from "react";
import { getRandomRoomHash } from "./utils";

const NavigateToRoom = () => {
  getRandomRoomHash().then(roomhash => {
    window.location.href = window.location.origin + "/" + roomhash;
  });
  return <div />;
};

export default NavigateToRoom;
