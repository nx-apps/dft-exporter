module.exports = function (app) {
    var controller = require('../controllers/file.controller');
    app.post('/upload', controller.upload);
    app.get('/list', controller.list);
    app.get('/download', controller.download);
    app.put('/recovery', controller.recovery);
}