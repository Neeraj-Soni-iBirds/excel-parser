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
        let result;
        workbook.SheetNames.forEach(function (sheetName) {
            let csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
            // if (csv.length) {
            //     result.push("SHEET: " + sheetName);
            //     result.push("");
            //     result.push(csv);
            // }
            if (csv.length)
                result = csv;
        });
        return result;
    }

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false }))
    let jsonParser = bodyParser.json();

    app.post('/api/saveFile', jsonParser, async function (req, res) {
        let data = req.body.data,
            workbook = XLSX.read(data, { type: "base64", WTF: false }),
            workbookResult = process_wb(workbook),
            objectName = req.query.objName;

        let jobIdRequest = {
            url: instanceUrl + '/services/data/v47.0/jobs/ingest/',
            method: 'POST',
            headers: {
                'Authorization': 'OAuth ' + oauthToken,
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                "object": objectName,
                "contentType": "CSV",
                "operation": "insert",
                "lineEnding": "CRLF"
            })
        };

        request(jobIdRequest, async function (err, response) {
            if (err) { res.send({ error: err }); }
            let responseData = JSON.parse(response.body);
            let insertDataRequest = {
                url: instanceUrl + '/' + responseData.contentUrl,
                method: 'PUT',
                headers: {
                    'Authorization': 'OAuth ' + oauthToken,
                    'Content-Type': 'text/csv',
                    'Accept': 'application/json'
                },
                body: workbookResult
            };

            await request(insertDataRequest, function (err, response) {
                if (err) { res.send({ error: err }); }
                console.log('Response :: ', response);
            });

            let setStatus = {
                url: instanceUrl + '/services/data/v47.0/jobs/ingest/' + responseData.id,
                method: 'PATCH',
                headers: {
                    'Authorization': 'OAuth ' + oauthToken,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "state": "UploadComplete"
                })
            };

            await request(setStatus, function (err, response) {
                if (err) { res.send({ error: err }); }
                console.log('Response 2  :: ', response);
            });

        });

        //console.log(result);
        //res.send({ data: result });
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

        await request(objectRequest, function (err, response) {
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