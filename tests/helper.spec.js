'use strict';

const assert = require('assert');

const { validate } = require('../src/utils/helper');
const { SUCCESS, VALIDATION_ERROR } = require('../src/utils/constants');

describe('Helper Function Test', () => {
  describe('Helper Function: validate()', () => {

    const mockValidRideDetails = {
      startLatitude: 50,
      startLongitude: 50,
      endLatitude: 50,
      endLongitude: 50,
      riderName: 'John Rider',
      driverName: 'John Driver',
      driverVehicle: 'Foo Vehicle'
    };

    const compareRespBody = (expected, actual) => {
      assert.strictEqual(expected.code, actual.code);
      assert.strictEqual(expected.message, actual.message);
    };

    describe('SUCCESS cases', () => {
      it('should return SUCCESS on valid ride details', () => {
        const expected = {
          code: SUCCESS,
          message: 'Valid ride details'
        };
        const actual = validate(mockValidRideDetails);
        compareRespBody(expected, actual);
      });
    });

    describe('VALIDATION_ERROR cases', () => {
      it('should return VALIDATION_ERROR on invalid start latitute and longitude', () => {
        const mockInvalidRideDetails = {
          ...mockValidRideDetails,
          startLatitude: 200,
          startLongitude: 200
        };

        const expected = {
          code: VALIDATION_ERROR,
          message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
        };
        const actual = validate(mockInvalidRideDetails);
        compareRespBody(expected, actual);
      });
      it('should return VALIDATION_ERROR on invalid end latitute and longitude', () => {
        const mockInvalidRideDetails = {
          ...mockValidRideDetails,
          endLatitude: 200,
          endLongitude: 200
        };

        const expected = {
          code: VALIDATION_ERROR,
          message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
        };
        const actual = validate(mockInvalidRideDetails);
        compareRespBody(expected, actual);
      });
      it('should return VALIDATION_ERROR on empty string for Rider name', () => {
        const mockInvalidRideDetails = {
          ...mockValidRideDetails,
          riderName: ''
        };

        const expected = {
          code: VALIDATION_ERROR,
          message: 'Rider name must be a non empty string'
        };
        const actual = validate(mockInvalidRideDetails);
        compareRespBody(expected, actual);
      });
      it('should return VALIDATION_ERROR on empty string for Driver name', () => {
        const mockInvalidRideDetails = {
          ...mockValidRideDetails,
          driverName: ''
        };

        const expected = {
          code: VALIDATION_ERROR,
          message: 'Driver name must be a non empty string'
        };
        const actual = validate(mockInvalidRideDetails);
        compareRespBody(expected, actual);
      });
      it('should return VALIDATION_ERROR on empty string for Driver vehicle', () => {
        const mockInvalidRideDetails = {
          ...mockValidRideDetails,
          driverVehicle: ''
        };

        const expected = {
          code: VALIDATION_ERROR,
          message: 'Driver vehicle must be a non empty string'
        };
        const actual = validate(mockInvalidRideDetails);
        compareRespBody(expected, actual);
      });

    });
  });
});

