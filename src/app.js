'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('../swagger.json');

const logger = require('./logger');

module.exports = (db) => {
    app.get('/health', (req, res) => res.send('Healthy'));

    const VALIDATION_ERROR = 'VALIDATION_ERROR';
    const SERVER_ERROR = 'SERVER_ERROR';
    const NOT_FOUND_ERROR = 'RIDES_NOT_FOUND_ERROR';

    app.post('/rides', jsonParser, (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
          const message = 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
          logger.error(message);
          return res.send({
                error_code: VALIDATION_ERROR,
                message: message
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            const message = 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            logger.error(message);  
            return res.send({
                error_code: VALIDATION_ERROR,
                message: message
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            const message = 'Rider name must be a non empty string'
            logger.error(message);  
            return res.send({
                error_code: VALIDATION_ERROR,
                message: message
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            const message = 'Rider name must be a non empty string'
            logger.error(message);  
            return res.send({
                error_code: VALIDATION_ERROR,
                message: message
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            const message = 'Rider name must be a non empty string'
            logger.error(message);  
            return res.send({
                error_code: VALIDATION_ERROR,
                message: message
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

        const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                const message = 'Unknown error'
                logger.error(message);  
                return res.send({
                    error_code: SERVER_ERROR,
                    message: message
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    const message = 'Unknown error'
                    logger.error(message);  
                    return res.send({
                        error_code: SERVER_ERROR,
                        message: message
                    });
                }

                logger.info('Successfully added ride details');
                res.send(rows);
            });
        });
    });

    app.get('/rides', (req, res) => {
        db.all('SELECT * FROM Rides', function (err, rows) {
            if (err) {
                const message = 'Unknown error'
                logger.error(message);  
                return res.send({
                    error_code: SERVER_ERROR,
                    message: message
                });
            }

            if (rows.length === 0) {
                const message = 'Could not find any rides'
                logger.error(message);  
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: message
                });
            }

            logger.info('Successfully retrieved rides');
            res.send(rows);
        });
    });

    app.get('/rides/:id', (req, res) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                const message = 'Unknown error'
                logger.error(message);  
                return res.send({
                    error_code: SERVER_ERROR,
                    message: message
                });
            }

            if (rows.length === 0) {
                const message = 'Could not find any rides'
                logger.error(message);  
                return res.send({
                    error_code: NOT_FOUND_ERROR,
                    message: message
                });
            }

            logger.info(`Successfully retrieved ride details with ID:${req.params.id}`);
            res.send(rows);
        });
    });

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    return app;
};
