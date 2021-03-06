module.exports = function (app) {

    var exporter = require('../../controllers/external/exporter.controller');
    app.route('/').get(exporter.exporter);
    app.route('/search').get(exporter.exporter_search);
    app.route('/id/:exporter_id').get(exporter.exporterId);
    app.route('/insert').post(exporter.insert);
    app.route('/update').put(exporter.update);
    app.route('/delete/id/:id').delete(exporter.delete);
    app.route('/update/date').put(exporter.updateDate);
    app.get('/page',exporter.page);
}