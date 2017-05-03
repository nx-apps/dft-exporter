module.exports = function (app) {

    var report_exporter = require('../../controllers/external/report_exporter.controller');
    app.route('/report1').get(report_exporter.report1);
    app.route('/report2').get(report_exporter.report2);
    app.route('/report3').get(report_exporter.report3);
    app.route('/report4').get(report_exporter.report4);
    app.route('/report5').get(report_exporter.report5);
    app.route('/report5_1').get(report_exporter.report5_1);
    app.route('/report5_2').get(report_exporter.report5_2);
    app.route('/exporter_detail/:company_id').get(report_exporter.exporter_detail);
    app.route('/approve_general_1').get(report_exporter.approve_general_1);
    app.route('/approve_general_2').get(report_exporter.approve_general_2);
}