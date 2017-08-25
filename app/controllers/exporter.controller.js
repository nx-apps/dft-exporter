var tz = "T00:00:00+07:00";
exports.list = function (req, res) {
    var page = parseInt(req.query.page) - 1;
    var limit = parseInt(req.query.limit);
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
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no').eq(false), null,
                    m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                    m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                    r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                ),
                export_status_name: r.branch(m('date_expire').gt(r.now()), 'ปกติ', 'หมดอายุ'),
                exporter_status_name: r.branch(m('exporter_status').eq(true), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                date_approve: m('date_approve').toISO8601().split('T')(0),
                date_expire2: m('date_expire').toISO8601().split('T')(0),
                date_load2: m('date_load').toISO8601().split('T')(0),
                export_status: r.branch(m('date_expire').gt(r.now()), true, false)
            }
        })
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