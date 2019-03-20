import { getConnectionUrl } from "../../common/utils";

export function getRandomRoomHash() {
  const url = getConnectionUrl();
  return fetch(url + "/api/v1/generateRoomHash").then(result => result.text());
}
