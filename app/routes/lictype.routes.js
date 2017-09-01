module.exports = function (app) {
    var controller = require('../controllers/lictype.controller');
    app.get(['/', '/list'], controller.list);
}