module.exports = function (app) {
    var controller = require('../controllers/report.controller');
    app.get('/report1', controller.report1)
    app.get('/report2', controller.report2)
    app.get('/report3', controller.report3)
    app.get('/sign/request',controller.signRequest);
    app.get('/sign/company',controller.signCompany);
    app.get('/change',controller.change);
    app.get('/renew/request',controller.renewRequest);
    app.get('/renew/company',controller.renewCompany);
}