var fs = require('fs');


fs.unlink('./test/jhamm.json', function(error) {
    if (error) {
        throw error;
    }
    console.log('Deleted jhamm.json!!');
});