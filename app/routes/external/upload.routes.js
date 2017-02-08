module.exports = function (app) {

    var upload = require('../../controllers/external/upload.controller');
    app.route('/file').post(upload.uploadFile);
    app.route('/file/:id').delete(upload.deleteFile);
    app.route('/file/:id').get(upload.downloadFile);
    app.route('/list').get(upload.listFile);
    app.route('/list/:refPath/:seller_id').get(upload.listFilePath);
    app.route('/exporter/file/:seller_id').post(upload.uploadFileExporter);
}