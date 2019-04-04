const axios = require("axios");

function getRandomName() {
  return axios.get("https://uinames.com/api/").then(result => result.data.name);
}

module.exports.getRandomName = getRandomName;
