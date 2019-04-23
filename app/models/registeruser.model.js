const mongoose = require('mongoose');

const RegisterUserSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    username: String,
    password: String,
}, {
    timestamps: true
});

module.exports = mongoose.model('RegisterUsers', RegisterUserSchema);