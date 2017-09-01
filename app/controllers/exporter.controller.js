var tz = "T00:00:00+07:00";
exports.list = function (req, res) {
    var page = (typeof req.query.page !== 'undefined' ? parseInt(req.query.page) - 1 : 0);
    var limit = (typeof req.query.limit !== 'undefined' ? parseInt(req.query.limit) : 100);;
    var skip = page * limit;
    var r = req.r;
    var q = {}, d = {}, o = r.desc('exporter_no');
    for (key in req.query) {

        if (req.query[key] == "true") {
            req.query[key] = true;
        } else if (req.query[key] == "false") {
            req.query[key] = false;
        } else if (req.query[key] == "null") {
            req.query[key] = null;
        }

        if (key.indexOf('date') > -1) {
            d[key] = req.query[key] + tz;
        } else if (key != 'page' && key != 'limit' && key != 'pluck' && key != 'without') {
            q[key] = req.query[key];
        }

    }
    if (Object.getOwnPropertyNames(d).length !== 0) {
        // console.log(d.date_start);
        if (req.query.export_status !== 'undefined' && req.query.export_status == false) {
            d = r.row('date_expire').ge(r.ISO8601(d.date_start)).and(r.row('date_expire').le(r.ISO8601(d.date_end)));
            o = r.asc('date_expire');
        } else {
            d = r.row('date_load').ge(r.ISO8601(d.date_start)).and(r.row('date_load').le(r.ISO8601(d.date_end)));
            o = r.asc('date_load');
        }
    }
    var table = r.db('external').table('exporter')
        .filter(q)
        .filter(d)
        .orderBy(o);
    if (typeof req.query.pluck !== 'undefined') {
        table = table.pluck(r.args(split(req.query.pluck)));
    }
    if (typeof req.query.without !== 'undefined') {
        table = table.without(r.args(split(req.query.without)));
    }
    if (!isNaN(skip)) {
        table = table.skip(skip).limit(limit);
    }
    table.run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.get = function (req, res) {
    r.table('exporter')
        .get(req.query.id)
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.search = function (req, res) {
    var r = req.r;
    r.table('exporter')
        .filter(function (f) {
            return f('company')(r.expr(req.query.field)).match(req.query.value)
        })
        .pluck('id', 'draft_id', 'exporter_no', 'company_taxno', { company: ['company_taxno', 'company_name_th', 'company_name_en'] })
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.page = function (req, res) {
    var limit = parseInt(req.query.limit);
    req.r.db('external').table('exporter').count()
        .run()
        .then(function (data) {
            var countPage = Math.ceil(data / limit);
            res.json(countPage);
        })
        .catch(function (err) {
            res.json(err);
        })
}