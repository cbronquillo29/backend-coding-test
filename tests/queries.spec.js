'use strict';

const assert = require('assert');
const { getRides, getRidesById, getRidesByPage } = require('../src/utils/queries');
const { SERVER_ERROR, VALIDATION_ERROR } = require('../src/utils/constants');

const sqlite3 = require('sqlite3').verbose();
const mockDb = new sqlite3.Database(':memory:');

describe('Async Test', () => {

  describe('Reject tests', () => {
    it('should catch SERVER_ERROR error_code on "getRides"', async () => {
      try {
        await getRides(mockDb);
      } catch (error) {
        assert.strictEqual(error.error_code, SERVER_ERROR);
      }
    });
    it('should catch SERVER_ERROR error_code on "getRidesById"', async () => {
      try {
        const mockRideId = 1;
        await getRidesById(mockDb, mockRideId);
      } catch (error) {
        assert.strictEqual(error.error_code, SERVER_ERROR);
      }
    });
    it('should catch VALIDATION_ERROR error_code on "getRidesById"', async () => {
      try {
        // set ride ID as non numeric character
        const mockRideId = 'a';
        await getRidesById(mockDb, mockRideId);
      } catch (error) {
        assert.strictEqual(error.error_code, VALIDATION_ERROR);
      }
    });
    it('should catch SERVER_ERROR error_code on "getRidesByPage"', async () => {
      try {
        const mockParam = {
          count: 1,
          offset: 1
        };
        await getRidesByPage(mockDb, mockParam);
      } catch (error) {
        assert.strictEqual(error.error_code, SERVER_ERROR);
      }
    });


  });
});
