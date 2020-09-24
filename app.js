var express = require('express');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var clinicsRouter = require('./routes/clinics')

var app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/clinics', clinicsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send("No Route Found")
});

var listener = app.listen(process.env.PORT, () => {
  console.log("Server running on port", listener.address().port)
})

module.exports = app;
