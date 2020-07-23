// var express       = require('express');
import express from "express"
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import mongodb from './db.js'

import routes from './routes/routes.js'
import { userRoute } from './app/user/user.route.mjs'
import noteRoutes from './app/note/note.route.js'
import transRoutes from './app/transaction/transaction.route.js'
import supportRoutes from './app/support/support.route.js'

var app = express();

// import app = require('express')();

var listener = app.listen(process.env.PORT || 8888, function () {
  console.log('Listening on port ' + listener.address().port); //Listening on port 8888
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', userRoute);
app.use('/notes', noteRoutes);
app.use('/trans', transRoutes);
app.use('/supports', supportRoutes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
  app.locals.pretty = true;
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

mongodb.connectDB();

module.exports = app;
