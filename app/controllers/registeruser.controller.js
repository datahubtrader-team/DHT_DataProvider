const RegisterUser = require('../models/registeruser.model.js');
const Login = require('../models/login.model.js');
const statusUpdate = require('../Enums/enum.js');

var amqp = require('amqplib/callback_api');

var rest = require('rest-facade');
require('dotenv').config()



// Create and Save a new Registered user
exports.create = (req, res) => {
    // Validate request
    if (!req.body.message) {
        return res.status(400).send({
            message: "Register user can not be empty " + req.body
        });
    }
    res.status(201);

    // Create a new registered user
    var registeruser = new RegisterUser({
        firstName: req.body.firstName || "Unknown firstName",
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    // Save registered user in the database
    registeruser.save()
        .then(data => {
            res.send(data);
            //res.end("Test");
            //addMsgOntoQueue(dataprovider.toString());

        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating a user."
            });
        });
};

// TODO: User login


// Retrieve and return all RegisterUsers from the database.
exports.findAll = (req, res) => {
    RegisterUser.find()
        .then(RegisterUsers => {
            res.send(RegisterUsers);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving RegisterUsers."
            });
        });
};

// Find a single user with a userID
exports.findOne = (req, res) => {
    RegisterUser.findById(req.params.registeruserId)
        .then(registeruser => {
            if (!registeruser) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.registeruserId
                });
            }
            res.send(registeruser);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.registeruserId
                });
            }
            return res.status(500).send({
                message: "Error retrieving user with id " + req.params.registeruserId
            });
        });
};

// Update a registered user identified by the registeruserId in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body.content) {
        return res.status(400).send({
            message: "Registered user content can not be empty"
        });
    }

    // Find user and update it with the request body
    RegisterUser.findByIdAndUpdate(req.params.registeruserId, {
            firstName: req.body.firstName || "Unknown firstName",
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        }, { new: true })
        .then(registeruser => {
            if (!registeruser) {
                return res.status(404).send({
                    message: "User not found with that id " + req.params.registeruserId
                });
            }
            res.send(registeruser);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User can not be found with that id " + req.params.registeruserId
                });
            }
            return res.status(500).send({
                message: "Error updating a user with id " + req.params.registeruserId
            });
        });
};

// Delete a user with the specified userId in the request
exports.delete = (req, res) => {
    RegisterUser.findByIdAndRemove(req.params.registeruserId)
        .then(registeruser => {
            if (!registeruser) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.registeruserId
                });
            }
            res.send({ message: "User deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "User not found with id " + req.params.registeruserId
                });
            }
            return res.status(500).send({
                message: "Could not delete a user with id " + req.params.registeruserId
            });
        });
};