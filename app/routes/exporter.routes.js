module.exports = function (app) {
    var controller = require('../controllers/exporter.controller');
    app.get(['/', '/list'], controller.list);
    app.get('/search', controller.search);
}