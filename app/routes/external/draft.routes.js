module.exports = function (app) {
    var controller = require('../../controllers/external/draft.controller');
    app.route('/').get(controller.list);
    app.route('/companyId/:company_id').get(controller.company_id);
    app.route('/insert').post(controller.insert);
    app.route('/update').put(controller.update);
    app.route('/approve').post(controller.approve);
}