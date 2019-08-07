var jwtDecode = require('jwt-decode');

var token = '';

var decoded = jwtDecode(token);
console.log(decoded);

console.log(decoded._id);