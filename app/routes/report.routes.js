module.exports = function (app) {
    var controller = require('../controllers/report.controller');
    app.get('/report1', controller.report1)
    // app.get('/report2', controller.report2)
}