/* eslint-disable no-console */
// eslint-disable-next-line no-undef

let jsforce = require('jsforce');
let conn;
let bodyParser = require('body-parser');
let XLSX = require('xlsx');

let request = require('request'),
    decode = require('salesforce-signed-request'),
    consumerSecret = process.env.CONSUMER_SECRET,
    consumerId = process.env.CONSUMER_ID;

let process_wb = function (workbook) {
    let result = {};
    workbook.SheetNames.forEach(function (sheetName) {
        let roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        if (roa.length) result[sheetName] = roa;
    });
    return JSON.stringify(result, 2, 2);
}

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false }))
    let jsonParser = bodyParser.json();

    app.post('/api/saveFile', jsonParser, function (req, res) {
        let result;
        let data = req.body.data;
        let workbook = XLSX.read(data, { type: "base64", WTF: false });
        result = process_wb(workbook);
        res.send({ data: result });
    });

    app.post('/signedRequest', function (req, res) {

        // You could save this information in the user session if needed
        var signedRequest = decode(req.body.signed_request, consumerSecret),
            context = signedRequest.context,
            oauthToken = signedRequest.client.oauthToken,
            instanceUrl = signedRequest.client.instanceUrl,

            query = "SELECT Id, FirstName, LastName, Phone, Email FROM Contact LIMIT 1",

            contactRequest = {
                url: instanceUrl + '/services/data/v29.0/query?q=' + query,
                headers: {
                    'Authorization': 'OAuth ' + oauthToken
                }
            };

        request(contactRequest, function (err, response, body) {
            res.send({ data: JSON.stringify(response) });
        });
    });
};