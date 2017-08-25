var company = require('../global/company');
exports.list = function (req, res) {
    r.table('draft').getAll(false, { index: 'approve_status' })
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.getInsert = function (req, res) {
    company.getCompany([req.query.company_taxno], function (companyData) {
        if (companyData.length > 0 && companyData[0].hasOwnProperty('company_name_th')) {
            r.expr({ company: companyData[0], company_taxno: req.query.company_taxno })
                .merge({
                    lic_type: r.table('license_type').filter(function (f) {
                        return r.table('draft').getAll([req.query.company_taxno, 'sign'], { index: 'taxnoDraftStatus' })
                            .getField('lic_type_id')
                            .distinct().contains(f('id')).eq(false)
                    }).coerceTo('array')
                })
                .run()
                .then(function (data) {
                    res.json(data)
                })
        } else {
            res.json({});
        }
    })
}
exports.postInsert = function (req, res) {
    if (req.body.hasOwnProperty('company')) {
        var valid = req.ajv.validate('draft', req.body);
        if (valid) {
            var draftSign = r.table('draft').getAll('sign', { index: 'draft_status' });
            var exporterNo = r.branch(
                draftSign.count().eq(0), 1, draftSign.max('exporter_no')
            );
            var obj = Object.assign(req.body, {
                date_created: r.now().inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                creater: 'admin',
                updater: 'admin',
                doc_status: false,
                approve_status: false,
                draft_status: 'sign',
                exporter_no: exporterNo
            });
            r.table('draft').insert(obj)
                .run()
                .then(function (data) {
                    res.json(data)
                })
        } else {
            res.json(req.ajv.errorsText());
        }
    } else {
        res.json('error: data want {company} object');
    }
}