/* eslint-disable no-console */
// eslint-disable-next-line no-undef

let jsforce = require('jsforce');
const { Client } = require('pg');
let conn = new jsforce.Connection();
let bodyParser = require('body-parser');
let XLSX = require('xlsx');

let loginResult;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
client.connect();

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
    let jsonParser = bodyParser.json()

    app.post('/api/saveFile', jsonParser, function (req, res) {
        let result;
        let data = req.body.data;
        let workbook = XLSX.read(data, { type: "base64", WTF: false });
        result = process_wb(workbook);
        res.send({ data: result });
    });

    app.post('/api/login', jsonParser, async function (req, res) {
        let loginData = req.body;
        try {
            loginResult = await conn.login(
                loginData.userName,
                loginData.passAndToken
            );
        } catch (e) {
            res.send({ error: e.message });
        }
        res.send({ data: loginResult });
    });

    app.get('/api/logout', jsonParser, function (req, res) {
        conn.logout(function (err) {
            if (err) { res.send({ error: err }); }
            res.send({ data: 'success' });
        });
    });

    app.post('/signedrequest', function (req, res) {
        console.log('req.body.signed_request  ', req.body.signed_request);
        var test = new jsforce.Connection({ signedRequest: req.body.signed_request });
        console.log('Connection :: ', test);
        // Provide records
        var accounts = [
            { Name: 'Account #1#' },
            { Name: 'Account #2#' },
            { Name: 'Account #3#' },
        ];
        // Create job and batch
        var job = test.bulk.createJob("Account", "insert");
        var batch = job.createBatch();
        // start job
        batch.execute(accounts);
        // listen for events
        batch.on("error", function (batchInfo) { // fired when batch request is queued in server.
            console.log('Error, batchInfo:', batchInfo);
        });
        batch.on("queue", function (batchInfo) { // fired when batch request is queued in server.
            console.log('queue, batchInfo:', batchInfo);
            batch.poll(1000 /* interval(ms) */, 20000 /* timeout(ms) */); // start polling - Do not poll until the batch has started
        });
        batch.on("response", function (rets) { // fired when batch finished and result retrieved
            for (var i = 0; i < rets.length; i++) {
                if (rets[i].success) {
                    console.log("#" + (i + 1) + " loaded successfully, id = " + rets[i].id);
                } else {
                    console.log("#" + (i + 1) + " error occurred, message = " + rets[i].errors.join(', '));
                }
            }
            // ...
        });
        res.send({ data: 'success'});
    });
};