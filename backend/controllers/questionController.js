const questionService = require('../services/questionService');
const { sendSuccess } = require('../utils/responseHelper');

exports.getQuestions = async (req, res, next) => {
  try {
    const data = await questionService.getQuestionsByExam(req.params.exam_id);
    sendSuccess(res, { questions: data }, 'Questions retrieved successfully');
  } catch (err) {
    next(err);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const data = await questionService.createQuestion(req.body);
    sendSuccess(res, { question: data }, 'Question created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.getOptions = async (req, res, next) => {
  try {
    const data = await questionService.getOptionsByQuestion(req.params.question_id);
    sendSuccess(res, { options: data }, 'Options retrieved successfully');
  } catch (err) {
    next(err);
  }
};

exports.createOption = async (req, res, next) => {
  try {
    const data = await questionService.createOption(req.body);
    sendSuccess(res, { option: data }, 'Option created successfully', 201);
  } catch (err) {
    next(err);
  }
};
