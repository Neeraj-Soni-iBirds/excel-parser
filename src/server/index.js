/* eslint-disable no-console */
// eslint-disable-next-line no-undef

let bodyParser = require('body-parser'),
    XLSX = require('xlsx'),
    request = require('request'),
    decode = require('salesforce-signed-request'),
    consumerSecret = process.env.CONSUMER_SECRET,
    oauthToken,
    instanceUrl,
    process_wb = function (workbook) {
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
        let data = req.body.data,
            workbook = XLSX.read(data, { type: "base64", WTF: false }),
            result = process_wb(workbook);
        console.log(result);
        res.send({ data: result });
    });

    app.post('/signedRequest', function (req, res) {
        var signedRequest = decode(req.body.signed_request, consumerSecret);
        oauthToken = signedRequest.client.oauthToken;
        instanceUrl = signedRequest.client.instanceUrl;
        return res.redirect('/');
    });

    app.get('/api/objects', async (req, res) => {
        var objects = [];
        let objectRequest = {
            url: instanceUrl + '/services/data/v29.0/sobjects/',
            headers: {
                'Authorization': 'OAuth ' + oauthToken
            }
        };

        request(objectRequest, function (err, response, body) {
            console.log('response from server:: ', response.body.sobjects);
            response.body.sobjects.forEach(function (item, index) {
                var obj = {
                    objApiName: item.name,
                    objectLabel: item.label,
                    url: item.urls.sobject,
                    id: index
                };
                objects.push(obj);
            });
            objects.shift();
            console.log('objects  ', objects);
            if (objects)
                res.send({ data: objects });
        });
    });
};