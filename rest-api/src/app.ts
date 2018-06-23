require('dotenv').config();

import * as express from 'express';
import logger from './logger';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import { Response } from 'express';
import ms = require('ms');
import catchError from './catch';
import * as cors from 'cors';
import { notFound } from 'boom';
import { initData } from './data';

const isProduction = process.env.NODE_ENV === 'production';

function startApp() {

    const app = express();

    if (isProduction) {
        app.set('trust proxy', true);
    }

    app.disable('x-powered-by');
    app.disable('etag');

    app.use(cors({ origin: '*' }));

    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
        extended: true
    }));

    app.use(express.static(path.join(__dirname, '../public'), {
        maxAge: isProduction ? ms('10d') : 0
    }));

    // app.use

    app.use(function (error: any, req: any, res: Response, _next: any) {
        catchError(req, res, error);
    });

    app.all('*', function (req, res) {
        catchError(req, res, notFound());
    });

    app.listen(process.env.PORT, () => {
        logger.warn('Listening at %s', process.env.PORT);
    });
}

process.on('unhandledRejection', function (error: Error) {
    logger.error('unhandledRejection: ' + error.message, error);
});

process.on('uncaughtException', function (error: Error) {
    logger.error('uncaughtException: ' + error.message, error);
});

initData()
    .then(startApp)
    .catch(e => logger.error(e.message));