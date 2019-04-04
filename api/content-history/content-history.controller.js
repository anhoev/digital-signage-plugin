const Joi = require('joi');
const ContentHistoryService = require('./content-history.service');

const contentSchema = Joi.object().keys({
  begin: Joi.date().required(),
  duration: Joi.number().required(),
  content: Joi.string().required()
});

const contentListSchema = Joi.array().items(contentSchema.required());

const contentHistoryDataSchema = Joi.object().keys({
  contentHistory: contentListSchema.required(),
  deviceToken: Joi.string().required()
});

module.exports.addContentController = function (req, res) {
  const contentHistory = req.body.contentHistory;
  const deviceToken = req.body.deviceToken;
  const isValid = contentHistoryDataSchema.validate({
    contentHistory,
    deviceToken
  });
  if (isValid.error) {
    res.status(400).json({ error: isValid.error.details, message: 'error on validate' });
  } else {
    ContentHistoryService.addContentHistory(contentHistory, deviceToken)
      .then(result => {
        res.status(200).json({ message: 'success', data: result });
      })
      .catch(err => {
        res.status(400).json({ error: err, message: 'error on create ' });
      });
  }
};
