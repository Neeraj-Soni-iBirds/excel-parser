/* eslint-disable no-console */
// eslint-disable-next-line no-undef

var jsforce = require('jsforce');
const { Client } = require('pg');
var conn = new jsforce.Connection();
var bodyParser = require('body-parser');
let loginResult;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
client.connect();

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false }))
    var jsonParser = bodyParser.json()

    app.post('/api/saveFile', jsonParser, async function (req, res) {
        //Decoding the Excel file to insert into DB
        let data = req.body.data;
        let fileName = req.body.name;
        let buff = new Buffer(data, 'base64');
        let text = buff.toString('ascii');
        
        let test = await client.query('SELECT * FROM excelParser');
        console.log('testtesttestt ::  ' , test);

        client.query('INSERT INTO excelParser( fileName, fileData)VALUES('+ fileName +',' +  text + ')', (err, res) => {
            if (err) console.log('ERROR:: ' , err);
            console.log('Result:: ' , res);
            client.end();
        });
        res.send({ data: 'success' });
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