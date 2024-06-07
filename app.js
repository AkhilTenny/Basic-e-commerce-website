var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exHBS = require('express-handlebars');
var fileUpload = require('express-fileupload')
var mongooseFile = require('./config/connection.js')
var session = require('express-session')
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');


//connect to Database
 mongooseFile.connectDB()




var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())

//express-session
app.use(session({
  secret: "Key",
  duration: 24 * 60 * 60 * 1000, 
  activeDuration: 1000 * 60 * 5,
  saveUninitialized: true,
  resave: true
}));

app.use('/admin', adminRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//session
app.use(session)

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));

//setting hbs defaults
var hbs = exHBS.create({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir:'./views/layout/',
  partialsDir:'./views/partials/'
})

Handlebars.registerHelper('NoEq', function (a, b) {
  return a != b;
});
//strict unblocked
//exHBS.create({ strict: false });

app.engine('hbs',hbs.engine)

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
