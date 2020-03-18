/* eslint-disable no-console */
// eslint-disable-next-line no-undef

let jsforce = require('jsforce');
let conn;
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
        console.log('Connection :: ', conn);
        var code = req.param('code');
        conn.authorize(code, function (err, userInfo) {
            if (err) { return console.error(err); }
            // Now you can get the access token, refresh token, and instance URL information.
            // Save them to establish connection next time.
            console.log(conn.accessToken);
            console.log(conn.refreshToken);
            console.log(conn.instanceUrl);
            console.log("User ID: " + userInfo.id);
            console.log("Org ID: " + userInfo.organizationId);
            // ...
        });
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

    app.post('/signedRequest', function (req, res) {
        conn = new jsforce.Connection({ signedRequest: req.body.signed_request });
        res.statusCode = 200;
        return res.redirect('/');
    });
};