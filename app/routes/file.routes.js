module.exports = function (app) {
    var controller = require('../controllers/file.controller');
    app.post('/upload', controller.upload);

}