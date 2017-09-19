var tz = "T00:00:00+07:00";
exports._boolean = function (p) {
    var data = {}, q = {}, d = {};
    for (key in p) {
        if (key != 'page' && key != 'limit' && key != 'pluck' && key != 'without') {
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
    }
    data['q'] = q;
    data['d'] = d;
    return data;
}
exports._date = function (p, tb, o) {
    var data = {};
    if (Object.getOwnPropertyNames(p.d).length !== 0) {
        if (p.q.export_status !== 'undefined' && p.q.export_status == 'false') {
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