const axios = require('axios');
const jsonfile = require('jsonfile');
require('dotenv').config()

const fs = require('fs');
const path = require('path');
var amqp = require('amqplib/callback_api');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const ObjectID = require('mongodb').ObjectID;

//const statusUpdate = require('../constants/enum.js.js');

/** Get data plugs */
exports.getdataplugs = (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");

        //TODO: Change to user Id
        var query = { email: req.query.email };

        dbo.collection("users").findOne(query, function(err, result) {
            if (err) throw err;

            //Display dataplugs in profile
            var dataplugs = result.RPlug;
            if (dataplugs) {
                res.send({ dataplug: dataplugs });
            } else {
                res.send({ message: "No data plugs" });
            }

            db.close();
        });
    });
};