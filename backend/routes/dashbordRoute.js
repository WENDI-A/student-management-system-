const { getdashbord } = require("../controllers/AdminDashbordControler")
const authMiddleware = require('../middleware/authMiddleware');
const Router  =  require("express").Router()

Router.use(authMiddleware.protect)
Router.get("/admin",  authMiddleware.authorize("admin") , getdashbord)

module.exports = Router;