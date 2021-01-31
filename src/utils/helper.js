'use strict';

const { VALIDATION_ERROR, SUCCESS } = require('./constants');

const validate = ({
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude,
  riderName,
  driverName,
  driverVehicle
}) => {

  let resp = {
    code: SUCCESS,
    message: 'Valid ride details'
  };

  if (startLatitude < - 90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
    const message = 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively';
    resp = {
      code: VALIDATION_ERROR,
      message: message
    };
  }

  if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
    const message = 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively';

    resp = {
      code: VALIDATION_ERROR,
      message: message
    };
  }

  if (typeof riderName !== 'string' || riderName.length < 1) {
    const message = 'Rider name must be a non empty string';
    resp = {
      code: VALIDATION_ERROR,
      message: message
    };
  }

  if (typeof driverName !== 'string' || driverName.length < 1) {
    const message = 'Driver name must be a non empty string';
    resp = {
      code: VALIDATION_ERROR,
      message: message
    };
  }

  if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
    const message = 'Driver vehicle must be a non empty string';
    resp = {
      code: VALIDATION_ERROR,
      message: message
    };
  }

  return resp;
};

module.exports = {
  validate: validate
};
