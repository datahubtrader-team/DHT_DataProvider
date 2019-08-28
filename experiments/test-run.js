const axios = require('axios');

const jsonfile = require('jsonfile')

const file = './data.json'
const obj = { name: 'JP' }

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// jsonfile.writeFile(file, obj, function(err) {
//     if (err) console.error(err)
//         //var words = JSON.parse(file);
//         //console.log(obj);
//     conn(obj)
// })

//Hide screte keys
var rest = require('rest-facade');
require('dotenv').config()

var amqp = require('amqplib/callback_api');

function conn(xx) {
    console.log(xx)
}

//TODO: Add all secrets and keys to env variables
//configuring the AWS environment
AWS.config.update({
    accessKeyId: process.env.AccesskeyID,
    secretAccessKey: process.env.Secretaccesskey
});


var s3 = new AWS.S3();

function writeFile(filetoupload, data) {

    jsonfile.writeFile(filetoupload, data, function(err) {
        if (err) console.error(err)
            //var words = JSON.parse(file);
            //console.log(obj);
        conn(data)

        uploadtoAWS(filetoupload);
    })




}




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
            WriteAWSURLtoMQ(data.Location);

            //TODO: Save this AWS URL link to the Owners record in the OwnersDB
        }
    });
}


// fs.writeFile("thing.json", dictstring);

//TODO: Pass in username and password to this function
function updateUser() {
    return axios.get('https://jhamm.hubat.net/users/access_token', {
            headers: {
                username: 'jhamm',
                password: '',
                Accept: 'application/json',
            }
        })
        .then(function(response) {
            console.log(response.data.accessToken);
            callEndpoint(response.data.accessToken);
            //response.data.accessToken
            //return response.data;

        })
        .catch(function(error) {
            console.log(error);
            updateUser();
        });
}

updateUser();

function callEndpoint(accessToken) {
    var USER_TOKEN = accessToken;

    //TODO: Concatenate this URL with the data plug that the Owners have in their HAT
    axios.get('https://jhamm.hubat.net/api/v2/data/calendar/google/events', { headers: { 'X-Auth-Token': USER_TOKEN, 'Content-Type': 'application/json' } })
        .then(response => {
            // If request is good...
            console.log(response.data);

            //TODO: Change the file to HAT URL - data plug
            writeFile('jhamm.json', response.data)


        })
        .catch((error) => {
            console.log('error ' + error);
        });

    // const AuthStr = ''.concat(USER_TOKEN);

}

//TODO: Send AWS URL to trade MQ
function WriteAWSURLtoMQ(AWSURL) {
    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            //TODO: Name the trade MQ
            var queue = 'hello';
            var msg = AWSURL;

            channel.assertQueue(queue, {
                durable: false
            });
            channel.sendToQueue(queue, Buffer.from(msg));

            console.log(" [x] Sent %s", msg);
        });
        setTimeout(function() {
            connection.close();
            process.exit(0);
        }, 500);
    });
}


// Delete the generated file
function DeleteLocalFile(deleteFile) {
    fs.unlink('./test/' + deleteFile, function(error) {
        if (error) {
            throw error;
        }
        console.log('Deleted ' + deleteFile + '!!');
    });
}


// console.log(updateUser());

// var USER_TOKEN = response.data.accessToken;

// axios.get('https://jhamm.hubat.net/api/v2/data/calendar/google/events', { headers: { 'X-Auth-Token': USER_TOKEN, 'Content-Type': 'application/json' } })
//     .then(response => {
//         // If request is good...
//         console.log(response.data);
//     })
//     .catch((error) => {
//         console.log('error ' + error);
//     });

//const AuthStr = ''.concat(USER_TOKEN);