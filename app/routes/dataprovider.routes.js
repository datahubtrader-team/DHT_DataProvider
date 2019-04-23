module.exports = (app) => {
    const dataproviders = require('../controllers/dataprovider.controller.js');

    // Create a new DataProvider
    app.post('/dataproviders', dataproviders.create);

    // Retrieve all DataProviders
    app.get('/dataproviders', dataproviders.findAll);

    // Retrieve a single DataProvider with dataproviderId
    app.get('/dataproviders/:dataproviderId', dataproviders.findOne);

    // Update a DataProvider with dataproviderId
    app.put('/dataproviders/:dataproviderId', dataproviders.update);

    // Delete a DataProvider with dataproviderId
    app.delete('/dataproviders/:dataproviderId', dataproviders.delete);
}