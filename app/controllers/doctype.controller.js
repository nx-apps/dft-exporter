exports.list = function (req, res) {
    r.table('doc_type')
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.get = function (req, res) {
    r.table('doc_type')
        .get(req.query.id)
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.insert = function (req, res) {
    r.table('doc_type')
        .insert(req.body)
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.update = function (req, res) {
    r.table('doc_type')
        .get(req.body.id)
        .update(req.body)
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.delete = function (req, res) {
    r.table('doc_type')
        .get(req.query.id)
        .delete()
        .run()
        .then(function (data) {
            res.json(data)
        })
}