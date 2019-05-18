var ObjectID = require('mongodb').ObjectID;
const DataProvider = require('../models/dataprovider.model.js');
const AwsUrl = require('../models/awsurl.model.js');

module.exports = function(app, db) {
    const dataproviders = require('../controllers/dataprovider.controller.js');

    // Login to PDS
    app.post('/loginpds', dataproviders.loginpds);

    // HAT
    app.post('/hat', dataproviders.hat);

    // Retrieve all DataProviders
    app.get('/urls', dataproviders.findAllUrls);

    // Create a new DataProvider
    app.post('/dataproviders', dataproviders.create);

    // Send a notification to data provider
    app.post('/dataproviders/:dataproviderId', dataproviders.notification);

    // Retrieve all DataProviders
    app.get('/dataproviders', dataproviders.findAll);

    // Retrieve a single DataProvider with dataproviderId
    app.get('/dataproviders/:dataproviderId', dataproviders.findOne);

    // Update a DataProvider with dataproviderId
    //app.put('/dataproviders/:dataproviderId', dataproviders.update);
    app.put('/dataproviders/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectID(id) };
        const note = {
            firstName: req.body.firstName || "Unknown firstName",
            lastName: req.body.lastName,
            //email: req.body.email,
            //number: req.body.number,
            status: "statusUpdate.createRequest"
        };
        DataProvider.findByIdAndUpdate(details, note, { new: true })
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
    });

    //TODO: Update and insert data in existing record



    // Delete a DataProvider with dataproviderId
    app.delete('/dataproviders/:dataproviderId', dataproviders.delete);
}