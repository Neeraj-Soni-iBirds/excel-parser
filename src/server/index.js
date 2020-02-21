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
    app.get('/api/sessions', (req, res) => {
        var jsforce = require('jsforce');
        var conn = new jsforce.Connection();
        // eslint-disable-next-line consistent-return
        conn.login(
            'shree.r@gmail.com',
            'ibirds12347pNh5h7EKJPKJPnQpYtK0Wr3a',
            // eslint-disable-next-line consistent-return
            function (err, res) {
                console.log('test ' + JSON.stringify(res));
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
                    console.log(res2);
                    response.json(res2);
                });
            }
        ).catch(function (error) {
            console.error(error);
        });
    });
};
