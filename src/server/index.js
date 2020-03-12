/* eslint-disable no-console */
// eslint-disable-next-line no-undef

var jsforce = require('jsforce');
var conn = new jsforce.Connection();
var bodyParser = require('body-parser');
let loginResult;

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false }))
    var jsonParser = bodyParser.json()
    app.get('/api/objects', async (req, res) => {
        var objectNames = [];
        var types = [{ type: 'CustomObject', folder: null }];
        let metadataResult = await conn.metadata.list(types, '36.0');
        metadataResult.forEach(function (meta) {
            objectNames.push(meta.fullName);
        });
        var objects = [{}];
        var response = objectNames.sort();
        response.forEach(function (item, index) {
            var obj = {
                objName: item,
                id: index
            };
            objects.push(obj);
        });
        objects.shift();
        if (objects)
            res.send({ data: objects });
    });

    app.get('/api/fields', (req, res) => {
        var objectName = req.query.objName;
        conn.metadata.read('CustomObject', objectName, function (err, metadata) {
            if (err) { console.error(err); }
            res.send({ data: JSON.stringify(metadata) });
        });
    });

    app.post('/api/create', jsonParser, function (req, res) {
        var metadata = req.body;
        conn.metadata.create('CustomObject', metadata, function (err, results) {
            if (err) { console.err(err); }
            if (results[0].errors) { console.err(results[0].errors); }
            console.log('success ? : ' + results[0].success);
            console.log('fullName : ' + results[0].fullName);
            res.send({ data: JSON.stringify(results) });
        });
    });

    app.post('/api/login', jsonParser, async function (req, res) {
        var loginData = req.body;
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
};