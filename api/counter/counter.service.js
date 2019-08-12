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

module.exports.getLatestCount = async function (collectionName) {
  const result = await Counter.findOneAndUpdate({collectionName: collectionName}, {
    collectionName: collectionName,
    $inc: {'counter': 1}
  }, {new: true, upsert: true});
  return result.counter;
};
