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
        let result = [];
        workbook.SheetNames.forEach(function (sheetName) {
            let csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
            if (csv.length) {
                result.push("SHEET: " + sheetName);
                result.push("");
                result.push(csv);
            }
        });
        return result.join("\n");
    }

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false }))
    let jsonParser = bodyParser.json();

    app.post('/api/saveFile', jsonParser, function (req, res) {
        let data = req.body.data,
            workbook = XLSX.read(data, { type: "base64", WTF: false }),
            result = process_wb(workbook),
            objectName = req.query.objName;

        console.log('objectName :: ', objectName);
        let jobIdRequest = {
            url: instanceUrl + '/services/data/v47.0/jobs/ingest/',
            method: 'POST',
            headers: {
                'Authorization': 'OAuth ' + oauthToken,
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept': 'application/json'
            },
            body: {
                "object": objectName,
                "contentType": "CSV",
                "operation": "insert",
                "lineEnding": "CRLF"
            }
        };

        request(jobIdRequest, function (err, response) {
            if (err) { res.send({ error: err }); }
            console.log('Job Id response  : ', response);
        });

        //console.log(result);
        res.send({ data: result });
    });

    app.get('/api/objects', async (req, res) => {
        let objects = [];
        let objectRequest = {
            url: instanceUrl + '/services/data/v47.0/sobjects/',
            headers: {
                'Authorization': 'OAuth ' + oauthToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        request(objectRequest, function (err, response) {
            if (err) { res.send({ error: err }); }
            JSON.parse(response.body).sobjects.forEach(function (item, index) {
                let obj = {
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

    app.post('/signedRequest', function (req, res) {
        let signedRequest = decode(req.body.signed_request, consumerSecret);
        oauthToken = signedRequest.client.oauthToken;
        instanceUrl = signedRequest.client.instanceUrl;
        return res.redirect('/');
    });
};