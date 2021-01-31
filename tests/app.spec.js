'use strict';

const assert = require('assert');
const request = require('supertest');


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      done();
    });
  });

  const compareRideDetails = (expected, actual) => {
    assert.strictEqual(expected.start_lat, actual.startLat);
    assert.strictEqual(expected.start_long, actual.startLong);
    assert.strictEqual(expected.end_lat, actual.endLat);
    assert.strictEqual(expected.end_long, actual.endLong);
    assert.strictEqual(expected.rider_name, actual.riderName);
    assert.strictEqual(expected.driver_name, actual.driverName);
    assert.strictEqual(expected.driver_vehicle, actual.driverVehicle);
  };

  const compareErrRespBody = (expected, actual) => {
    assert.strictEqual(expected.error_code, actual.error_code);
    assert.strictEqual(expected.message, actual.message);
  };

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });



  describe('GET /ride/:page/:count before ride details insertion', () => {
    it('should return "RIDES_NOT_FOUND_ERROR" when there are no existing rides', (done) => {
      const expectedRespBody = {
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides'
      };

      const pageNumber = 5;
      const count = 5;
      request(app)
        .get(`/rides/${pageNumber}/${count}`)
        .expect('Content-Type', /json/)
        .then((data) => {
          compareErrRespBody(expectedRespBody, data.body);
          done();
        }).catch(done);
    });
  });

  const mockValidRideDetails = {
    start_lat: 50,
    start_long: 50,
    end_lat: 50,
    end_long: 50,
    rider_name: 'John Rider',
    driver_name: 'John Driver',
    driver_vehicle: 'Foo Vehicle'
  };

  describe('POST /rides', () => {
    it('should return "VALIDATION_ERROR" on startLat and startLong out of bounds', (done) => {
      const invalidRideDetails = {
        ...mockValidRideDetails,
        start_lat: -100,
        start_long: 200
      };

      const expectedRespBody = {
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      };

      request(app)
        .post('/rides')
        .send(invalidRideDetails)
        .expect('Content-Type', /json/)
        .then((data) => {
          compareErrRespBody(expectedRespBody, data.body);
          done();
        });
    });

    it('should return "VALIDATION_ERROR" on endLat and endLong out of bounds', (done) => {
      const invalidRideDetails = {
        ...mockValidRideDetails,
        end_lat: -100,
        end_long: 200
      };

      const expectedRespBody = {
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
      };

      request(app)
        .post('/rides')
        .send(invalidRideDetails)
        .expect('Content-Type', /json/)
        .then((data) => {
          compareErrRespBody(expectedRespBody, data.body);
          done();
        });
    });

    it('should return "VALIDATION_ERROR" on empty riderName', (done) => {
      const invalidRideDetails = {
        ...mockValidRideDetails,
        rider_name: ''
      };

      const expectedRespBody = {
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string'
      };

      request(app)
        .post('/rides')
        .send(invalidRideDetails)
        .expect('Content-Type', /json/)
        .then((data) => {
          compareErrRespBody(expectedRespBody, data.body);
          done();
        });
    });

    it('should return "VALIDATION_ERROR" on empty driverName', (done) => {
      const invalidRideDetails = {
        ...mockValidRideDetails,
        driver_name: ''
      };

      const expectedRespBody = {
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string'
      };

      request(app)
        .post('/rides')
        .send(invalidRideDetails)
        .expect('Content-Type', /json/)
        .then((data) => {
          compareErrRespBody(expectedRespBody, data.body);
          done();
        });
    });

    it('should return "VALIDATION_ERROR" on empty driverVehicle', (done) => {
      const invalidRideDetails = {
        ...mockValidRideDetails,
        driver_vehicle: ''
      };

      const expectedRespBody = {
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non empty string'
      };

      request(app)
        .post('/rides')
        .send(invalidRideDetails)
        .expect('Content-Type', /json/)
        .then((data) => {
          compareErrRespBody(expectedRespBody, data.body);
          done();
        });
    });

    it('should return the complete ride details', (done) => {
      request(app)
        .post('/rides')
        .send(mockValidRideDetails)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((data) => {
          compareRideDetails(mockValidRideDetails, data.body.data[0]);
          done();
        });
    });
  });

  describe('GET /rides/:page/:count after ride details insertion', () => {
    it('should return a list of ride details', (done) => {
      const pageNumber = 1;
      const count = 5;  
      request(app)
        .get(`/rides/${pageNumber}/${count}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((data) => {
          compareRideDetails(mockValidRideDetails, data.body.data[0]);  
          done();
        });
    });
    it('should return "VALIDATION_ERROR" on exceeded page number', (done) => {
      const pageNumber = 100;
      const count = 2;  
      const expectedRespBody = {
        error_code: 'VALIDATION_ERROR',
        message: 'Page number provided exceeds total number of ride details'
      };
      request(app)
        .get(`/rides/${pageNumber}/${count}`)
        .expect('Content-Type', /json/)
        .expect(422)
        .then((data) => {
          compareErrRespBody(expectedRespBody, data.body);  
          done();
        });
    });
  });

  describe('GET /rides/:id', () => {

    const validRideId = '1';
    const invalidRideId = '9';
    it('should return a ride detail when id exists', (done) => {
      request(app)
        .get(`/rides/${validRideId}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((data) => {
          compareRideDetails(mockValidRideDetails, data.body.data[0]);
          done();
        }).catch(done);
    });

    it('should return "RIDES_NOT_FOUND_ERROR" when rideID does not exist', (done) => {
      const expectedRespBody = {
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides'
      };

      request(app)
        .get(`/rides/${invalidRideId}`)
        .expect('Content-Type', /json/)
        .then((data) => {
          compareErrRespBody(expectedRespBody, data.body);
          done();
        }).catch(done);
    });
  });


});
