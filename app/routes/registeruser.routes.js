var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/dataprovider';

module.exports = (app) => {
    const registerusers = require('../controllers/registeruser.controller.js');

    // Create a new user
    app.post('/registerusers', registerusers.create);

    // Retrieve all user
    app.get('/registerusers', registerusers.findAll);

    // Retrieve a single user with userId
    app.get('/registerusers/:registeruserId', registerusers.findOne);

    // Update a user with userId
    app.put('/registerusers/:registeruserId', registerusers.update);

    // Delete a user with userId
    app.delete('/registerusers/:registeruserId', registerusers.delete);
}