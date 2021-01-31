'use strict';

const { SERVER_ERROR, SERVER_ERROR_MESSAGE, SUCCESS } = require('./constants');

const postRides = (db, params) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', params, function (err) {
      if (err) {
        reject({
          error_code: SERVER_ERROR,
          message: SERVER_ERROR_MESSAGE
        });
      }
      resolve({
        error_code: SUCCESS,
        message: 'Success',
        last_id: this.lastID !== undefined ? this.lastID: -1
      });
    });
  });
};

const getRidesById = (db, param) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Rides WHERE rideID = ?', param, function (err, rows) {
      if (err) {
        reject({
          error_code: SERVER_ERROR,
          message: err
        });
      }
      resolve({
        error_code: SUCCESS,
        message: 'Success',
        data: rows
      });
    });
  });
};

const getRides = (db) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Rides ', function (err, rows) {
      if (err) {
        reject({
          error_code: SERVER_ERROR,
          message: err
        });
      }
      resolve({
        error_code: SUCCESS,
        message: 'Success',
        data: rows
      });
    });
  });
};

const getRidesByPage = (db, { count, offset }) => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM Rides ORDER BY rideID ASC LIMIT ${count} OFFSET ${offset}`, function (err, rows) {
      if (err) {
        reject({
          error_code: SERVER_ERROR,
          message: err
        });
      }
      resolve({
        error_code: SUCCESS,
        message: 'Success',
        data: rows
      });
    });
  });
};

module.exports = {
  postRides: postRides,
  getRidesById: getRidesById,
  getRides: getRides,
  getRidesByPage: getRidesByPage
};
