var tz = "T00:00:00+07:00";
var QUERY = require('../global/query');
exports.list = function (req, res) {
    var page = (typeof req.query.page !== 'undefined' ? parseInt(req.query.page) - 1 : 0);
    var limit = (typeof req.query.limit !== 'undefined' ? parseInt(req.query.limit) : 100);;
    var skip = page * limit;
    // var r = req.r;
    // var q = {}, d = {}, o = r.desc('exporter_no');
    // for (key in req.query) {

    //     if (req.query[key] == "true") {
    //         req.query[key] = true;
    //     } else if (req.query[key] == "false") {
    //         req.query[key] = false;
    //     } else if (req.query[key] == "null") {
    //         req.query[key] = null;
    //     }

    //     if (key.indexOf('date') > -1) {
    //         d[key] = req.query[key] + tz;
    //     } else if (key != 'page' && key != 'limit' && key != 'pluck' && key != 'without') {
    //         q[key] = req.query[key];
    //     }

    // }
    // if (Object.getOwnPropertyNames(d).length !== 0) {
    //     // console.log(d.date_start);
    //     if (req.query.export_status !== 'undefined' && req.query.export_status == 'false') {
    //         d = r.row('date_expire').ge(r.ISO8601(d.date_start)).and(r.row('date_expire').le(r.ISO8601(d.date_end)));
    //         o = r.asc('date_expire');
    //     } else {
    //         d = r.row('date_load').ge(r.ISO8601(d.date_start)).and(r.row('date_load').le(r.ISO8601(d.date_end)));
    //         o = r.asc('date_load');
    //     }
    // }
    var _query = QUERY._boolean(req.query);
    var tb = r.table('exporter');
    var o = r.desc('exporter_no');
    var data = QUERY._date(_query, tb, o);

    var table = data.tb.filter(_query.q);
    if (typeof req.query.pluck !== 'undefined') {
        table = table.pluck(r.args(req.query.pluck.split(',')));
    }
    if (typeof req.query.without !== 'undefined') {
        table = table.without(r.args(req.query.without.split(',')));
    }
    if (!isNaN(skip)) {
        table = r.expr({
            rows_count: table.count(),
            data: table.coerceTo('array').skip(skip).limit(limit).orderBy(data.o)
        })
    } else {
        table = r.expr({
            rows_count: table.count(),
            data: table.coerceTo('array').orderBy(data.o)
        })
    }
    table.run()
        .then(function (result) {
            result.pages_count = Math.ceil(result.rows_count / limit);
            result.pages_current = (page + 1 > result.pages_count ? result.pages_count : page + 1);
            result.limits_count = (
                result.pages_count != result.pages_current
                    ? limit
                    : limit - ((result.pages_current * limit) - result.rows_count)
            )
            result.start_rowindex = (result.pages_current-1) * limit;
            // delete result['data'];
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
        .pluck('id', 'draft_id', 'draft_status', 'exporter_no', 'company_taxno', { company: ['company_taxno', 'company_name_th', 'company_name_en'] })
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
exports.update = function (req, res) {
    r.table('exporter')
        .get(req.body.id)
        .update(req.body)
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.close = function (req, res) {
    var exporter = r.table('exporter').get(req.body.id);
    exporter
        .update({ close_status: true })
        .do(function (d) {
            return r.table('draft').get(exporter('draft_id')).update({ close_status: true })
        })
        .run()
        .then(function (data) {
            res.json(data)
        })
}