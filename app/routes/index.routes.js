module.exports = function (app) {
    var index = require('../controllers/index.controller');
    app.get('/', index.index);
    app.get('/db', index.db);
    app.get('/report', index.report);
    app.get('/pushy', (req, res) => {
        var stream = res.push('/main.js', {
            status: 200, // optional
            method: 'GET', // optional
            request: {
                accept: '*/*'
            },
            response: {
                'content-type': 'application/javascript'
            }
        });

        stream.on('error', function () {
        });

        stream.end('alert("hello from push stream! ' + req.httpVersion + '");')
        res.end('<script src="/main.js"></script>')
    });
    app.get('/sql', index.sql);
<<<<<<< HEAD
    app.post('/date',index.date);

=======
    app.post('/date', index.date);
    // app.get('/import', index.importData);
    app.get('/data', index.data);
    app.get('/taxno/:taxno', index.getCompany);
>>>>>>> redux
}