exports.list = function (req, res) {
    r.table('license_type')
        .run()
        .then(function (data) {
            res.json(data)
        })
}