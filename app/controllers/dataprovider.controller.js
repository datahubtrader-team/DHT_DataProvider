const DataProvider = require('../models/dataprovider.model.js');
const PDSLogin = require('../models/login.model.js');
const AWSURL = require('../models/awsurl.model.js');
const statusUpdate = require('../constants/enum.js.js');

var amqp = require('amqplib/callback_api');

var rest = require('rest-facade');
var request = require("request");
require('dotenv').config()

const axios = require('axios');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile')

// Logger lib
var logger = require('../../node_modules/logger').createLogger(); // logs to STDOUT
var logger = require('../../node_modules/logger').createLogger('development.log'); // logs to a file

//TODO: Move the Login to personal HAT in a separate function



exports.loginpds = (req, res) => {

    // Validate request
    if (!req.body.message) {
        return res.status(400).send({
            message: "Data provider msg content can not be empty " + req.body
        });
        //TODO: Log error to log file

    }

    res.status(200);


    axios.get('https://jhamm.hubat.net/users/access_token', {
            headers: {
                username: req.body.username,
                password: req.body.password,
                Accept: 'application/json',
            }
        })
        .then(function(response) {
            console.log(response.data.accessToken);
            res.send(response.data);

        })
        .catch(function(error) {
            console.log(error);
            updateUser();
        });


    // Create an Data provider msg
    var loginpds = new PDSLogin({
        username: req.body.username || "Unknown username",
        password: req.body.password
    });

    // Save loginpds msg in the database
    loginpds.save()
        .then(data => {
            res.send(data);



        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the data provider msg."
            });
        });
};

//Retrieve data from HAT
exports.hat = (req, res) => {

    // Validate request
    if (!req.body.message) {
        logger.info("*************************");
        return res.status(400).send({
            message: "Data provider msg content can not be empty " + req.body
        });
    }

    res.status(200);


    axios.get('https://jhamm.hubat.net/users/access_token', {
            headers: {
                username: req.body.username,
                password: req.body.password,
                Accept: 'application/json',
            }
        })
        .then(function(response) {
            console.log(response.data.accessToken);
            res.send(response.data);
            callHATEndpoint(response.data.accessToken);
            //res.send("Done");
            //console.log(getSlaveURL);
        })
        .catch(function(error) {
            console.log(error);
            updateUser();
        });



    // Create an Data provider msg
    var loginpds = new PDSLogin({
        username: req.body.username || "Unknown username",
        password: req.body.password
    });

    // Save loginpds msg in the database
    loginpds.save()
        .then(data => {
            //res.send(data);
            //res.send(getSlaveURL);

        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the data provider msg."
            });
        });
};

//TODO: Add all secrets and keys to env variables
//configuring the AWS environment
AWS.config.update({
    accessKeyId: "",
    secretAccessKey: ""
});

var s3 = new AWS.S3();



function uploadtoAWS(filePath) {

    //var filePath = "./jhamm.json";
    const FILE_PERMISSION = 'public-read';

    //configuring parameters
    var params = {
        Bucket: 'hamm1',
        Body: fs.createReadStream(filePath),
        Key: Date.now() + "_" + path.basename(filePath),
        ACL: FILE_PERMISSION
    };

    s3.upload(params, function(err, data) {
        //handle error
        if (err) {
            console.log("Error", err);
        }

        //success
        if (data) {
            console.log("Uploaded in:", data.Location);

            //TODO: Add this URL to a database and to a MQ

            // Create an Data provider msg
            var awslink = new AWSURL({
                url: data.Location
            });

            // Save Data provider msg in the database
            awslink.save()
                .then(data => {
                    //res.send(data);

                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the data provider msg."
                    });
                });

        }
    });
}

function writeFile(filetoupload, data) {

    jsonfile.writeFile(filetoupload, data, function(err) {
        if (err) console.error(err)
            //var words = JSON.parse(file);
            //console.log(obj);
            //conn(data)

        uploadtoAWS(filetoupload);
    })

}

function callHATEndpoint(accessToken) {
    var USER_TOKEN = accessToken;

    axios.get('https://jhamm.hubat.net/api/v2/data/calendar/google/events', { headers: { 'X-Auth-Token': USER_TOKEN, 'Content-Type': 'application/json' } })
        .then(response => {
            // If request is good...
            //console.log(response.data);

            //TODO: Change the file to HAT URL - data plug
            writeFile('jhamm.json', response.data)

            //TODO: Call the function to delete the local file

        })
        .catch((error) => {
            console.log('error ' + error);
        });

    // const AuthStr = ''.concat(USER_TOKEN);

}


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
            //Broadcast_data_onMarketplace(req);

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

// function Broadcast_data_onMarketplace(req) {
//     //POST  endpoint in Market place service
//     axios.post('http://localhost:5010/marketplace/dataprovider', {
//             firstName: req.body.firstName,
//             lastName: req.body.lastName,
//             email: req.body.email,
//             number: req.body.number,
//             message: "From Data Provider 1"
//         })
//         .then(function(response) {
//             console.log(response);
//         })
//         .catch(function(error) {
//             console.log(error);
//         });
// }

//TODO: POST {data owner Id} notification endpoint called by market place service
// data in the body should contain: data buyer Id, satisfies data qualifier
exports.notification = (req, res) => {
    // Validate Request
    if (!req.body.content) {
        return res.status(400).send({
            message: "Empty request"
        });
    }

    // POST notification msg to data provider
    DataProvider.findByIdAndUpdate(req.params.dataproviderId, {
            databuyerId: req.body.databuyerId || "Unknown databuyerId",
            dataqualifier: req.body.dataqualifier
        }, { new: true })
        .then(dataprovider => {
            if (!dataprovider) {
                return res.status(404).send({
                    message: "Data provider msg not found with id " + req.params.dataproviderId
                });
            }
            res.send(dataprovider);
            console.log(dataprovider);
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

// Retrieve and return all AWSURL from the database.
exports.findAllUrls = (req, res) => {
    AWSURL.find()
        .then(AWSURLs => {
            res.send(AWSURLs);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving AWSURL."
            });
        });
};

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
            status: statusUpdate.createRequest
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