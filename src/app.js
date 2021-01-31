'use strict';

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('../swagger.json');

const logger = require('./logger');
const util = require('./utils/helper');
const { VALIDATION_ERROR, SERVER_ERROR, NOT_FOUND_ERROR, SUCCESS } = require('./utils/constants');

const { postRides, getRidesById, getRides, getRidesByPage } = require('./utils/queries');

module.exports = (db) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, async (req, res) => {
    try {
      const rideDetails = {
        startLatitude: Number(req.body.start_lat),
        startLongitude: Number(req.body.start_long),
        endLatitude: Number(req.body.end_lat),
        endLongitude: Number(req.body.end_long),
        riderName: req.body.rider_name,
        driverName: req.body.driver_name,
        driverVehicle: req.body.driver_vehicle,
      };

      const validation = util.validate(rideDetails);
      if (validation.code !== SUCCESS) {
        logger.error(validation.message);
        return res.status(422).send({
          error_code: validation.code,
          message: validation.message
        });
      }

      const values = [
        req.body.start_lat,
        req.body.start_long,
        req.body.end_lat,
        req.body.end_long,
        req.body.rider_name,
        req.body.driver_name,
        req.body.driver_vehicle
      ];

      const results =
        await postRides(db, values)
          .then((data) => {
            return getRidesById(db, data.last_id);
          });

      res.status(200).send(results);
    } catch (error) {
      logger.error(error);
      return res.status(500).send({
        error_code: SERVER_ERROR,
        message: error
      });
    }
  });

  app.get('/rides/:page/:count', async (req, res) => {
    try {
      // count: number of items per page
      // page: page number
      const count = req.params.count;
      const page = req.params.page;

      // check first if there are any ride details stored
      let { data } = await getRides(db);

      if (data.length === 0) {
        const message = 'Could not find any rides';
        logger.error(message);
        return res.status(404).send({
          error_code: NOT_FOUND_ERROR,
          message: message
        });
      }

      // proceed with server side pagination given count and page
      // calculate offset for sql query
      const offset = (page - 1) * count;

      const param = {
        offset: offset,
        count: count
      };

      const results = await getRidesByPage(db, param);

      if (results.data.length === 0) {
        const message = 'Page number provided exceeds total number of ride details';
        logger.error(message);
        return res.status(422).send({
          error_code: VALIDATION_ERROR,
          message: message
        });
      }

      logger.info(`Successfully retrieved ${results.data.length} ride detail/s for page ${page}`);
      res.status(200).send(results);
    } catch (error) {
      logger.error(error);
      return res.status(500).send({
        error_code: SERVER_ERROR,
        message: error
      });
    }
  });

  app.get('/rides/:id', async (req, res) => {
    try {
      const results = await getRidesById(db, req.params.id);

      if (results.data.length === 0) {
        const message = 'Could not find any rides';
        logger.error(message);
        return res.status(404).send({
          error_code: NOT_FOUND_ERROR,
          message: message
        });
      }
      logger.info(`Successfully retrieved ride details with rideID:${req.params.id}`);
      res.status(200).send(results);
    } catch (error) {
      logger.error(error);
      return res.status(500).send({
        error_code: SERVER_ERROR,
        message: error
      });
    }
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  return app;
};
