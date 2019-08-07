var nock = require('nock');
var request = require('supertest')("http://api.postcodes.io");
var expect = require('chai').expect;


//TODO: Write unit tests for this service
describe("Testing API with a mocked backend", function() {

    it("returns a successful mocked response", function(done) {

        //specify the url to be intercepted
        nock("http://api.postcodes.io")
            //define the method to be intercepted
            .post('/login', { username: 'pgte', password: '123' })
            //respond with a OK and the specified JSON response
            .reply(200, {
                "status": 200,
                "message": "This is a mocked response"
            });

        //perform the request to the api which will now be intercepted by nock
        request
            .post('/login', { username: 'pgte', password: '123' })
            .end(function(err, res) {
                //assert that the mocked response is returned
                expect(res.body.status).to.equal(200);
                expect(res.body.message).to.equal("This is a mocked response");
                //console.log(res.body);
                done();
            });
    })
});