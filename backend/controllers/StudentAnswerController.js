const db = require('../models');
const { StudentAnswer, Question } = db;

exports.submitAnswers = async (req, res) => {
  try {
    const student_id = req.user.id;
    const { assessment_id, answers } = req.body; // answers: [{ question_id, answer }]

    if (!assessment_id || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'assessment_id and answers are required' });
    }

    // Fetch all questions for the assessment
    const questions = await Question.findAll({
      where: { assessment_id },
      attributes: ['id', 'correct_answer']
    });
    const questionMap = {};
    questions.forEach(q => { questionMap[q.id] = q.correct_answer; });

    // Prepare answers for bulk create
    const studentAnswers = answers.map(ans => ({
      student_id,
      assessment_id,
      question_id: ans.question_id,
      answer: ans.answer,
      is_correct: questionMap[ans.question_id] != null ? ans.answer === questionMap[ans.question_id] : null,
      submitted_at: new Date(),
    }));

    // Optionally: delete previous answers for this student/assessment (if retake not allowed)
    await StudentAnswer.destroy({ where: { student_id, assessment_id } });

    // Bulk create answers
    await StudentAnswer.bulkCreate(studentAnswers);

    res.status(201).json({ success: true, message: 'Answers submitted successfully' });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ success: false, message: 'Failed to submit answers', error: error.message });
  }
}; 