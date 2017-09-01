module.exports = function (app) {
    var controller = require('../controllers/lictype.controller');
    app.get(['/', '/list'], controller.list);
    app.get('/get',controller.get);
    app.post('/insert', controller.insert);
    app.put('/update', controller.update);
    app.delete('/delete', controller.delete);
}