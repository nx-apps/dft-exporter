var fs = require('fs');
var path = require('path');
var multiparty = require('multiparty');
var stream = require('stream');

exports.listFilePath = function (req, res) {
    var r = req.r;
    var params = req.params;
    r.db('external').table('document_file')
        .eqJoin('file_id', r.db('external').table('files')).without({ right: ["id", "contents"] }).zip()
        // .eqJoin('seller_id', r.db('external').table('seller')).pluck('left', { right: 'seller_id' }).zip()
        .merge(function (m) {
            return { timestamp: m('timestamp').toISO8601().split("T")(0) }
        })
        .merge(function (row) {
            return {
                name: row('name').add(' | ')
                    .add(row('timestamp'))
                // .add('-')
                // .add(row('date_upload').month().coerceTo('string'))
                // .add('-')
                // .add(row('date_upload').year().coerceTo('string'))
                ,
                progress: 100, complete: true
            }
        })
        .filter({ company_id: params.company_id, ref_path: params.refPath, file_status: true })
        .orderBy(r.desc('date_upload'))
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}
exports.downloadFile = function (req, res) {
    var r = req.r;
    var params = req.params;
    // console.log(params)

    r.db('external').table('files').get(params.id)
        .run().then(function (result) {
            res.writeHead(200, {
                'Content-Type': result.type,
                'Content-Length': result.contents.length,
                //'Content-Disposition':'filename='+cursor.name
                'Content-Disposition': 'attachment; filename=' + result.name
            });

            var bufferStream = new stream.PassThrough();
            bufferStream.end(result.contents);
            bufferStream.pipe(res);

        }).catch(function (err) {
            res.json(err);
        })

}
exports.deleteFile = function (req, res) {
    var r = req.r;
    var params = req.params;
    r.db('external').table('document_file').getAll(params.id, { index: 'file_id' }).update({ file_status: false, date_update: new Date() })

        // r.db('files').table('files').get(params.id).delete()
        //     .do(
        //     function (d) {
        //         return r.db('external').table('document_file').getAll(params.id, { index: 'file_id' }).delete()
        //     }
        //     )
        .run().then(function (result) {
            res.json(result);
        }).catch(function (err) {
            res.json(err);
        })

}
exports.uploadFileExporter = function (req, res) {
    var r = req.r;
    var params = req.params;

    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {

        var prefile = files.file[0];
        // var doc_code = req.headers['ref-path'].split(".")[2];
        var doc_type_id = req.headers['doc-type-id'];
        // console.log(doc_type_id);

        fs.readFile(prefile.path, function (err, data) {
            // console.log(r);
            r.db('external').table('files').insert({
                name: prefile.originalFilename.split('.')[0] + '_' + new Date().getTime() + "." + prefile.originalFilename.split('.')[1],
                type: prefile.headers['content-type'],
                contents: data,
                timestamp: new Date(),
                ref_path: req.headers['ref-path']
            })('generated_keys')(0)
                .do(function (file_id) {
                    return r.db('external').table('document_file').insert({
                        file_id: file_id,
                        file_status: true,
                        doc_type_id: doc_type_id,
                        company_id: params.company_id,
                        date_upload: new Date(),
                        date_update: new Date()
                    })
                })
                .run().then(function (result) {
                    res.json(result);
                }).catch(function (err) {
                    res.json(err);
                })
        });
    });

    // res.json({ec:'01252'});

}
exports.listFileDelete = function (req, res) {
    var r = req.r;
    var params = req.params;
    r.db('external').table('document_file')
        .eqJoin('file_id', r.db('external').table('files')).without({ right: ["id", "contents"] }).zip()
        // .eqJoin('seller_id', r.db('external').table('seller')).pluck('left', { right: 'seller_id' }).zip()
        .merge(function (m) {
            return { timestamp: m('timestamp').toISO8601().split("T")(0) }
        })
        .merge(function (row) {
            return {
                name: row('name').add(' | ')
                    .add(row('timestamp'))
                // .add('-')
                // .add(row('date_upload').month().coerceTo('string'))
                // .add('-')
                // .add(row('date_upload').year().coerceTo('string'))
                ,
                progress: 100, complete: true
            }
        })
        .filter({ company_id: params.company_id, file_status: false })
        .orderBy(r.desc('date_update'))
        .limit(5)
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}
exports.recoveryFile = function (req, res) {
    var r = req.r;
    var params = req.params;
    console.log(params.file_id + 'mmm');
    r.db('external').table('document_file').getAll(params.file_id, { index: 'file_id' }).update({ file_status: true, date_update: new Date() })
        .run().then(function (result) {
            res.json(result);
        }).catch(function (err) {
            res.json(err);
        })
}
// exports.uploadFile = function (req, res) {

//     var r = req.r;
//     var params = req.params;

//     var form = new multiparty.Form();
//     form.parse(req, function (err, fields, files) {

//         var prefile = files.file[0];

//         fs.readFile(prefile.path, function (err, data) {
//             // console.log(r);
//             r.db('files').table('files').insert({
//                 name: prefile.originalFilename,
//                 type: prefile.headers['content-type'],
//                 contents: data,
//                 timestamp: new Date(),
//                 ref_path: req.headers['ref-path']
//             })
//                 .run().then(function (result) {
//                     res.json(result);
//                 }).catch(function (err) {
//                     res.json(err);
//                 })
//         });


//         //res.json({ec:'01252'});
//     });

// }
// exports.listFile = function (req, res) {

//     var r = req.r;
//     r.db('files').table('files').without('contents')
//         .orderBy(r.desc('timestamp'))
//         .map(function (row) {
//             return {
//                 name: row('name').add(' -->> ')
//                     .add(row('timestamp').year().coerceTo('string'))
//                     .add('-')
//                     .add(row('timestamp').month().coerceTo('string'))
//                     .add('-')
//                     .add(row('timestamp').day().coerceTo('string'))
//                 ,
//                 progress: 100, complete: true,
//                 file_id: row('id')
//             }
//         })
//         .run()
//         .then(function (result) {
//             res.json(result);
//         })
//         .catch(function (err) {
//             res.json(err);
//         })

// }