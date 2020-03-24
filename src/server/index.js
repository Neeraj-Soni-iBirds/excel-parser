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
            objectName = req.query.objName,
            jobIdRequestResponse,
            insertDataRequestResponse,
            setStatusRequestResponse;

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
        try {
            jobIdRequestResponse = await request(jobIdRequest);
        } catch (err) {
            console.log('Error: ', err);
        }
        jobIdRequestResponse = JSON.parse(jobIdRequestResponse);
        console.log('jobIdRequestResponse ', jobIdRequestResponse.id);


        let insertDataRequest = {
            url: instanceUrl + '/' + jobIdRequestResponse.contentUrl,
            method: 'PUT',
            headers: {
                'Authorization': 'OAuth ' + oauthToken,
                'Content-Type': 'text/csv',
                'Accept': 'application/json'
            },
            body: workbookResult
        };
        try {
            insertDataRequestResponse = await request(insertDataRequest);
        } catch (err) {
            console.log('Error: ', err);
        }
        console.log('insertDataRequestResponse  ', insertDataRequestResponse);


        let setStatusRequest = {
            url: instanceUrl + '/services/data/v47.0/jobs/ingest/' + jobIdRequestResponse.id,
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
        try {
            setStatusRequestResponse = await request(setStatusRequest);
        } catch (err) {
            console.log('Error: ', err);
        }
        console.log('setStatusRequestResponse  ', setStatusRequestResponse);


        //console.log(result);
        //res.send({ data: result });
    });

    app.get('/api/objects', async (req, res) => {
        let objects = [];
        let objectRequestResponse;
        let objectRequest = {
            url: instanceUrl + '/services/data/v47.0/sobjects/',
            headers: {
                'Authorization': 'OAuth ' + oauthToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        try {
            objectRequestResponse = await request(objectRequest);
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