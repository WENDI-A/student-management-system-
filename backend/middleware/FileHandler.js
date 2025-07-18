const {FileHandler} = require("../CURD/index")
exports.file  = new FileHandler({
  uploadDir : "uploads",
  keepExtensions : true,
  addToBody : true
})