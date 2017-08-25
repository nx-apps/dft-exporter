var company = require('../global/company');
exports.list = function (req, res) {
    r.table('draft').getAll(false, { index: 'approve_status' })
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.getInsert = function (req, res) {
    company.getCompany([req.query.company_taxno], function (companyData) {
        // res.json(companyData);
        r.expr(companyData)
            .merge({
                lic_type: r.table('license_type').filter(function (f) {
                    return r.table('draft').getAll([req.query.company_taxno, 'sign'], { index: 'taxnoDraftStatus' })
                        .getField('lic_type_id')
                        .distinct().contains(f('id')).eq(false)
                }).coerceTo('array')
            })
            .run()
            .then(function (data) {
                res.json(data);
            })
    })
}