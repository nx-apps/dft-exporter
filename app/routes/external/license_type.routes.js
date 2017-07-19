module.exports = function (app) {

    var controllers = require('../../controllers/external/license_type.controller');
    app.route('/').get(controllers.license_type);
    app.route('/id/:type_lic_id').get(controllers.license_typeId);
    app.route('/insert').post(controllers.insert);
    // app.route('/update').put(typeLicense.update);
    // app.route('/delete/id/:id').delete(typeLicense.delete);
}