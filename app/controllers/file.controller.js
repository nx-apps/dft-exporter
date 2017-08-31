var fs = require('fs');
var multiparty = require('multiparty');
var stream = require('stream');
exports.upload = function (req, res) {
    var r = req.r;
    var params = req.params;
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        var prefile = files.file[0];
        var doc_type_id = req.headers['doc-type-id'];
        var company_taxno = req.headers['company-taxno'];
        var draft_status = req.headers['draft-status'];
        var draft_id = req.headers['draft-id'];
        fs.readFile(prefile.path, function (err, data) {
            r.table('file').insert({
                filename: prefile.originalFilename.split('.')[0] + "." + prefile.originalFilename.split('.')[1],
                filetype: prefile.headers['content-type'],
                contents: data,
                date_upload: r.now().inTimezone('+07'),
                doc_type_id: doc_type_id
            })
                .run()
                .then(function (data) {
                    var file_id = data['generated_keys'][0];
                    var doc = r.table('file').get(file_id).without('contents', 'id').merge({
                        file_id: file_id,
                        file_status: true,
                        company_taxno: company_taxno,
                        draft_status: draft_status,
                        date_created: r.now().inTimezone('+07'),
                        date_updated: r.now().inTimezone('+07'),
                        draft_id: r.branch(r.expr(draft_id).eq(''), null, r.expr(draft_id))
                    });
                    r.table('doc_draft').insert(doc)
                        .run()
                        .then(function (ins) {
                            res.json(ins)
                        })

                })
        });
    });

}
exports.list = function (req, res) {
    var draft_id = (req.query.draft_id == '' || typeof req.query.draft_id === 'undefined' ? null : req.query.draft_id);
    var file_status = (req.query.file_status == 'false' ? false : true);
    r.table('doc_draft')
        .getAll([req.query.company_taxno, req.query.draft_status, draft_id, file_status],
        { index: 'taxNoDraftStatusDraftIdFileStatus' })
        .eqJoin('doc_type_id', r.table('doc_type')).without({ right: 'id' }).zip()
        .pluck('doc_type_id', 'doc_type_th', 'file_id', 'filename', 'filetype', 'date_upload')
        .group('doc_type_th')
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.download = function (req, res) {
    r.table('file').get(req.query.file_id)
        .run()
        .then(function (result) {
            res.writeHead(200, {
                'Content-Type': result.filetype,
                'Content-Length': result.contents.length,
                'Content-Disposition': 'attachment; filename=' + result.filename
            });
            var bufferStream = new stream.PassThrough();
            bufferStream.end(result.contents);
            bufferStream.pipe(res);
        }).catch(function (err) {
            res.json(err);
        })
}