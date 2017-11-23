module.exports = function (app) {

    var controller = require('../../controllers/external/company.controller');
    app.route('/').get(controller.list);
    app.route('/list_search').get(controller.list_search);
    app.route('/id/:id').get(controller.listId);
    app.route('/insert').post(controller.insert);
    app.route('/update').put(controller.update);
    app.route('/delete/id/:id').delete(controller.delete);
    app.get('/toRethink',controller.toRethink);
    app.get('/page',controller.page);
    app.route('/companyUpdate').get(controller.companyUpdate);
    app.get('/test',controller.test);
    app.get('/countCompany',controller.countCompany);
}