const axios = require("axios");
const utils = require("../../common/utils");

function getRandomName() {
  return axios
    .get("https://uinames.com/api/")
    .then(result => result.data.name, () => utils.generateGuid());
}

module.exports.getRandomName = getRandomName;
