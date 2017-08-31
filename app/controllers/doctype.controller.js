exports.list = function (req, res) {
    r.table('doc_type')
        .run()
        .then(function (data) {
            res.json(data)
        })
}