var dd = new Date();
var y = dd.getFullYear();
var m = dd.getMonth() + 1;
var d = dd.getDate();
var tz = "T00:00:00.000+07:00";
var d1y = (y - 1) + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (d < 10 ? '0' : '') + d + tz;
exports.report1 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: req.query.date_start,
        date_end: req.query.date_end
    };
    var _query = _boolean(req.query);
    var o = r.desc('exporter_no');
    var tb = r.db('external').table('exporter');
    var data = _date(_query, tb, o);
    data.tb.filter(_query.q)
        .map(function (m) {
            return m.pluck('exporter_no', 'id', 'date_load', 'date_expire')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    lic_type_name: m('lic_type')('lic_type_name'),
                    company_taxno: m('company')('company_taxno'),
                    date_load2: m('date_load').inTimezone('+07').toISO8601().split('T')(0),
                    date_expire2: m('date_expire').inTimezone('+07').toISO8601().split('T')(0),
                    exporter_no_name: m('lic_type')('lic_type_prefix').add(m('exporter_no').coerceTo('string'))
                })
        })
        .orderBy(data.o)
        .run()
        .then(function (result) {
            res.ireport("exporter/report1.jasper", req.query.export || "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}

exports.report2 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: req.query.date_start,
        date_end: req.query.date_end
    };
    var _query = _boolean(req.query);
    var o = r.desc('exporter_no');
    var tb = r.db('external').table('exporter');
    var data = _date(_query, tb, o);
    data.tb.filter(_query.q)
        .map(function (m) {
            var directors = m('company')('company_directors').pluck('TitleNameTH', 'FirstNameTH', 'LastNameTH');
            return m.pluck('exporter_no', 'id', 'date_load', 'date_expire')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    lic_type_name: m('lic_type')('lic_type_name'),
                    company_taxno: m('company')('company_taxno'),
                    // date_load2: m('date_load').inTimezone('+07').toISO8601().split('T')(0),
                    // date_expire2: m('date_expire').inTimezone('+07').toISO8601().split('T')(0),
                    exporter_no_name: m('lic_type')('lic_type_prefix').add(m('exporter_no').coerceTo('string')),
                    exporter_status: 'เป็นสมาชิก',
                    company_directors: r.branch(directors.count().eq(0), [
                        { director_name: null }
                    ], directors.merge(function (m_name) {
                        return {
                            director_name: m_name('TitleNameTH').add(' ').add(m_name('FirstNameTH')).add(' ').add(m_name('LastNameTH'))
                        }
                    })
                    ).without('TitleNameTH', 'FirstNameTH', 'LastNameTH')
                })
        })
        .orderBy(data.o)
        .run()
        .then(function (result) {
            res.ireport("exporter/report2.jasper", req.query.export || "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.report3 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: req.query.date_start,
        date_end: req.query.date_end
    };
    var _query = _boolean(req.query);
    var o = r.desc('exporter_no');
    var tb = r.db('external').table('exporter');
    var data = _date(_query, tb, o);
    data.tb.filter(_query.q)
        .map(function (m) {
            return m.pluck('exporter_no', 'id', 'date_load', 'date_expire')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    lic_type_name: m('lic_type')('lic_type_name'),
                    company_taxno: m('company')('company_taxno'),
                    company_address_th: m('company')('company_address_th'),
                    company_phone: m('company')('company_phone'),
                    company_fax: m('company')('company_fax'),
                    exporter_no_name: m('lic_type')('lic_type_prefix').add(m('exporter_no').coerceTo('string')),

                })
        })
        .orderBy(data.o)
        .run()
        .then(function (result) {
            res.ireport("exporter/report3.jasper", req.query.export || "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.signRequest = function (req, res) {
    // var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),

    };
    r.db('external').table(req.query.table).getAll(req.query.id)
        .map(function (m) {
            return m.pluck('lic_type', 'lic_type_id', 'company').merge({
                exporter_no_name: m('lic_type')('lic_type_prefix').add(m('exporter_no').coerceTo('string')),
                date_created: m('date_created').toISO8601().split('T')(0)
            })
        })
        .run()
        .then(function (result) {
            // res.json(result);
            parameters.OUTPUT_NAME = 'หนังสือเรียนอธิบดี_ขึ้นทะเบียน_' + result[0].exporter_no_name;
            res.ireport("exporter/approve_general_1.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.signCompany = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table(req.query.table).getAll(req.query.id)
        .map(function (m) {
            return m.pluck('company').merge({
                exporter_no_name: m('lic_type')('lic_type_prefix').add(m('exporter_no').coerceTo('string')),
                date_created: m('date_created').toISO8601().split('T')(0)
            })
        })
        .run()
        .then(function (result) {
            // res.json(result);
            parameters.OUTPUT_NAME = 'หนังสือเรียนบริษัท_ขึ้นทะเบียน_' + result[0].exporter_no_name;
            res.ireport("exporter/approve_general_2.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.change = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table(req.query.table).getAll(req.query.id)
        .map(function (m) {
            return m.pluck('company', 'date_updated', 'date_approve').merge({
                exporter_no_name: m('lic_type')('lic_type_prefix').add(m('exporter_no').coerceTo('string'))
            })
        })
        .run()
        .then(function (result) {
            // res.json(result);
            parameters.OUTPUT_NAME = 'หนังสือเรียนอธิบดี_เปลี่ยนประเภทจากหีบห่อเป็นทั่วไป_' + result[0].exporter_no_name;
            res.ireport("exporter/approve_changtype.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.renewRequest = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table(req.query.table).getAll(req.query.id)
        .map(function (m) {
            return m.pluck('company', 'date_updated', 'lic_type', 'date_load', 'date_approve').merge({
                exporter_no_name: m('lic_type')('lic_type_prefix').add(m('exporter_no').coerceTo('string'))
            })
        })
        .run()
        .then(function (result) {
            // res.json(result);
            parameters.OUTPUT_NAME = 'หนังสือเรียนอธิบดี_ต่ออายุ_' + result[0].exporter_no_name;
            res.ireport("exporter/approve_renew_1.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.renewCompany = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table(req.query.table).getAll(req.query.id)
        .map(function (m) {
            return m.pluck('date_updated').merge({
                company_name_th: m('company')('company_name_th'),
                exporter_no_name: m('lic_type')('lic_type_prefix').add(m('exporter_no').coerceTo('string'))
            })
        })
        .run()
        .then(function (result) {
            // res.json(result);
            parameters.OUTPUT_NAME = 'หนังสือเรียนบริษัท_ต่ออายุ_' + result[0].exporter_no_name;
            res.ireport("exporter/approve_renew_2.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
function _boolean(p) {
    var data = {}, q = {}, d = {};
    for (key in p) {

        if (p[key] == "true") {
            p[key] = true;
        } else if (p[key] == "false") {
            p[key] = false;
        } else if (p[key] == "null") {
            p[key] = null;
        }

        if (key.indexOf('date') > -1) {
            d[key] = p[key] + tz;
        } else {
            q[key] = p[key];
        }
    }
    data['q'] = q;
    data['d'] = d;
    return data;
}
function _date(p, tb, o) {
    var data = {};
    if (Object.getOwnPropertyNames(p.d).length !== 0) {
        if (p.q.export_status !== 'undefined' && p.q.export_status == false) {
            tb = tb.between(r.ISO8601(p.d.date_start), r.ISO8601(p.d.date_end).add(1), { index: 'date_expire' });
            o = r.asc('date_expire');
        } else {
            tb = tb.between(r.ISO8601(p.d.date_start), r.ISO8601(p.d.date_end).add(1), { index: 'date_load' });
            o = r.asc('date_load');
        }
    }
    data['tb'] = tb;
    data['o'] = o;
    return data;
}