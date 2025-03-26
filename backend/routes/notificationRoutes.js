const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");



router.use(authMiddleware.protect)
router.post("/send", authMiddleware.authorize("admin","teacher"), notificationController.sendNotification);
router.get(
  "/recipient/:recipient_type/:recipient_id?",
  notificationController.getNotificationsByRecipient
);

router.put("/mark-read/:id", notificationController.markNotificationAsRead);
router.delete("/delete/:id", notificationController.deleteNotification);
router.get("/admin", notificationController.getNotificationsBySender);


module.exports = router;
