var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const axios = require('axios');
const fs = require('fs');
const path = require('path');

var searchQuery = "spotify";

function checkDataplug() {

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        var query = {
            //email: "4",
            RPlug: { $elemMatch: { plug: searchQuery } }
        };
        dbo.collection("users").find(query).toArray(function(err, result) {
            if (err) throw err;

            //console.log(result);
            var data = result[0].RPlug;

            var ownersRecord = result;

            ownersRecord.forEach(function(ele) {
                console.log(ele);

                var offer = {
                    "offerId": "OfferTradeId",
                    "buy_data": "requestedPlug",
                    "value": "0.00",
                    "offerAccepted": null,
                    "trade": null,
                    "buyerId": "buyerId"
                };

                //logger.info("Offer object appended to Owner's record: " + offer);
                var search = { "email": ele.email }
                dbo.collection("users").updateMany(search, { $push: { offer } }, function(err, res) {
                    if (err) throw err;
                    console.log(res);
                    //logger.info("Offer object response: " + res);
                    db.close();
                });


            });



            db.close();
        });
    });

}

checkDataplug();