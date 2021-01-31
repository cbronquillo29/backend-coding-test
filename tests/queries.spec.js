'use strict';

const assert = require('assert');
const { getRides, getRidesById, getRidesByPage } = require('../src/utils/queries');
const { SERVER_ERROR } = require('../src/utils/constants');

const sqlite3 = require('sqlite3').verbose();
const mockDb = new sqlite3.Database(':memory:');

describe('Async Test', () => {

  describe('Reject tests', () => {
    it('should catch SERVER_ERROR error_code on "getRides"', async () => {
      try {
        const results = await getRides(mockDb);
        console.log(results);
      } catch (error) {
        assert.strictEqual(error.error_code, SERVER_ERROR);
      }
    });
    it('should catch SERVER_ERROR error_code on "getRidesById"', async () => {
      try {
        const mockRideId = 1;
        const results = await getRidesById(mockDb, mockRideId);
        console.log(results);
      } catch (error) {
        assert.strictEqual(error.error_code, SERVER_ERROR);
      }
    });
    it('should catch SERVER_ERROR error_code on "getRidesByPage"', async () => {
      try {
        const mockParam = {
          count: 1,
          offset: 1
        };
        const results = await getRidesByPage(mockDb, mockParam);
        console.log(results);
      } catch (error) {
        assert.strictEqual(error.error_code, SERVER_ERROR);
      }
    });
  });
});
