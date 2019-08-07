var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const axios = require('axios');
const fs = require('fs');
const path = require('path');

//Generate random number
const cryptoRandomString = require('crypto-random-string');

//Example of how to read from a MongoDB
function ReadfromDB() {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        var query = { email: "4" };
        dbo.collection("users").find(query).toArray(function(err, result) {
            if (err) throw err;
            //console.log(result.offer);
            var arrayOfObjects = result;
            for (var i = 0; i < arrayOfObjects.length; i++) {
                var object = arrayOfObjects[i];
                console.log(object.offer.length);
                // If property names are known beforehand, you can also just do e.g.
                // alert(object.id + ',' + object.Title);
            }
            db.close();
        });
    });
}
//ReadfromDB();

//Retrieve plug data from HAT PDS
// Pass in user Id or email
function RetrievePlugfromHAT() {
    return axios.get('https://jhamm.hubat.net/api/v2.6/applications', {
            headers: {
                'X-Auth-Token': '',
                Accept: 'application/json',
            }
        })
        .then(function(response) {
            //console.log(response.data);

            var plugs = response.data;

            var data = [];

            plugs.forEach(function(element) {
                //console.log(element);
                if (element.active === true) {

                    //console.log(element.application.id);
                    //console.log("URL: ", element.application.status.recentDataCheckEndpoint);

                    var feed = { "plug": element.application.id, "URL": element.application.status.recentDataCheckEndpoint };

                    data.push(feed);



                }

            });

            //console.log(data);

            //console.log(data);

            // Add to Data Owner record in DB
            MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                if (err) throw err;
                var dbo = db.db("OwnerDB");
                var myquery = { "email": "email10" }; //requestedPlug

                data.forEach(function(element) {
                    var RPlug = {
                        "plug": element.plug,
                        "URL": element.URL
                    };
                    console.log(RPlug);

                    dbo.collection("users").updateMany(myquery, { $push: { RPlug } }, function(err, res) {
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

RetrievePlugfromHAT()

//TODO: Read from OwnerDB if Owners have a certain plug in their record (e.g. on the HAT)
function ReadfromplugarrayinDB() {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        var query = {
            email: "4",
            RPlug: { $elemMatch: { plug: "spotify" } }
        };
        dbo.collection("users").find(query).toArray(function(err, result) {
            if (err) throw err;
            //console.log(result[0].RPlug);
            // if (result[0].RPlug[0].plug == "spotify") {
            //     console.log("true");
            //     console.log(result[0].RPlug[0].plug);
            // }
            var data = result[0].RPlug;
            data.forEach(function(ele) {

                //console.log(ele.plug);
                if (ele.plug == "spotify") {
                    console.log(ele.URL);
                    console.log("Strings are equal");

                    // Method call to send offers to Data Owners

                } else {
                    //console.log("NOT equal");
                }

            });

            db.close();
        });
    });
}
//ReadfromplugarrayinDB();

// Add field i.e. Trade = TradeRequest to Owner's record
function AddTradeFieldtoOwnersRecord() {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        var searchedplug = "spotify";
        var query = { RPlug: { $elemMatch: { plug: searchedplug } } };
        var newvalues = { $push: { "RPlug.$.4": { trade: "tradeRequest" } } };
        //TODO: Need to query with the id of the offersandtrade object
        dbo.collection("users").update(query, newvalues, function(err, doc) {
            if (err) throw err;
            console.log("Updated");

            db.close();
        });

    });
}

//AddTradeFieldtoOwnersRecord()

//TODO: Generate random guid for OffersandTrades object
//console.log(cryptoRandomString({ length: 6 }));

// Delete element in array in DataTrader DB
function DeleteElementinArrayinDB() {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        // var searchedplug = "xxx";
        // var query = { $elemMatch: { plug: searchedplug } };
        // var newvalues = { $pull: { "RPlug.$.0": { "plug": "hatapp" } } };
        var offertradeId = { "you": "me" }
            //TODO: Need to query with the id of the offersandtrade object
        dbo.collection("users").updateOne({ email: "4" }, { $pull: { test: offertradeId } }, { multi: true },
            function(err, doc) {
                if (err) throw err;
                console.log("Updated");

                db.close();
            });

    });
}

//DeleteElementinArrayinDB();



//TODO: Search for guid in the array of OffersandTrades objects to change a field e.g. trade = tradeRequest



//Count records in a collection
function CountrecordsinDB() {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("DataProvider");
        //var query = { email: "4" };
        dbo.collection("OfferAccepted").countDocuments(function(err, result) {
            if (err) throw err;
            console.log(result);

            var dbo = db.db("BuyerDB");
            var query = { email: "4" };
            dbo.collection("searchrequests").find({ search: "instagram" }).toArray(function(err, response) {
                if (err) throw err;
                //console.log(result.offer);
                var searchQ = parseInt(response[0].participant_min);
                console.log(searchQ);
                //Compare the OfferAccepted collection records to the Participant Min in the Buyer's record
                if (result === searchQ) {
                    console.log(true);
                    //TODO: Move the offer records from the OfferAccepted collection to the TradeRequests
                } else {
                    console.log(false);
                }
                db.close();
            });

            //db.close();
        });
    });
}

//CountrecordsinDB();

//Change field in array of objects
function ChangeValueinArray() {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("OwnerDB");
        var query = { email: "4" };
        var newvalues = { "offer.$.offerAccepted": true };
        console.log(query);
        dbo.collection("users").update({ "offer.buy_data": "instagram" }, { $set: { "offer.$.offerAccepted": true } }, function(err, result) {
            if (err) throw err;
            console.log(" document(s) updated");
            console.log(result);
            //res.send(result);
            db.close();
        });
    });
}

//ChangeValueinArray();
//Add to document to a collection


//Update an existing collection with data

// MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("OwnerDB");
//     var myquery = { email: "4" };
//     var newvalues = { $set: { plug: "Twitter" } };
//     dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
//         if (err) throw err;
//         console.log("1 document updated");
//         db.close();
//     });
// });


//Update an existing collection with json array data
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("OwnerDB");
//     var myquery = { email: "3" };
//     var object6 = [
//         { "subject": "maths" },
//         { "subject": "chem" },
//         { "subject": "english" }
//     ];
//     dbo.collection("users").update(myquery, { $push: { object6 } }, function(err, res) {
//         if (err) throw err;
//         console.log(res);
//         db.close();
//     });
// });

//Read data from array in DB
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db("OwnerDB");
//     //var query = { "name": "3" };
//     var query = {
//         "object1": { $elemMatch: "maths" }
//     };
//     dbo.collection("users").find(query).toArray(function(err, result) {
//         if (err) throw err;
//         console.log(result);
//         db.close();
//     });
// });

//Read from the HAT /applications endpoint to see which plugs that the Owners has
/*
var jsonData = JSON.parse(responseBody);
console.log(jsonData[19].application.id);

var plugs = jsonData;

plugs.forEach(function(element) {
  //console.log(element);
    if (element.active === true){
        //console.log("Got this plug");
        console.log(element.application.id);
        console.log("URL: ", element.application.status.recentDataCheckEndpoint);
    }
});

//if (jsonData[19].application.id == "spotify" && jsonData[19].active === true){
    console.log("Got this plug");
//}
*/

//