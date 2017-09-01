module.exports = function (app) {
    var controller = require('../controllers/doctype.controller');
    app.get(['/', '/list'], controller.list);
    app.get('/get', controller.get);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete', controller.delete);
}