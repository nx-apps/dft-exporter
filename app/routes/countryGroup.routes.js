module.exports = function (app) {
    var controller = require('../controllers/countryGroup.controller');
    app.get('/', controller.list);
    app.get('/group/:id', controller.getById);
    app.get('/country/:id', controller.country);
    app.get('/country', controller.countries);
    app.post('/group', controller.insert);
    app.put('/group', controller.update);
    app.delete('/group/:id', controller.delete);
}