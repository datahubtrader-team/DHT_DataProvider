const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = process.env.SANDBOX_MONGODBCLUSTER;
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
    const collection = client.db("Test").collection("TestCollection");
    // perform actions on the collection object
    var query = { Father: "Julian Hamm" };
    collection.find(query).toArray(function(err, result) {
        if (err) throw err;

        console.log(result);
    });
    client.close();
});