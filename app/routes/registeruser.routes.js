var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
// var MongoClient = require('mongodb').MongoClient;
// var url = 'mongodb://localhost:27017/dataprovider';


module.exports = (app) => {
    const registerusers = require('../controllers/registeruser.controller.js');

    /** GET PLUGS FROM HAT */
    /**
     * This endpoint retrieves data plugs from user's HAT
     * @route POST /data
     * @group Retrieve data plugs from the HAT
     * @param {string} email.body.required - username or email - eg: user@domain
     * @param {string} password.body.required - user's password.
     * @returns {object} 200 - User: {}
     * @returns {Error}  default - Unexpected error
     */
    app.post('/data', registerusers.getplugs);

    /** Check all owners for data item */


    /** OFFERS */
    // Get offers
    /**
     * This endpoint retrieves data plugs from user's HAT
     * @route GET /getoffers
     * @group GET all offers
     * @param {string} email.query.required - email - eg: user@domain
     * @returns {object} 200 - User: {}
     * @returns {Error}  default - Unexpected error
     */
    app.get('/getoffers', registerusers.getoffers);

    // Update an offer to accepted with userId
    /**
     * This endpoint retrieves data plugs from user's HAT
     * @route POST /offerAccepted
     * @group Accept an offer
     * @param {string} email.body.required - email - eg: user@domain
     * @param {string} plug.body.required - plug
     * @returns {object} 200 - User: {}
     * @returns {Error}  default - Unexpected error
     */
    app.post('/offerAccepted', registerusers.update);

    // Delete offer
    /**
     * This endpoint deletes an offer
     * @route Delete /DeleteOffer
     * @group Delete an offer
     * @param {string} email.query.required - email - eg: user@domain
     * @param {string} buy_data.query.required - plug
     * @returns {object} 200 - User: {}
     * @returns {Error}  default - Unexpected error
     */
    app.delete('/DeleteOffer', registerusers.delete);

    //=========================================================

    /** TRADES */
    //Get trades
    /**
     * This endpoint update a trade to 'TradeAccepted'
     * @route GET /gettrades
     * @group GET all trades
     * @param {string} email.query.required - email - eg: user@domain
     * @returns {object} 200 - trade: {}
     * @returns {Error}  default - Unexpected error
     */
    app.get('/gettrades', registerusers.gettrades);

    //Accept trade
    /**
     * This endpoint update a trade to 'TradeAccepted'
     * @route POST /tradeAccepted
     * @group Accept a trade
     * @param {string} email.query.required - email - eg: user@domain
     * @param {string} buy_data.query.required - plug
     * @returns {object} 200 - trade: {}
     * @returns {Error}  default - Unexpected error
     */
    app.post('/tradeAccepted', registerusers.trade);

    //Delete trade
    /**
     * This endpoint deletes a trade
     * @route Delete /DeleteTrade
     * @group Delete a trade
     * @param {string} email.query.required - email - eg: user@domain
     * @param {string} buy_data.query.required - plug
     * @returns {object} 200 - trade: {}
     * @returns {Error}  default - Unexpected error
     */
    app.delete('/DeleteTrade', registerusers.deletetrade);


    /** Get my data plugs */
    const gethatdata = require('../controllers/gethatdataplugs.controller.js');

    /** GETMYDATA */
    //Get my data
    /**
     * This endpoint gets my HAT data plugs
     * @route GET /hatdataplugs
     * @group GET all my data plugs
     * @param {string} email.query.required - email - eg: user@domain
     * @returns {object} 200 - dataplug: []
     * @returns {Error}  default - Unexpected error
     */
    app.get('/hatdataplugs', gethatdata.getdataplugs);
}