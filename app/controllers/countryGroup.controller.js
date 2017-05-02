exports.list = function (req, res) {
    var r = req.r;
    r.db('common').table('country_group')
        .without('country')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.getById = function (req, res) {
    var r = req.r;
    r.db('common').table('country_group')
        .get(req.params.id)
        .merge(function (m) {
            return {
                country: m('country').map(function (c_map) {
                    return r.db('common').table('country').get(c_map).without('date_created', 'date_updated')
                })
            }
        })
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.country = function (req, res) {
    var r = req.r;
    r.db('common').table('country')
        .without('date_created', 'date_updated')
        .filter(function (f) {
            return r.expr(
                r.db('common').table('country_group').get(req.params.id).getField('country')
            ).contains(f('id')).not()

        })
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.countries = function (req, res) {
    var r = req.r;
    r.db('common').table('country')
        .without('date_created', 'date_updated')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.insert = function (req, res) {
    var r = req.r;
    req.body = Object.assign(req.body, {
        creater: 'admin',
        date_created: new Date().toISOString()
    });
    r.db('common').table('country_group')
        .insert(req.body)
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
    req.body = Object.assign(req.body, {
        updater: 'admin',
        date_updated: new Date().toISOString()
    });
    r.db('common').table('country_group')
        .get(req.body.id)
        .update(req.body)
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.delete = function (req, res) {
    var r = req.r;
    r.db('common').table('country_group')
        .get(req.params.id)
        .delete()
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
// exports.remove = function (req, res) {
//     var r = req.r;
//     r.db('common').table('country_group')
//         .get(req.body.id)
//         .update({ country: r.row('country').setDifference([req.body.country]) })
//         .run()
//         .then(function (result) {
//             res.json(result);
//         })
//         .catch(function (err) {
//             res.status(500).json(err);
//         })
// }