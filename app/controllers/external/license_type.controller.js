exports.license_type = function (req, res) {
    var r = req.r;
    r.db('external').table("license_type")
        .merge(function (row) {
            return { lic_type_id: row('id') }
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
exports.license_typeId = function (req, res) {
    var r = req.r;
    r.db('external').table("license_type")
        .get(req.params.lic_type_id.toUpperCase())
        .merge({
            lic_type_id: r.row('id')
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
    var r = req.r;
    var valid = req.ajv.validate('exporter.license_type', req.body);
    if (valid) {
        if (req.body.id == null) {
            req.body = Object.assign(req.body, {
                creater: 'admin',
                updater: 'admin',
                date_created: r.now().inTimezone('+07'),
                date_updated: r.now().inTimezone('+07')
            });
            r.db('external').table('license_type')
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
        result.message = req.ajv.errorsText()
        res.json(result);
    }
}
