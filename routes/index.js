var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('GA Hackathon | COVID-19 Clinics API\nStatus: Running');
});

module.exports = router;
