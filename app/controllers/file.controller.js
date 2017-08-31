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

        res.json(prefile)
        /*  fs.readFile(prefile.path, function (err, data) {
              // console.log(r);
              r.db('external').table('file').insert({
                  filename: prefile.originalFilename.split('.')[0] + '_' + new Date().getTime() + "." + prefile.originalFilename.split('.')[1],
                  filetype: prefile.headers['content-type'],
                  contents: data,
                  date_upload: r.now().inTimezone('+07'),
                  doc_type_id: doc_type_id
              })('generated_keys')(0)
                  .do(function (file_id) {
                      return r.db('external').table('doc_temp').insert(
                          r.table('file').get(file_id).without('contents', 'id').merge({
                              file_id: file_id,
                              file_status: true,
                              company_taxno: company_taxno,
                              draft_status: draft_status,
                              date_created: r.now().inTimezone('+07'),
                              date_updated: r.now().inTimezone('+07')
                          })
                      )
                  })
                  .run().then(function (result) {
                      res.json(result);
                  }).catch(function (err) {
                      res.json(err);
                  })
          }); */
    });

}