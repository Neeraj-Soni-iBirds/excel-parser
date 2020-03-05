/* eslint-disable no-console */
// eslint-disable-next-line no-undef

var jsforce = require('jsforce');
var conn = new jsforce.Connection();
let loginResult = conn.login(
    'shree.r@gmail.com',
    'ibirds12347pNh5h7EKJPKJPnQpYtK0Wr3a'
);

module.exports = app => {

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
        console.log('TESTTESTTEST  ', objects);
        if(objects)
            res.send({ data: objects });
    });
    
};