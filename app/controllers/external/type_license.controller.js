exports.type_license = function (req, res) {
    var r = req._r;
    r.db('external_f3').table("type_license")
        .merge(function (row) {
            return { type_lic_id: row('id') }
        })
        .without('id')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err);
        })
}
exports.type_licenseId = function (req, res) {
    var r = req._r;
    r.db('external_f3').table("type_license")
        .get(req.params.type_lic_id.toUpperCase())
        .merge({
            type_lic_id: r.row('id')
        })
        .without('id')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.insert = function (req, res) {
    var r = req._r;
    var valid = req._validator.validate('exporter.type_license', req.body);
    if (valid) {
        if (req.body.id == null) {
            req.body = Object.assign(req.body, {
                creater: 'admin',
                updater: 'admin',
                date_created: new Date().toISOString(),
                date_updated: new Date().toISOString()
            });
            r.db('external_f3').table('type_license')
                .insert(req.body)
                .run()
                .then(function (response) {
                    result.message = response;
                    if (response.errors == 0) {
                        result.result = true;
                        result.id = response.generated_keys;
                    }
                    res.json(result);
                })
                .error(function (err) {
                    result.message = err;
                    res.json(result);
                })
        } else {
            result.message = 'field "id" must do not have data';
            res.json(result);
        }
    } else {
        result.message = req._validator.errorsText()
        res.json(result);
    }
}
