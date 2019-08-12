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

module.exports.addContentController = async function (req, res) {
  const {contentHistory, deviceToken} = req.body;
    // const isValid = contentHistoryDataSchema.validate({
  //   contentHistory,
  //   deviceToken
  // });
  // if (isValid.error) {
  //   res.status(400).json({ error: isValid.error.details, message: 'error on validate' });
  // } else {
  try {
    const result = await ContentHistoryService.addContentHistory(contentHistory.map(i => ({
      ...i,
      begin: new Date(i.begin)
    })), deviceToken);
    res.status(200).json({ message: 'success', data: result });
  } catch (e) {
    res.status(400).json({ error: e, message: 'error on create ' });
  }
  // }
};
