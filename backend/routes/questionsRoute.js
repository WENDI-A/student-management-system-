const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/QuestionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.protect);

router.get('/', authMiddleware.authorize('admin', 'teacher'), QuestionController.getQuestions);
router.get('/assessment/:assessment_id', authMiddleware.authorize('admin', 'teacher', 'student'), QuestionController.getQuestionsByAssessment);
router.get('/:id', authMiddleware.authorize('admin', 'teacher'), QuestionController.getQuestionById);
router.post('/', authMiddleware.authorize('admin', 'teacher'), QuestionController.createQuestion);
router.put('/:id', authMiddleware.authorize('admin', 'teacher'), QuestionController.updateQuestion);
router.delete('/:id', authMiddleware.authorize('admin', 'teacher'), QuestionController.deleteQuestion);

module.exports = router; 