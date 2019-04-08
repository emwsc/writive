export function getConnectionUrl() {
  const defaultPort = ":3456";
  const url = window.location.protocol + "//" + window.location.hostname;
  // window.location.hostname === "localhost"
  //   ? "http://localhost"
  //   : "http://192.168.31.144";
  return url + defaultPort;
}

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
