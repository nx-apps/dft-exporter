module.exports = function (app) {
    var confirm = require('../../controllers/external/confirm_exporter.controller');
    app.route('/').get(confirm.confirm);
    app.route('/insert').post(confirm.insert);
}