var fs = require('fs');
var multiparty = require('multiparty');
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
            r.db('external').table('file').insert({
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
                        date_updated: r.now().inTimezone('+07')
                    });
                    var tbName;
                    if (draft_id == '' || typeof draft_id === 'undefined')
                        tbName = 'doc_temp'
                    else {
                        tbName = 'doc_draft';
                        doc = doc.merge({
                            draft_id: draft_id
                        })
                    }
                    r.db('external').table(tbName).insert(doc)
                        .run()
                        .then(function (ins) {
                            res.json(ins)
                        })

                })
        });
    });

}