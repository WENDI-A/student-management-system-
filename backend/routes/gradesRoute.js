const express = require("express");
const router = express.Router();
const GrradeController = require("../controllers/GrradeController");
const authenticateJWT = require("../middleware/authMiddleware");
const { route } = require("./authRoutes");

router.use(authenticateJWT.protect);
router.get(
  "/courses",
  authenticateJWT.authorize("teacher"),
  GrradeController.getPublishedAssessmentsAndGrades
);
router.post(
  "/",
  authenticateJWT.authorize("teacher"),
  GrradeController.setStudentGrade
);
router.get(
  "/:id",
  authenticateJWT.authorize("teacher"),
  GrradeController.getStudentGrades
);
router.put(
  "/:id",
  authenticateJWT.authorize("teacher"),
  GrradeController.updateStudentGrade
);
router.get(
  "/set-grade/:id",
  authenticateJWT.authorize("teacher"),
  GrradeController.getGradeById
);

module.exports = router;
