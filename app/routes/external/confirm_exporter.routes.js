module.exports = function (app) {
    var controller = require('../../controllers/external/confirm_exporter.controller');
    app.route('/').get(controller.confirm);
    app.route('/insert').post(controller.insert);
    app.route('/update').put(controller.update);
    app.route('/register').post(controller.register);
    app.route('/reject').put(controller.reject);
    app.route('/list').get(controller.list);
    app.route('/list/:id').get(controller.listId);
}