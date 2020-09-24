require('dotenv').config()
var express = require('express');
var router = express.Router();
var axios = require('axios');
const mapbox_token = process.env.MAPBOX_SECRET

/* GET Clinics off zipcode */
router.get('/zipcode/:zipcode', function(req, res, next) {
  let zipcode = req.params.zipcode
  let radius = parseInt(req.query.radius)
  const requestParams = `https://api.mapbox.com/geocoding/v5/mapbox.places/${zipcode}.json?access_token=${mapbox_token}&country=us&types=postcode&limit=1`
  axios.get(requestParams)
    .then(results => {
        if (results.data.features[0]) {
            let lon = results.data.features[0].geometry.coordinates[0]
            let lat = results.data.features[0].geometry.coordinates[1]
            axios.get(`https://findahealthcenter.hrsa.gov//healthcenters/find?lon=${lon}&lat=${lat}&radius=${radius}`)
                .then(results => {
                    let cleanedClinics = results.data.map(({Shape, DwRecordCreateDt, ApproxValueCd, LocNameDesc, EndDt, ParentCtrCity, FilteredResultsReturned, SiteUrl, CtrNm, ...keepTheseFields }) => {
                        if (SiteUrl !== "" && !SiteUrl.includes("http")) {
                            SiteUrl = "http://" + SiteUrl
                        }
                        CtrNm = CtrNm.replace("&amp;", "&")
                        return {CtrNm, SiteUrl, ...keepTheseFields}
                    })
                    let filteredClinics = cleanedClinics.filter(clinic => clinic.Covid19TestStatus == "Yes" || clinic.TeleHealthStatus == "Yes")

                    res.send(filteredClinics)                
                })
                .catch(err => console.log(err))
        } else {
            res.status(400).send("Incorrect zipcode format, please try again.")
        }
    })
    .catch(err => console.log(err))
});

/* GET Clinics off Address */
router.get('/address', function(req, res, next) {
    let address = encodeURI(req.query.input)
    let radius = parseInt(req.query.radius)
    const requestParams = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${mapbox_token}&country=us&types=address&limit=1`
    axios.get(requestParams)
        .then(results => {
            if (results.data.features[0].geometry) {
                let lon = results.data.features[0].geometry.coordinates[0]
                let lat = results.data.features[0].geometry.coordinates[1]
                axios.get(`https://findahealthcenter.hrsa.gov//healthcenters/find?lon=${lon}&lat=${lat}&radius=${radius}`)
                    .then(results => {
                        let cleanedClinics = results.data.map(({Shape, DwRecordCreateDt, ApproxValueCd, LocNameDesc, EndDt, ParentCtrCity, FilteredResultsReturned, ...keepTheseFields }) => keepTheseFields )
                        let filteredClinics = cleanedClinics.filter(clinic => clinic.Covid19TestStatus == "Yes" || clinic.TeleHealthStatus == "Yes")
                        res.send(filteredClinics)
                    })
                    .catch(err => console.log(err))
            }
        })
});

module.exports = router;
