const db = require('../models');
const { Question, Assessment } = db;

exports.createQuestion = async (req, res) => {
  try {
    console.log('Create Question req.body:', req.body);
    const { assessment_id, question_text, type, options, correct_answer, explanation } = req.body;
    const question = await Question.create({
      assessment_id,
      question_text,
      type,
      options: typeof options === 'string' ? JSON.parse(options) : options,
      correct_answer,
      explanation,
    });
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    console.error('Create Question error:', error);
    res.status(500).json({ success: false, message: 'Failed to create question', error: error.message, stack: error.stack });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({ include: [{ model: Assessment, as: 'assessment' }] });
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch questions', error: error.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id, { include: [{ model: Assessment, as: 'assessment' }] });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch question', error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { assessment_id, question_text, type, options, correct_answer, explanation } = req.body;
    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    await question.update({
      assessment_id,
      question_text,
      type,
      options: typeof options === 'string' ? JSON.parse(options) : options,
      correct_answer,
      explanation,
    });
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update question', error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    await question.destroy();
    res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete question', error: error.message });
  }
};

exports.getQuestionsByAssessment = async (req, res) => {
  try {
    const { assessment_id } = req.params;
    const questions = await Question.findAll({ where: { assessment_id } });
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch questions for assessment', error: error.message });
  }
}; 