module.exports = function (app) {

    var upload = require('../../controllers/external/upload.controller');
    app.route('/file/:id').delete(upload.deleteFile);
    app.route('/file/:id').get(upload.downloadFile);
    app.route('/list/:refPath/:seller_id').get(upload.listFilePath);
    app.route('/exporter/file/:seller_id').post(upload.uploadFileExporter);
    app.route('/list/:seller_id').get(upload.listFileDelete);
    app.route('/update/:file_id').put(upload.recoveryFile);
    // app.route('/file').post(upload.uploadFile);
    // app.route('/list').get(upload.listFile);
}