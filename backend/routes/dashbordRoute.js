const {getDashboard } = require("../controllers/AdminDashbordControler")
const authMiddleware = require('../middleware/authMiddleware');
const Router  =  require("express").Router()
const teacherDashboardController = require('../controllers/teacherDashboardController');

Router.use(authMiddleware.protect)
Router.get("/admin",  authMiddleware.authorize("admin") , getDashboard)
Router.get('/teacher', authMiddleware.authorize('teacher'), teacherDashboardController.getTeacherDashboard);

module.exports = Router;
