const DataProvider = require('../models/dataprovider.model.js');
const statusUpdate = require('../Enums/enum.js');

var amqp = require('amqplib/callback_api');

var rest = require('rest-facade');
require('dotenv').config()

const axios = require('axios');

//TODO: Connect to personal HAT


//TODO: Once data is pulled from the HAT, check data plugs 


// Create and Save a new Data provider msg
exports.create = (req, res) => {
    // Validate request
    if (!req.body.message) {
        return res.status(400).send({
            message: "Data provider msg content can not be empty " + req.body
        });
    }
    res.status(201);

    // Create an Data provider msg
    var dataprovider = new DataProvider({
        firstName: req.body.firstName || "Unknown firstName",
        lastName: req.body.lastName,
        email: req.body.email,
        number: req.body.number,
        status: statusUpdate.createRequest
    });

    // Save Data provider msg in the database
    dataprovider.save()
        .then(data => {
            res.send(data);
            //res.end("Test");
            addMsgOntoQueue(dataprovider.toString());
            Broadcast_data_onMarketplace(req);

        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the data provider msg."
            });
        });
};

var dataprovider;

function addMsgOntoQueue(dataprovider) {
    //Connect to Rabbit MQ and publish msg onto the queue
    amqp.connect('amqp://localhost', function(err, conn) {
        conn.createChannel(function(err, ch) {
            var mq = 'DataProvider_audit';
            ch.assertQueue(mq, { durable: false });
            ch.sendToQueue(mq, Buffer.from(dataprovider.toString()));
        });
        setTimeout(function() {
            conn.close();
        }, 500);
    });
}

function Broadcast_data_onMarketplace(req) {
    //POST  endpoint in Market place service
    axios.post('http://localhost:5010/marketplace/dataprovider', {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            number: req.body.number,
            message: "From Data Provider 1"
        })
        .then(function(response) {
            console.log(response);
        })
        .catch(function(error) {
            console.log(error);
        });
}

// Retrieve and return all DataProvider msg from the database.
exports.findAll = (req, res) => {
    DataProvider.find()
        .then(DataProviders => {
            res.send(DataProviders);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving DataProvider msg."
            });
        });
};

// Find a single dataprovider with a DataProviderId
exports.findOne = (req, res) => {
    DataProvider.findById(req.params.dataproviderId)
        .then(dataprovider => {
            if (!dataprovider) {
                return res.status(404).send({
                    message: "dataprovider msg not found with id " + req.params.dataproviderId
                });
            }
            res.send(dataprovider);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Datap rovider msg not found with id " + req.params.dataproviderId
                });
            }
            return res.status(500).send({
                message: "Error retrieving dataprovider with id " + req.params.dataproviderId
            });
        });
};

// Update a dataprovider msg identified by the dataproviderId in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body.content) {
        return res.status(400).send({
            message: "DataProvider content can not be empty"
        });
    }

    // Find dataprovider msg and update it with the request body
    DataProvider.findByIdAndUpdate(req.params.dataproviderId, {
            firstName: req.body.firstName || "Unknown firstName",
            lastName: req.body.lastName,
            email: req.body.email,
            number: req.body.number,
        }, { new: true })
        .then(dataprovider => {
            if (!dataprovider) {
                return res.status(404).send({
                    message: "Data provider msg not found with id " + req.params.dataproviderId
                });
            }
            res.send(dataprovider);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Data provider msg not found with id " + req.params.dataproviderId
                });
            }
            return res.status(500).send({
                message: "Error updating dataprovider msg with id " + req.params.dataproviderId
            });
        });
};

// Delete a dataprovider with the specified dataproviderId in the request
exports.delete = (req, res) => {
    DataProvider.findByIdAndRemove(req.params.dataproviderId)
        .then(dataprovider => {
            if (!dataprovider) {
                return res.status(404).send({
                    message: "Dataprovider msg not found with id " + req.params.dataproviderId
                });
            }
            res.send({ message: "Dataprovider msg deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Dataprovider msg not found with id " + req.params.dataproviderId
                });
            }
            return res.status(500).send({
                message: "Could not delete dataprovider msg with id " + req.params.dataproviderId
            });
        });
};