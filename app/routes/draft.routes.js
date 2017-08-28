module.exports = function (app) {
    var controller = require('../controllers/draft.controller');
    app.get(['/', '/list'], controller.list);
    app.get('/get',controller.getId);
    app.route('/insert')
        .get(controller.getInsert)
        .post(controller.postInsert)
        .put(controller.putInsert);
    // app.route('/renew')
    //     .get(controller.getRenew);
}