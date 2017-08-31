module.exports = function (app) {
    var controller = require('../controllers/doctype.controller');
    app.get(['/', '/list'], controller.list);
   
}