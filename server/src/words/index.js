const fs = require("fs");
const path = require("path");
const utils = require("../../common/utils");

/**
 * Generate random words
 * @param {number} wordCount 5 is default value
 * @param {function} callback
 */
function getRandomWords(wordCount = 5, callback) {
  const filePath = path.join(__dirname, "words.json");
  fs.readFile(filePath, { encoding: "utf-8" }, function(err, result) {
    if (!err) {
      const { data } = JSON.parse(result);
      const randomWords = [];
      for (let i = 0; i < wordCount; i++) {
        const index = utils.getRandomInt(0, data.length);
        randomWords.push(data[index].word);
      }
      callback(randomWords);
    } else {
      console.log(err);
    }
  });
}

module.exports = {
  getRandomWords
};
