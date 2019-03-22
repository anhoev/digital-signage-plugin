const fileService = require('../../common/services/file.service');

exports.push = async function (registrationToken, payload) {
  return await new Promise((resolve, reject) => {
    fileService.notify(registrationToken, payload)
      .then(data => {
        return resolve({message: 'push success', data});
      })
      .catch(err => {
        return reject({message: 'push failed'});
      });
  });
};