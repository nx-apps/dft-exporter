exports.list = function (req, res) {
    var r = req.r;
    r.db('external').table('company')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.listId = function (req, res) {
    var r = req.r;
    r.db('external').table('company').getAll(req.params.id, { index: 'company_taxno' })
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.update = function (req, res) {
    var r = req.r;
    r.db('external').table('company').get(req.body.id).update(req.body)
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            result.message = err;
            res.json(result);
        })
}