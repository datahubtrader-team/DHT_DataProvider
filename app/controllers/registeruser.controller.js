//const RegisterUser = require('../models/registeruser.model.js');
//const statusUpdate = require('../constants/enum.js.js');

var amqp = require('amqplib/callback_api');

const axios = require('axios');
const jsonfile = require('jsonfile');
require('dotenv').config()

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
var amqp = require('amqplib/callback_api');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const ObjectID = require('mongodb').ObjectID;

const hatAdapater = require("../pds.ApiClient/hat/hatAdapter");

/** Get data plugs */
exports.getplugs = (req, res) => {

    console.log(req.body.email);
    console.log(req.body.username);
    //====================================
    var username = req.body.username;
    // return axios.get('https://' + req.body.username + '.hubat.net/users/access_token', {
    //         headers: {
    //             username: req.body.username,
    //             password: req.body.password,
    //             Accept: 'application/json',
    //         }
    //     })
    hatAdapater.getToken(req.body.username, req.body.password, (err, result) => {
            console.log(result);
        })
        .then(function(response) {
            console.log(response.data.accessToken);
            res.send({ token: response.data.accessToken });
            logintogetdataplugs(req.body.email, username, response.data.accessToken);

        })
        .catch(function(error) {
            console.log(error);
            updateUser();
        });
};

function logintogetdataplugs(email, username, accesstoken) {
    return axios.get('https://' + username + '.hubat.net/api/v2.6/applications', {
            headers: {
                'X-Auth-Token': accesstoken,
                Accept: 'application/json',
            }
        })
        .then(function(response) {
            var plugs = response.data;

            var data = [];

            plugs.forEach(function(element) {
                //console.log(element);
                if (element.active === true) {
                    var feed = { "plug": element.application.id, "URL": element.application.status.recentDataCheckEndpoint };

                    data.push(feed);
                }

            });

            // Add to Data Owner record in DB
            MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                if (err) throw err;
                var dbo = db.db("OwnerDB");
                var myquery = { "email": email }; //requestedPlug

                data.forEach(function(element) {
                    var RPlug = {
                        "plug": element.plug,
                        "URL": element.URL
                    };
                    console.log(RPlug);

                    dbo.collection("users").updateMany(myquery, { $addToSet: { RPlug } }, function(err, res) {
                        if (err) throw err;
                        //console.log(res);
                        db.close();
                    });
                });
            });
        })
        .catch(function(error) {
            console.log(error);

        });
}

// Retrieve all offers for an Owner's record
exports.getoffers = (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        var query = { email: req.query.email };

        dbo.collection("users").findOne(query, function(err, result) {
            if (err) throw err;

            //display offers that are in false and null state

            var offers = result.offer;
            if (offers) {
                console.log(offers);

                var newDate = new Date();
                newDate.setDate(newDate.getDate());
                var today = newDate.toISOString().slice(0, 10);

                console.log("Today's date: " + today);

                offers.forEach(function(eachOffer) {

                    //Check if the offer deadline date has expired or not
                    if (eachOffer.deadline != today) {

                        res.send([eachOffer]);

                        //TODO: If it has, then notify the data owner and do not display it
                    }

                });

            } else {

                //TODO: Pass in the constants for this message
                res.send({ message: "This owner has no offers" });
            }
            db.close();
        });
    });
};

// Update offer to true -- Offers have been accepted
exports.update = (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");

        //TODO: Pass in the offerId
        var plugs = {
            "offer.buy_data": req.body.plug,
            "email": req.body.email
        };
        console.log(plugs);
        dbo.collection("users").updateMany(plugs, { $set: { "offer.$.offerAccepted": true } }, function(err, result) {
            if (err) throw err;
            //console.log(result);
            //res.send(result);

            // search for the changed Offer to accepted

            dbo.collection("users").find({ email: req.body.email }).toArray(function(err, result) {
                if (err) throw err;
                //console.log(result.offer[0]);
                let xx = result[0].offer;

                //console.log(xx);
                xx.forEach(function(offerelement) {
                    if (offerelement.buy_data == req.body.plug) {
                        console.log(offerelement);

                        // Add Offer Object to Buyers record
                        var buyersId = offerelement.buyerId;
                        var offersId = offerelement.offerId;
                        var buyData = offerelement.buy_data;
                        var offeraccepted = offerelement.offerAccepted;
                        var OwnersId = result[0]._id;
                        var valueofdata = offerelement.value;

                        console.log("Owners ID as a test " + OwnersId);

                        SendOfferAcceptedtoBuyer(buyersId, offersId, buyData, offeraccepted, OwnersId, valueofdata);
                    }

                });
                //AddtoDataTraderDB(result)



                // 

                console.log("This is a test ");

                console.log(result);
                res.send(result);
                db.close();
            });

            db.close();
        });

    });
};

function SendOfferAcceptedtoBuyer(buyersId, offersId, buyData, offeraccepted, OwnersId, valueofdata) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        //var generateOfferId = cryptoRandomString({ length: 6 });
        var dbo = db.db("BuyerDB");
        var myquery = { _id: new ObjectID(buyersId) };
        console.log(myquery);
        var offersAccepted = {
            offerId: offersId,
            buy_data: buyData,
            value: valueofdata,
            offerAccepted: offeraccepted,
            trade: null,
            OwnerId: OwnersId
        };


        //dbo.collection("users").findOne(myquery,
        dbo.collection("users").updateMany(myquery, { $addToSet: { offersAccepted } },
            function(err, res) {
                if (err) throw err;
                console.log(res.result);
                //countAccepted endpoint in Data Consumer service
                console.log("This is a test " + buyersId);
                return axios.get('http://localhost:4025/countAcceptedTrades' + '?buyerId=' + buyersId + '&offersID=' + offersAccepted.offerId)
                    .then(function(response) {
                        console.log(response.data);

                    })
                    .catch(function(error) {
                        console.log(error);
                    });
                db.close();
            });


    });
}


// Add AcceptedOffer to DataTrader DB
function AddtoDataTraderDB(OwnerAcceptedOffer) {

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("DataProvider");

        dbo.collection("OfferAccepted").insertMany(OwnerAcceptedOffer, function(err, result) {
            if (err) throw err;
            console.log(result);
            //res.send(result);
            db.close();

            //TODO: Call the GET endpoint in the Data Consumer service to check if the
            //Offers Accepted in the DataTrader DB equals the participant_min

        });

    });
}

// Get all trades in Owners record
exports.gettrades = (req, res) => {
    console.log("================" + req.body.password);
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        var query = { email: req.query.email };

        dbo.collection("users").findOne(query, function(err, result) {
            if (err) throw err;

            console.log(result);
            //res.send(result);

            //display trades that are in TradeRequested state
            var tradesRequested = result.offer;
            res.send(tradesRequested);

            // for (i in tradesRequested) {
            //     if (tradesRequested[i].trade == "tradeRequested") {
            //         res.send(tradesRequested);
            //     } else {
            //         res.send("No trades triggered yet");
            //     }
            // }

            db.close();
        });
    });
};


// Update trade to TradeAccepted
exports.trade = (req, res) => {
    //TODO: Validation rule: Check if the offerAccepted field is set to true AND 


    // Trade is set to tradeRequested
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        //var query = {"offer."req.query.plug }
        var plugs = {
            "offer.buy_data": req.body.plug,
            "email": req.body.email
        };
        console.log(req.body.plug);
        dbo.collection("users").findOneAndUpdate(plugs, { $set: { "offer.$.trade": "tradeAccepted" } }, function(err, result) {
            if (err) throw err;
            //console.log(result);
            //res.send(result);

            // search for the changed Trade to accepted
            dbo.collection("users").find({ email: req.body.email }).toArray(function(err, result) {
                if (err) throw err;
                console.log(result.offer);

                res.send(result);

                //TODO: Update TradeComplete collection in DataTrader DB


                //Read data from HAT and add it to MQ
                var data = result[0].RPlug;

                //console.log("This is an example  " + result[0].name);

                data.forEach(function(ele) {


                    //console.log(ele.plug);
                    if (ele.plug == "spotify") {
                        console.log(ele.URL);
                        console.log("Strings are equal");

                        //Pass in username, and password
                        updateUser(ele.URL, result[0].name, result[0].password);

                    } else {
                        //console.log("NOT equal");
                    }

                });

                db.close();
            });

            db.close();
        });

    });
};


//TODO: Read data from HAT and add it to MQ

//configuring the AWS environment
AWS.config.update({
    accessKeyId: process.env.AccesskeyID,
    secretAccessKey: process.env.Secretaccesskey
});

var s3 = new AWS.S3();

function conn(xx) {
    console.log(xx)
}

function writeFile(bucketName, filetoupload, data) {

    jsonfile.writeFile(filetoupload, data, function(err) {
        if (err) console.error(err)

        uploadtoAWS(bucketName, filetoupload);
        //createBucket(bucketName, filetoupload);
    })
}

function createBucket(bucketName, filetoUpload) {
    // Create the parameters for calling createBucket
    var bucketParams = {
        Bucket: bucketName,
        ACL: 'public-read'
    };

    // call S3 to create the bucket
    s3.createBucket(bucketParams, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Location);
            uploadtoAWS(bucketName, filetoUpload);
        }

        if (err.code == "BucketAlreadyExists") {
            console.log("recall the function to create a unique bucket name");
        }
    });
}

function uploadtoAWS(bucketName, filePath) {

    //var filePath = "./jhamm.json";
    const FILE_PERMISSION = 'public-read';

    //configuring parameters
    var params = {
        Bucket: bucketName,
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

            //Add the AWS URL to MQ
            WriteAWSURLtoMQ(data.Location);

            //TODO: Save this AWS URL link to the Owner's record in the OwnersDB
        }
    });
}



//TODO: Pass in username and password to this function
function updateUser(plug, username, password) {
    return axios.get('https://' + username + '.hubat.net/users/access_token', {
            headers: {
                username: username,
                password: password,
                Accept: 'application/json',
            }
        })
        .then(function(response) {
            console.log(response.data.accessToken);

            callEndpoint(plug, username, response.data.accessToken);

        })
        .catch(function(error) {
            console.log(error);
            updateUser();
        });
}

//Pass in plug URL
//TODO: Pass in username to this function
function callEndpoint(plug, username, accessToken) {
    var USER_TOKEN = accessToken;
    console.log("Plugs to read from " + plug);
    //Concatenate this URL with the data plug that the Owners have in their HAT
    axios.get('https://' + username + '.hubat.net/api/v2/data/' + plug, { headers: { 'X-Auth-Token': USER_TOKEN, 'Content-Type': 'application/json' } })
        .then(response => {

            //TODO: Change the file to HAT URL - data plug
            writeFile(username, username + '.json', response.data)

        })
        .catch((error) => {
            console.log('error ' + error);
        });

}

//Send AWS URL to trade MQ
function WriteAWSURLtoMQ(AWSURL) {
    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            //Name the trade MQ
            var queue = 'tradeAccepted';
            var msg = AWSURL;

            channel.assertQueue(queue, {
                durable: false
            });
            channel.sendToQueue(queue, Buffer.from(msg));

            console.log(" [x] Sent %s", msg);
        });
        setTimeout(function() {
            connection.close();
        }, 500);
    });
}


// Decline offers - Delete an offer in 'OfferTradeObject' by Id in the Owners DB
exports.delete = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        var userId = { "email": req.query.email };
        var offertradeId = { "offer.buy_data": req.query.buy_data };

        //TODO: Need to query with the id of the offersandtrade object
        dbo.collection("users").updateOne(userId, { $pull: { offer: offertradeId } }, { multi: true },
            function(err, result) {
                if (err) throw err;
                console.log("Deleted offer");
                res.send(result);
                db.close();
            });

    });
};


// Decline trades - Delete a trade in 'OfferTradeObject' by Id in the Owners DB
exports.deletetrade = (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        var userId = { "email": req.query.email };
        var offertradeId = { "offer.buy_data": req.query.buy_data };

        //TODO: Need to query with the id of the offersandtrade object
        dbo.collection("users").updateOne(userId, { $pull: { offer: offertradeId } }, { multi: true },
            function(err, result) {
                if (err) throw err;
                console.log("Deleted trade");
                res.send(result);
                db.close();
            });

    });
};

// Endpoint to List Offers