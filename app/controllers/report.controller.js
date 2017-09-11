var dd = new Date();
var y = dd.getFullYear();
var m = dd.getMonth() + 1;
var d = dd.getDate();
var tz = "T00:00:00.000+07:00";
var d1y = (y - 1) + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (d < 10 ? '0' : '') + d + tz;
exports.report1 = function (req, res) {
    var r = req.r;
    // res.json(__dirname.replace('controller','report'));
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: req.query.date_start,
        date_end: req.query.date_end
    };
    var q = {}, d = {}, o = r.desc('exporter_no');
    var tb = r.db('external').table('exporter');
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
        } else {
            q[key] = req.query[key];
        }
    }
    // console.log(parameters, d);
    if (Object.getOwnPropertyNames(d).length !== 0) {
        // parameters['date_start'] = d['date_start'];
        // parameters['date_end'] = d['date_end'];
        if (req.query.export_status !== 'undefined' && req.query.export_status == false) {
            tb = tb.between(r.ISO8601(d.date_start), r.ISO8601(d.date_end).add(1), { index: 'date_expire' })
            // d = r.row('date_expire').ge(r.ISO8601(d.date_start)).and(r.row('date_expire').le(r.ISO8601(d.date_end)));
            o = r.asc('date_expire');
        } else {
            tb = tb.between(r.ISO8601(d.date_start), r.ISO8601(d.date_end).add(1), { index: 'date_load' })
            // d = r.row('date_load').ge(r.ISO8601(d.date_start)).and(r.row('date_load').le(r.ISO8601(d.date_end)));
            o = r.asc('date_load');
        }
    }
    tb.filter(q)
        .map(function (m) {
            return m.pluck('exporter_no', 'id', 'date_load', 'date_expire')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    lic_type_name: m('lic_type')('lic_type_name'),
                    company_taxno: m('company')('company_taxno'),
                    // exporter_status: r.branch(m('exporter_status').eq(true), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                    date_load2: m('date_load').inTimezone('+07').toISO8601().split('T')(0),
                    date_expire2: m('date_expire').inTimezone('+07').toISO8601().split('T')(0),
                    exporter_no_name: m('lic_type')('lic_type_prefix').add(m('exporter_no').coerceTo('string'))
                })
        })
        .orderBy(o)
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/report1.jasper", req.query.export || "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}