/* eslint-disable no-console */
// eslint-disable-next-line no-undef
const request = require("request-promise");

let bodyParser = require('body-parser'),
    XLSX = require('xlsx'),
    decode = require('salesforce-signed-request'),
    consumerSecret = process.env.CONSUMER_SECRET,
    oauthToken,
    instanceUrl,
    process_wb = function (workbook) {
        let result;
        workbook.SheetNames.forEach(function (sheetName) {
            let csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
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
            objectName = req.query.objName,
            jobIdResponse,
            insertDataResponse,
            setStatusResponse,
            getStatusResponse;

        try {
            jobIdResponse = await request({
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
                    "lineEnding": "LF"
                })
            });
        } catch (err) {
            console.log('Error: ', err);
        }
        jobIdResponse = JSON.parse(jobIdResponse);

        try {
            insertDataResponse = await request({
                url: instanceUrl + '/' + jobIdResponse.contentUrl + '/',
                method: 'PUT',
                headers: {
                    'Authorization': 'OAuth ' + oauthToken,
                    'Content-Type': 'text/csv',
                    'Accept': 'application/json'
                },
                body: workbookResult
            });
        } catch (err) {
            console.log('Error: ', err);
        }

        try {
            setStatusResponse = await request({
                url: instanceUrl + '/services/data/v47.0/jobs/ingest/' + jobIdResponse.id + '/',
                method: 'PATCH',
                headers: {
                    'Authorization': 'OAuth ' + oauthToken,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "state": "UploadComplete"
                })
            });
        } catch (err) {
            console.log('Error: ', err);
        }

        try {
            //setTimeout(async () => {
            getStatusResponse = await request({
                url: instanceUrl + '/services/data/v47.0/jobs/ingest/' + jobIdResponse.id + '/',
                method: 'GET',
                headers: {
                    'Authorization': 'OAuth ' + oauthToken,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Accept': 'application/json'
                }
            });
            //}, 2000);
        } catch (err) {
            console.log('Error: ', err);
        }
        res.send({ data: getStatusResponse });
    });

    app.get('/api/objects', async (req, res) => {
        let objects = [];
        let objectRequestResponse;
        try {
            objectRequestResponse = await request({
                url: instanceUrl + '/services/data/v47.0/sobjects/',
                headers: {
                    'Authorization': 'OAuth ' + oauthToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        } catch (err) {
            console.log('Error: ', err);
        }
        JSON.parse(objectRequestResponse).sobjects.forEach(function (item, index) {
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

    app.post('/signedRequest', function (req, res) {
        let signedRequest = decode(req.body.signed_request, consumerSecret);
        oauthToken = signedRequest.client.oauthToken;
        instanceUrl = signedRequest.client.instanceUrl;
        return res.redirect('/');
    });
};