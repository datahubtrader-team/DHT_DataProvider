const mongoose = require('mongoose');

const AwsUrlSchema = mongoose.Schema({
    url: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('AWSURL', AwsUrlSchema);