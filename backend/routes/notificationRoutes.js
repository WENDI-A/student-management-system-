const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/notify", notificationController.sendMessage);
router.get(
  "/adminNotification/:id",
  notificationController.getAdminMessageById
);
router.get(
  "/teacherNotification/:id",
  notificationController.getTeacherMessageById
);
router.get("/studentsNotification", notificationController.getStudentsMessage);
router.get("/parentsNotification", notificationController.getParentsMessage);
router.put("/updateMessage/:id", notificationController.updateMessage);
router.delete("/deleteMessage/:id", notificationController.deleteMessage);
