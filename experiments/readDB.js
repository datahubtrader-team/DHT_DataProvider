const MongoClient = require('mongodb').MongoClient;
//const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'dataprovider';

// Use connect method to connect to the server
MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    //assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    db.collection("awsurls").find({}).toArray(function(err, result) {
        if (err) throw err;
        //console.log(result[0].url);
        result.forEach((value) => {
            console.log(value.url, value._id);
            //TODO: Function call to delete aws url off DB
            //TODO: Function call to delete aws url off AWS
        });
        client.close();
    });
});

//TODO: Delete URL from DB



//TODO: Delete file on AWS S3