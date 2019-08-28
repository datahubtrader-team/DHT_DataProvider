const axios = require('axios');

const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AccesskeyID,
    secretAccessKey: process.env.Secretaccesskey
});

var s3 = new AWS.S3();

// Create the parameters for calling createBucket
var bucketParams = {
    Bucket: 'drjay',
    ACL: 'public-read'
};

// call S3 to create the bucket
s3.createBucket(bucketParams, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data.Location);
    }


    //console.log("==============" + err.code);

    if (err.code == "BucketAlreadyExists") {
        console.log("recall the function to create a unique bucket name");
    }
});