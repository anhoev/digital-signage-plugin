const playlistService = require('./playlist.service');

module.exports.pushPlaylist = function (req, res) {
  const id = req.body.id;
  const devices = req.body.devices;
  playlistService.pushPlaylist(id, devices)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(400).json({ err });
    });
};
