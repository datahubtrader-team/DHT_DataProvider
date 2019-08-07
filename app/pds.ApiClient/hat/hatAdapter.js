const axios = require('axios');
const jsonfile = require('jsonfile');

// Get HAT token
module.exports.getToken = function(username, password) {

    return axios.get('https://' + username + '.hubat.net/users/access_token', {
        headers: {
            username: username,
            password: password,
            Accept: 'application/json',
        }
    })
};