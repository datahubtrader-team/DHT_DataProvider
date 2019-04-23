const mongoose = require('mongoose');

const LoginSchema = mongoose.Schema({
    username: String,
    password: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('Logins', LoginSchema);