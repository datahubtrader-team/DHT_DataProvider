const mongoose = require('mongoose');

//TODO: Add Buyer Id to data structure
const AwsUrlSchema = mongoose.Schema({
    url: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('AWSURL', AwsUrlSchema);