const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authenticate  = require('../middleware/authMiddleware');


router.use(authenticate.protect);
router.post('/', authenticate.authorize("admin") ,scheduleController.createSchedule);
router.get('/', authenticate.authorize("admin"), scheduleController.getAllSchedules);
router.get('/student', authenticate.authorize("admin","student"), scheduleController.getSchedulesByStudentGrade);
router.get('/:id', authenticate.authorize("admin"), scheduleController.getScheduleById);
router.put('/:id', authenticate.authorize("admin"), scheduleController.updateSchedule);
router.delete('/:id', authenticate.authorize("admin"), scheduleController.deleteSchedule);

module.exports = router;