/**
 *
 * Author:  George Simos - georgesimos.com
 *
 * License: Copyright (c) 2019 George Simos
 * @link https://github.com/georgesimos/nodejs-starter
 *
 */

const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const expressStatusMonitor = require('express-status-monitor');
const connectDB = require('./config/mongoose');
const routes = require('./functions');
const fs = require('fs');

// Make all variables from our .env file available in our process
dotenv.config({ path: '.env' });

// Init express server
const app = express();

// Connect to MongoDB.
connectDB();

// Middlewares & configs setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.disable('x-powered-by');
app.use(expressStatusMonitor());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Here we define the api routes
app.use(routes);

const port = process.env.PORT || 8080;
const address = process.env.SERVER_ADDRESS || 'localhost';

app.get('/', (req, res) => {
  // res.send("<div>This is hardcoded html respone from server</div>");
  console.log("server reached!!!!!!!!!!!!!!!");
  fs.readFile('./index.html', 'utf8', (err, htmlContents) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("process.env", process.env);
    res.send(htmlContents.replace("$API_BASE_URL", process.env.API_BASE_URL));
  });
});

app.listen(port, () => console.log(`Server running on http://${address}:${port}`));


const bcrypt = require('bcryptjs');
const salt = bcrypt.genSalt(10).then(salt => {
  bcrypt.hash("Sankar@91", salt).then(password => {
    console.log("afafdsfsdfsfd : ", password);
  })
});
