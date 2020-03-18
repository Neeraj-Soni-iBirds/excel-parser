/* eslint-disable no-console */
// eslint-disable-next-line no-undef

let jsforce = require('jsforce');
let conn = new jsforce.Connection();
let bodyParser = require('body-parser');
let XLSX = require('xlsx');

let loginResult;

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
        var test = new jsforce.Connection({ signedRequest: req.body.signed_request });
        console.log('Connection :: ', test);
        // test.query("SELECT Id, Name FROM Account", function (err, result) {
        //     if (err) { return console.error(err); }
        //     console.log("total : " + result.totalSize);
        //     console.log("fetched : " + result.records.length);
        // });
        // res.writeHead(200, { 'Content-Type': 'text/html' });
        // res.write('<h1>Product Manaager</h1><br /><br />To create product please enter: ');
        res.end();
    });
};