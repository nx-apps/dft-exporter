module.exports = function (app) {
    var controller = require('../controllers/draft.controller');
    app.get(['/', '/list'], controller.list);
    app.get('/insert', controller.getInsert);
}