module.exports = function (app) {

    var report_exporter = require('../../controllers/external/report_exporter.controller');
    app.route('/report1').get(report_exporter.report1);
    app.route('/report2').get(report_exporter.report2);
    app.route('/report3').get(report_exporter.report3);
    app.route('/report4').get(report_exporter.report4);
    app.route('/report5').get(report_exporter.report5);
    app.route('/report6').get(report_exporter.report6);
    app.route('/report10').get(report_exporter.report10);
    app.route('/report10_1').get(report_exporter.report10_1);
    app.route('/report10_2').get(report_exporter.report10_2);
    app.route('/report11/:trader_id').get(report_exporter.report11);
}