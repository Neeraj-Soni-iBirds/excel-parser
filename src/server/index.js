/* eslint-disable no-console */
// eslint-disable-next-line no-undef
//const jsforce = require('jsforce');
//require('dotenv').config();
// const { SF_USERNAME, SF_PASSWORD, SF_TOKEN, SF_LOGIN_URL } = process.env;
// if (!(SF_USERNAME && SF_PASSWORD && SF_TOKEN && SF_LOGIN_URL)) {
//     console.error(
//         'Cannot start app: missing mandatory configuration. Check your .env file.'
//     );
//     process.exit(-1);
// }
// const conn = new jsforce.Connection({
//     loginUrl: SF_LOGIN_URL
// });
// conn.login(SF_USERNAME, SF_PASSWORD + SF_TOKEN, err => {
//     if (err) {
//         console.error(err);
//         process.exit(-1);
//     }
// });


module.exports = app => {


    app.get('/api/objects', async (req, res) => {
        var objectNames = [];
        var types = [{ type: 'CustomObject', folder: null }];
        var jsforce = require('jsforce');
        var conn = new jsforce.Connection();
        // eslint-disable-next-line consistent-return
        let loginResult = await conn.login(
            'shree.r@gmail.com',
            'ibirds12347pNh5h7EKJPKJPnQpYtK0Wr3a'
        );

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
        console.log('TESTTESTTEST  ', objects);
        if(objects)
            res.send({ data: objects });
    });


    app.get('/api/sessions', (req, res) => {
        var jsforce = require('jsforce');
        var conn = new jsforce.Connection();
        // eslint-disable-next-line consistent-return
        conn.login(
            'shree.r@gmail.com',
            'ibirds12347pNh5h7EKJPKJPnQpYtK0Wr3a',
            // eslint-disable-next-line consistent-return
            function (err, res) {
                //console.log('test ' + JSON.stringify(res));
                if (err) {
                    return console.error(err);
                }
                // eslint-disable-next-line consistent-return
                conn.query('SELECT Id, Name FROM Account', function (
                    error,
                    res2
                ) {
                    if (error) {
                        return console.error(error);
                    }
                    //console.log(res2);
                    response.json(res2);
                });
            }
        ).catch(function (error) {
            c//onsole.error(error);
        });
    });
};





// const jsforce = require('jsforce');
// var bodyParser = require('body-parser');
// var cors = require('cors');

// var conn = new jsforce.Connection({
//     serverUrl: 'https://neeraj-soni-dev-ed.my.salesforce.com',
//     sessionId: '00D6F000002WgDi!AQMAQFmDTcSiefqrOHB4ZRttji4uEWjlZogC5Ix8VSsGbkPrEr0ci47EoxDUHLRvglCQ2hWXVkBghosqw2bOYQPhbLyrjcbV'
// });

// module.exports = app => {
//     app.use(cors());
//     app.use(bodyParser.urlencoded({ extended: false }))
//     var jsonParser = bodyParser.json()
//     // put your app logic here


//     app.get('/api/sessions', (req, res) => {

//     });


//     app.post('/api/create', jsonParser, function (req, res) {
//         var metadata = req.body;
//         conn.metadata.create('CustomObject', metadata, function (err, results) {
//             if (err) { console.err(err); }
//             if (results[0].errors) { console.err(results[0].errors); }
//             console.log('success ? : ' + results[0].success);
//             console.log('fullName : ' + results[0].fullName);
//             res.send({ data: JSON.stringify(results) });
//         });
//     });
//     app.get('/api/objects', (req, res) => {
//         var objectNames = [];
//         var types = [{ type: 'CustomObject', folder: null }];
//         conn.metadata.list(types, '36.0', function (err, metadata) {
//             if (err) { return console.error('err', err); }
//             var meta = metadata[0];
//             var types = [{ type: 'CustomObject', folder: null }];
//             conn.metadata.list(types, function (err, metadata) {
//                 if (err) { return console.error('err', err); }
//                 metadata.forEach(function (meta) {
//                     objectNames.push(meta.fullName);
//                 });
//                 var objects = [{}];
//                 var response = objectNames.sort();
//                 response.forEach(function (item, index) {
//                     var obj = {
//                         objName: item,
//                         id: index
//                     };
//                     objects.push(obj);
//                 });
//                 objects.shift();
//                 res.send({ data: objects });
//             });
//         });
//     });
//     app.get('/api/fields', (req, res) => {
//         var objectName = req.query.objName;
//         conn.metadata.read('CustomObject', objectName, function (err, metadata) {
//             if (err) { console.error(err); }
//             res.send({ data: JSON.stringify(metadata) });
//         });
//     });
//     app.get('/oauth2/auth', (req, res) => {
//         console.log("inside auth");
//         res.header("Access-Control-Allow-Origin", "*");
//         res.header("Access-Control-Allow-Headers", "*");
//         res.header("Access-Control-Allow-Methods", "*");
//         res.header("Access-Control-Allow-Credentials", "*");
//         res.header("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
//         res.redirect(oauth2.getAuthorizationUrl({ scope: 'api id web refresh_token' }));
//     });
//     app.get('/oauth2/callback', (req, res) => {
//         console.log("inside callback");
//         // var conn = new jsforce.Connection({ oauth2: oauth2 });
//         var code = req.param('code');
//         conn.authorize(code, function (err, userInfo) {
//             if (err) { return console.error(err); }
//             console.log(conn.accessToken);
//             console.log(conn.refreshToken);
//             console.log(conn.instanceUrl);
//             console.log("User ID: " + userInfo.id);
//             console.log("Org ID: " + userInfo.organizationId);
//         });
//         res.send(conn.accessToken);
//     });
// }; 



