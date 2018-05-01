
const fs = require("fs");

function chunkArray(myArray, chunk_size) {
    var results = [];
    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size));
    }
    return results;
  }
  
  function saveFile(fileName, contant) {
    fs.writeFile(fileName, contant, "utf8", (err, data) => {
   
    });
  }




module.exports = {
    chunkArray,
    saveFile
}