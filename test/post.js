process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');

const app = require('../server.js');

const conn = require('../db/index.js');

describe('POST /tradeAccepted', () => {
    before((done) => {
        conn.connect()
            .then(() => done())
            .catch((err) => done(err));

    })

    after((done) => {
        conn.close()
            .then(() => done())
            .catch((err) => done(err));
        //done();
    })

    it('OK, accepting a trade', (done) => {
        //request(app).post('/tradeAccepted')
        request(app).get('/')
            // .send({
            //     "email": "julianhamm1@gmail.com",
            //     "plug": "spotify"
            // })
            .then((res) => {
                const body = res.body;
                console.log(body);
                //expect(200, done);
                //expect(body).to.contain.property('email');
                //expect(body).to.contain.property('name');
                //expect(body).to.contain.property('text');
                done();

            })
            .catch((err) => done(err));
    });

})