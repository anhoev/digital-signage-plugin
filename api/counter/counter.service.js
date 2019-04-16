const CounterSchema = {
  collectionName: String,
  counter: Number
};

cms.registerSchema(CounterSchema, {
  name: 'Counter',
  title: 'Counter',
  alwaysLoad: false
});

const Counter = cms.getModel('Counter');

module.exports.getLatestCount = function (collectionName) {
  return new Promise((resolve, reject) => {
    Counter.findOneAndUpdate({ collectionName: collectionName }, { collectionName: collectionName, $inc: { 'counter': 1 } }, { new: true, upsert: true })
      .then(data => {
        resolve(data.counter);
      })
      .catch(err => {
        reject(err);
      });

  });
};
