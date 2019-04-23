const mongoose = require('mongoose');

const DataProviderSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    number: String,
    status: String
}, {
    timestamps: true
});

module.exports = mongoose.model('DataProviders', DataProviderSchema);