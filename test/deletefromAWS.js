// const AWS = require('aws-sdk');
// // var request = require("request");
// require('dotenv').config()

// //TODO: Add all secrets and keys to env variables
// //configuring the AWS environment
// AWS.config.update({
//     accessKeyId: process.env.AccesskeyID,
//     secretAccessKey: process.env.Secretaccesskey
// });

// var s3 = new AWS.S3();

// var deleteParam = {
//     Bucket: 'hamm1',
//     Delete: {
//         Objects: [
//             { Key: '1558345344020_jhamm.json' }
//         ]
//     }
// };
// s3.deleteObjects(deleteParam, function(err, data) {
//     if (err) console.log(err, err.stack);
//     else console.log('delete', data);
// });


var str = "";
var res = str.split("com/", 2);
console.log(res[1].toString());