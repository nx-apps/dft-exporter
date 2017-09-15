module.exports = function (app) {
    var controller = require('../controllers/exporter.controller');
    app.get(['/', '/list'], controller.list);
    app.get('/search', controller.search);
    app.get('/get', controller.get);
    app.get('/page', controller.page);
    app.put('/', controller.update);
}