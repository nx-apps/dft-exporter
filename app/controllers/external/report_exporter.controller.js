var dd = new Date();
var y = dd.getFullYear();
var m = dd.getMonth();
var d = dd.getDate();
var tz = "T00:00:00.000+07:00";
var d1y = (y - 1) + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (d < 10 ? '0' : '') + d + tz;
exports.report1 = function (req, res) {
    var r = req.r;
    // res.json(__dirname.replace('controller','report'));
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: y + "-01-01" + tz,
        date_end: y + "-12-31" + tz
    };
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
        } else {
            q[key] = req.query[key];
        }
    }
    // console.log(parameters, d);
    if (Object.getOwnPropertyNames(d).length !== 0) {
        parameters['date_start'] = d['date_start'];
        parameters['date_end'] = d['date_end'];
        if (req.query.export_status !== 'undefined' && req.query.export_status == false) {
            d = r.row('date_expire').ge(r.ISO8601(d.date_start)).and(r.row('date_expire').le(r.ISO8601(d.date_end)));
            o = r.asc('date_expire');
        } else {
            d = r.row('date_load').ge(r.ISO8601(d.date_start)).and(r.row('date_load').le(r.ISO8601(d.date_end)));
            o = r.asc('date_load');
        }
    }
    var date_start = parameters['date_start']
    var date_end = parameters['date_end']
    // console.log(parameters);
    r.db('external').table('exporter')
        // .filter(function (f) {
        //     return f('date_approve').date().during(r.ISO8601(date_start).inTimezone('+07').date(),
        //         r.ISO8601(date_end).inTimezone('+07').date(), { rightBound: 'closed' })
        // })
        .filter(d)
        .map(function (m) {
            return m.pluck('exporter_no', 'id', 'date_approve')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    lic_type_name: m('lic_type')('lic_type_name'),
                    company_taxno: m('company')('company_taxno'),
                    exporter_status: r.branch(m('exporter_status').eq(true), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                    date_approve: m('date_approve').inTimezone('+07').toISO8601().split('T')(0),
                    date_expire: m('date_expire').inTimezone('+07').toISO8601().split('T')(0),
                    exporter_no: r.branch(
                        m.hasFields('exporter_no').eq(false), null,
                        m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                        m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                        r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                    )
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
exports.report2 = function (req, res, next) {
    var r = req.r;
    //res.json(__dirname.replace('controller','report'));
    var parameters = {
        // CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: y + "-01-01" + tz,
        date_end: y + "-12-31" + tz
    };
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
        } else {
            q[key] = req.query[key];
        }
    }
    // console.log(parameters, d);
    if (Object.getOwnPropertyNames(d).length !== 0) {
        parameters['date_start'] = d['date_start'];
        parameters['date_end'] = d['date_end'];
        if (req.query.export_status !== 'undefined' && req.query.export_status == false) {
            d = r.row('date_expire').ge(r.ISO8601(d.date_start)).and(r.row('date_expire').le(r.ISO8601(d.date_end)));
            o = r.asc('date_expire');
        } else {
            d = r.row('date_load').ge(r.ISO8601(d.date_start)).and(r.row('date_load').le(r.ISO8601(d.date_end)));
            o = r.asc('date_load');
        }
    }
    var date_start = parameters['date_start']
    var date_end = parameters['date_end']
    // console.log(parameters);

    r.db('external').table('exporter')
        // .filter(function (f) {
        //     return f('date_approve').date().during(r.ISO8601(date_start).inTimezone('+07').date(),
        //         r.ISO8601(date_end).inTimezone('+07').date(), { rightBound: 'closed' })
        // })
        .filter(d)
        .map(function (m) {
            return m.pluck('exporter_no')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    lic_type_name: m('lic_type')('lic_type_name'),
                    exporter_status: r.branch(m('exporter_status').eq(true), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                    exporter_no: r.branch(
                        m.hasFields('exporter_no').eq(false), null,
                        m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                        m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                        r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                    ),
                    company_directors: m('company')('company_directors').pluck('TitleNameTH', 'FirstNameTH', 'LastNameTH')
                        .merge(function (m_name) {
                            return {
                                director_name: m_name('TitleNameTH').add(' ').add(m_name('FirstNameTH')).add(' ').add(m_name('LastNameTH'))
                            }
                        }).without('TitleNameTH', 'FirstNameTH', 'LastNameTH')
                })
        })
        .orderBy(o)
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/report2.jasper", "pdf", result, parameters);
        });
}
exports.report3 = function (req, res, next) {
    var r = req.r;
    //res.json(__dirname.replace('controller','report'));
    var parameters = {
        // CURRENT_DATE: new Date().toISOString().slice(0, 10),
        date_start: y + "-01-01" + tz,
        date_end: y + "-12-31" + tz
    };
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
        } else {
            q[key] = req.query[key];
        }
    }
    // console.log(parameters, d);
    if (Object.getOwnPropertyNames(d).length !== 0) {
        parameters['date_start'] = d['date_start'];
        parameters['date_end'] = d['date_end'];
        if (req.query.export_status !== 'undefined' && req.query.export_status == false) {
            d = r.row('date_expire').ge(r.ISO8601(d.date_start)).and(r.row('date_expire').le(r.ISO8601(d.date_end)));
            o = r.asc('date_expire');
        } else {
            d = r.row('date_load').ge(r.ISO8601(d.date_start)).and(r.row('date_load').le(r.ISO8601(d.date_end)));
            o = r.asc('date_load');
        }
    }
    var date_start = parameters['date_start']
    var date_end = parameters['date_end']
    //console.log(parameters);

    r.db('external').table('exporter')
        // .filter(function (f) {
        //     return f('date_approve').date().during(r.ISO8601(date_start).inTimezone('+07').date(),
        //         r.ISO8601(date_end).inTimezone('+07').date(), { rightBound: 'closed' })
        // })
        .filter(d)
        .map(function (m) {
            return m.pluck('exporter_no', 'id', 'date_approve')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    // lic_type_name: m('lic_type')('lic_type_name'),
                    company_address_th: m('company')('company_address_th'),
                    company_phone: m('company')('company_phone'),
                    company_fax: m('company')('company_fax'),
                    // exporter_status: r.branch(m('exporter_status').eq(true), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                    exporter_no: r.branch(
                        m.hasFields('exporter_no').eq(false), null,
                        m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                        m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                        r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                    )
                })
        })
        .orderBy(o)
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/report3.jasper", "pdf", result, parameters);
        });
}
exports.exporter_detail = function (req, res) {
    var r = req.r;
    var params = req.params;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('exporter').getAll(req.params.id, { index: 'id' })
        .map(function (m) {
            return m.pluck('exporter_no', 'id', 'date_approve')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    company_name_en: m('company')('company_name_en'),
                    company_address_th: m('company')('company_address_th'),
                    company_address_en: m('company')('company_address_en'),
                    company_phone: m('company')('company_phone'),
                    company_taxno: m('company')('company_taxno'),
                    company_fax: m('company')('company_fax'),
                    company_email: m('company')('company_email'),
                    lic_type_name: m('lic_type')('lic_type_name'),
                    exporter_status: r.branch(m('exporter_status').eq(true), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                    exporter_no: r.branch(
                        m.hasFields('exporter_no').eq(false), null,
                        m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                        m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                        r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                    ),
                    company_directors: r.branch(m('company').hasFields('company_directors').eq(true), m('company')('company_directors').pluck('TitleNameTH', 'FirstNameTH', 'LastNameTH')
                        .merge(function (m_name) {
                            return {
                                director_name: m_name('TitleNameTH').add(' ').add(m_name('FirstNameTH')).add(' ').add(m_name('LastNameTH'))
                            }
                        }).without('TitleNameTH', 'FirstNameTH', 'LastNameTH'),
                        []
                    ),
                    date_approve: m('date_approve').inTimezone('+07').toISO8601().split('T')(0)
                })
        })
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/exporter_detail.jasper", "pdf", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_general_1 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('draft').getAll(req.params.id, { index: 'id' })
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no').eq(false), null,
                    m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                    m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                    r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                ),
                date_created: m('date_created').toISO8601().split('T')(0)
            }
        })
        .eqJoin('lic_type_id', r.db('external').table('license_type')).pluck("left", { right: "lic_type_name" }).zip()
        .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()

        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/approve_general_1.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_general_2 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('draft').getAll(req.params.id, { index: 'id' })
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no').eq(false), null,
                    m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                    m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                    r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                ),
                date_created: m('date_created').toISO8601().split('T')(0)
            }
        })
        .eqJoin('lic_type_id', r.db('external').table('license_type')).pluck("left", { right: "lic_type_name" }).zip()
        .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/approve_general_2.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_changtype = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('exporter')
        .map(function (m) {
            return m.pluck('exporter_no', 'id', 'date_approve', 'lic_type_id', 'draft_id')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    lic_type_name: m('lic_type')('lic_type_name'),
                })
        })
        .merge(function (m) {
            return {
                lice_type_name_old: m('lic_type_name'),
                lice_type_id_old: m('lic_type_id')
            }
        })
        .eqJoin('draft_id', r.db('external').table('draft'))//.getAll(req.params.id, {index: 'id'})
        .without([{ left: ['lic_type_name', 'lic_type_id'] }]).zip()
        .eqJoin('lic_type_id', r.db('external').table('license_type')).without({ right: 'id' }).zip()
        .merge(function (m) {
            return {
                lice_type_name_new: m('lic_type_name'),
                lice_type_id_new: m('lic_type_id')
            }
        })
        .without('lic_type_name', 'lic_type_fullname', 'company', 'lic_type')
        // .eqJoin("company_id", r.db('external').table("company")).without({ right: 'id' }).zip()
        .merge(function (m) {
            return {
                exporter_no: r.branch(
                    m.hasFields('exporter_no').eq(false), null,
                    m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                    m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                    r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                ),
                // approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่'),
                date_created: m('date_created').toISO8601().split('T')(0)
            }
        })
        .filter(function (row) {
            return row("id").eq(req.params.id)
        })
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/approve_changtype.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_renew_1 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('exporter')
        .map(function (m) {
            return m.pluck('exporter_no', 'id', 'date_approve', 'draft_id')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    lic_type_name: m('lic_type')('lic_type_name')
                })
        })
        .eqJoin('draft_id', r.db('external').table('draft')).pluck("left", { right: "date_updated" }).zip()//.getAll(req.params.id, {index: 'id'})
        .merge(function (m) {
            return {
                exporter_no: r.branch(
                    m.hasFields('exporter_no').eq(false), null,
                    m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                    m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                    r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                )
                // approve_status: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่')
            }
        })
        .filter(function (row) {
            return row("draft_id").eq(req.params.id)
        })
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/approve_renew_1.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.approve_renew_2 = function (req, res) {
    var r = req.r;
    var parameters = {
        CURRENT_DATE: new Date().toISOString().slice(0, 10)
    };
    r.db('external').table('exporter')
        .map(function (m) {
            return m.pluck('exporter_no', 'id', 'date_approve', 'draft_id')
                .merge({
                    company_name_th: m('company')('company_name_th'),
                    // lic_type_name: m('lic_type')('lic_type_name')
                })
        })
        .eqJoin('draft_id', r.db('external').table('draft')).pluck("left", { right: "date_updated" }).zip()
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no').eq(false), null,
                    m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                    m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                    r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                )
            }
        })
        .filter(function (row) {
            return row("draft_id").eq(req.params.id)
        })
        .run()
        .then(function (result) {
            // res.json(result);
            res.ireport("exporter/approve_renew_2.jasper", req.query.export || "word", result, parameters);
        })
        .error(function (err) {
            res.json(err)
        })
}
// exports.report4 = function (req, res) {
//     var r = req.r;
//     r.db('external').table('company')
//         .outerJoin(r.db('external').table('exporter')
//             .merge(function (m) {
//                 return {
//                     exporter_id: m('id'),
//                     book: r.db('g2g').table('shipment_detail')
//                         .filter({ exporter_id: m('id') })
//                         .pluck('book_id')
//                         .distinct()
//                         .coerceTo('array')
//                         .eqJoin('book_id', r.db('g2g').table('book')).pluck({ right: 'etd_date' }, "left").zip()
//                         .orderBy(r.desc('etd_date'))
//                         .limit(1)
//                         .getField('etd_date')
//                 }
//             }).without('id')
//             .merge(function (m) {
//                 return {
//                     export_date: r.branch(
//                         m('book').eq([]),
//                         null,
//                         m('book')(0).split('T')(0)
//                     ),
//                     export_date_expire: r.branch(
//                         m('book').eq([]),
//                         null,
//                         r.ISO8601(m('book')(0)).add(31449600)
//                         // r.ISO8601(m('book')(0)).year().add(1)
//                         //  r.ISO8601(m('book')(0)).month()
//                         //r.ISO8601(m('book')(0)).day().sub(1)
//                         //.add(31536000)
//                     ),
//                     exporter_date_expire: r.ISO8601(m('exporter_date_approve')).add(31449600)
//                     // export_status: r.branch(
//                     //     m('book').eq([]),
//                     //     false,
//                     //     r.ISO8601(m('book')(0)).add(31449600).gt(r.now())
//                     // )
//                     // export_date: r.branch(m('book').eq([]), null, m('book')(0).split('T')(0)),
//                     // exporter_date_approve: m('exporter_date_approve').split('T')(0)
//                 }
//             })
//             .merge(function (mm) {
//                 return {
//                     export_date_expire: r.branch(mm('export_date_expire').gt(mm('exporter_date_expire')),
//                         mm('export_date_expire'),
//                         mm('exporter_date_expire'))
//                 }
//             })
//             .merge(function (mmm) {
//                 return {
//                     export_status: r.branch(mmm('export_date_expire').gt(r.now()), true, false),
//                     export_date_expire: mmm('export_date_expire').toISO8601(),
//                     exporter_date_expire: mmm('exporter_date_expire').toISO8601()
//                 }
//             })
//             .without('book'),
//         function (company, exporter) {
//             return company('id').eq(exporter('company_id'))
//         }).zip()
//         // .eqJoin('type_lic_id', r.db('external').table('license_type')).pluck({ right: 'type_lic_name' }, 'left').zip()
//         // .eqJoin('seller_id', r.db('external').table('seller'))
//         // .pluck({ right: ['seller_name_th', 'seller_name_en', 'seller_address_th', 'seller_address_en'] }, 'left').zip()
//         .merge(function (m) {
//             return {
//                 exporter_status_name: r.branch(m.hasFields('exporter_no'), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
//                 exporter_no_name: r.branch(
//                     m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
//                     , null)
//             }
//         })
//         .filter({ export_status: false })
//         .orderBy('exporter_no')
//         .run()
//         .then(function (result) {
//             // res.json(result);
//             parameters = {}
//             res.ireport("exporter/report4.jasper", req.query.export || "pdf", result, parameters);
//         })
//         .error(function (err) {
//             res.json(err)
//         })
// }
// exports.report5 = function (req, res) {
//     var r = req.r;
//     var date_start, date_end;
//     var _nextDay = new Date();
//     _nextDay.setDate(_nextDay.getDate() + 1);
//     var nextDays = _nextDay.toISOString().slice(0, 10);
//     var parameters = {
//         CURRENT_DATE: new Date().toISOString().slice(0, 10),
//         date_start: new Date().toISOString().slice(0, 10),
//         date_end: nextDays
//     };
//     var d = {};
//     // console.log('ddd',req.query['date_start']);
//     // parameters['date_end'].setDate(parameters['date_end'].getDate() + 1)
//     // console.log('dddxxxx',parameters['date_end']);
//     //ถ้าไม่ส่งอะไรมาเลย
//     // if(Object.getOwnPropertyNames(req.query).length == 0){
//     d['date_start'] = parameters['date_start']
//     d['date_end'] = parameters['date_end'];
//     // }else {
//     // d['date_start'] = req.query['date_start']
//     // d['date_end'] = parameters['date_end'];
//     // d['date_end'] = req.query['date_end']
//     // }
//     //  console.log('ddd',d);   
//     // if (Object.getOwnPropertyNames(d).length !== 0) {
//     //     parameters['date_start'] = d['date_start'].split('T')[0];
//     //     parameters['date_end'] = d['date_end'].split('T')[0];
//     // } else {
//     parameters['date_start'] = parameters['date_start'];
//     parameters['date_end'] = parameters['date_end'];
//     // }
//     // console.log('parameters=>',parameters)
//     // date_start = "2016-12-01T00:00:00.000Z";
//     // date_end = "2016-12-31T00:00:00.000Z";
//     date_start = parameters.date_start;
//     date_end = parameters.date_end;
//     r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
//         .merge(shm_det_merge => {
//             return {
//                 quantity: r.db('g2g').table('shipment_detail')
//                     .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
//                     .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
//                     .filter(date_filter => {
//                         return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
//                     })
//                     .sum('shm_det_quantity')
//             }
//         })
//         .eqJoin('seller_id', r.db('external').table("seller")).pluck("left", { right: ["seller_address_th"] }).zip()
//         .merge(function (m) {
//             return {
//                 exporter_no_name: r.branch(
//                     m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
//                     , null),
//                 exporter_date_approve: m('exporter_date_approve').split('T')(0),
//                 count_exporter: r.db('external').table("exporter").between(date_start, date_end
//                     , { index: 'exporter_date_approve' }).count(),
//                 sum: r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
//                     .merge(shm_det_merge => {
//                         return {
//                             quantity: r.db('g2g').table('shipment_detail')
//                                 .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
//                                 .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
//                                 .filter(date_filter => {
//                                     return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
//                                 })
//                                 .sum('shm_det_quantity')
//                         }
//                     }).sum('quantity')
//             }
//         })
//         .orderBy('exporter_date_approve')
//         .run()
//         .then(function (result) {
//             // res.json(result);
//             //  parameters = {}
//             res.ireport("exporter/report5.jasper", req.query.export || "pdf", result, parameters);
//         })
//         .error(function (err) {
//             res.json(err)
//         })
// }
// exports.report5_1 = function (req, res) {
//     var r = req.r;
//     var date_start, date_end;
//     var parameters = {
//         CURRENT_DATE: new Date().toISOString().slice(0, 10),
//         date_start: y + "-01-01" + tz,
//         date_end: y + "-12-31" + tz
//     };
//     var d = {};
//     //ถ้าไม่ส่งอะไรมาเลย
//     if (Object.getOwnPropertyNames(req.query).length == 0) {
//         d['date_start'] = "2000-01-01T00:00:00.000Z";
//         d['date_end'] = parameters['CURRENT_DATE'];
//     } else if (Object.getOwnPropertyNames(req.query).length == 1) {
//         if (req.query['date_start'] !== undefined) {
//             d['date_start'] = req.query['date_start']
//             d['date_end'] = parameters['CURRENT_DATE'];
//         } else {
//             d['date_start'] = "2000-01-01T00:00:00.000Z";
//             d['date_end'] = req.query['date_end']
//         }
//     } else {
//         d['date_start'] = req.query['date_start']
//         d['date_end'] = req.query['date_end']
//     }

//     if (Object.getOwnPropertyNames(d).length !== 0) {
//         parameters['date_start'] = d['date_start'].split('T')[0];
//         parameters['date_end'] = d['date_end'].split('T')[0];
//     } else {
//         parameters['date_start'] = parameters['date_start'].split('T')[0];
//         parameters['date_end'] = parameters['date_end'].split('T')[0];
//     }

//     // console.log('parameters=>',parameters)
//     // date_start = "2016-12-01T00:00:00.000Z";
//     // date_end = "2016-12-31T00:00:00.000Z";
//     date_start = parameters.date_start;
//     date_end = parameters.date_end;
//     r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
//         .merge(shm_det_merge => {
//             return {
//                 quantity: r.db('g2g').table('shipment_detail')
//                     .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
//                     .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
//                     .filter(date_filter => {
//                         return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
//                     })
//                     .sum('shm_det_quantity')
//             }
//         })
//         .eqJoin('seller_id', r.db('external').table("seller")).pluck("left", { right: ["seller_name_th"] }).zip()
//         .merge(function (m) {
//             return {
//                 exporter_no_name: r.branch(
//                     m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
//                     , null),
//                 exporter_date_approve: m('exporter_date_approve').split('T')(0),
//                 count_exporter: r.db('external').table("exporter").between(date_start, date_end
//                     , { index: 'exporter_date_approve' }).count(),
//                 sum: r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
//                     .merge(shm_det_merge => {
//                         return {
//                             quantity: r.db('g2g').table('shipment_detail')
//                                 .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
//                                 .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
//                                 .filter(date_filter => {
//                                     return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
//                                 })
//                                 .sum('shm_det_quantity')
//                         }
//                     }).sum('quantity')
//             }
//         })
//         .orderBy('exporter_date_approve')
//         .run()
//         .then(function (result) {
//             //   res.json(result);
//             //  parameters = {}
//             res.ireport("exporter/report5_1.jasper", req.query.export || "pdf", result, parameters);
//         })
//         .error(function (err) {
//             res.json(err)
//         })
// }
// exports.report5_2 = function (req, res) {
//     var r = req.r;
//     var date_start, date_end;
//     var parameters = {
//         CURRENT_DATE: new Date().toISOString().slice(0, 10),
//         date_start: y + "-01-01" + tz,
//         date_end: y + "-12-31" + tz
//     };
//     var d = {};
//     //ถ้าไม่ส่งอะไรมาเลย
//     if (Object.getOwnPropertyNames(req.query).length == 0) {
//         d['date_start'] = "2000-01-01T00:00:00.000Z";
//         d['date_end'] = parameters['CURRENT_DATE'];
//     } else if (Object.getOwnPropertyNames(req.query).length == 1) {
//         if (req.query['date_start'] !== undefined) {
//             d['date_start'] = req.query['date_start']
//             d['date_end'] = parameters['CURRENT_DATE'];
//         } else {
//             d['date_start'] = "2000-01-01T00:00:00.000Z";
//             d['date_end'] = req.query['date_end']
//         }
//     } else {
//         d['date_start'] = req.query['date_start']
//         d['date_end'] = req.query['date_end']
//     }

//     if (Object.getOwnPropertyNames(d).length !== 0) {
//         parameters['date_start'] = d['date_start'].split('T')[0];
//         parameters['date_end'] = d['date_end'].split('T')[0];
//     } else {
//         parameters['date_start'] = parameters['date_start'].split('T')[0];
//         parameters['date_end'] = parameters['date_end'].split('T')[0];
//     }
//     // console.log('parameters=>',parameters)
//     // date_start = "2016-12-01T00:00:00.000Z";
//     // date_end = "2016-12-31T00:00:00.000Z";
//     date_start = parameters.date_start;
//     date_end = parameters.date_end;
//     r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
//         .merge(shm_det_merge => {
//             return {
//                 quantity: r.db('g2g').table('shipment_detail')
//                     .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
//                     .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
//                     .filter(date_filter => {
//                         return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
//                     })
//                     .sum('shm_det_quantity')
//             }
//         })
//         .eqJoin('seller_id', r.db('external').table("seller")).pluck("left", { right: ["seller_name_th"] }).zip()
//         .merge(function (m) {
//             return {
//                 exporter_no_name: r.branch(
//                     m.hasFields('exporter_no'), r.expr('ข.').add(m('exporter_no').coerceTo('string'))
//                     , null),
//                 exporter_date_approve: m('exporter_date_approve').split('T')(0),
//                 count_exporter: r.db('external').table("exporter").between(date_start, date_end
//                     , { index: 'exporter_date_approve' }).count(),
//                 sum: r.db('external').table("exporter").between(date_start, date_end, { index: 'exporter_date_approve' })
//                     .merge(shm_det_merge => {
//                         return {
//                             quantity: r.db('g2g').table('shipment_detail')
//                                 .getAll(shm_det_merge('id'), { index: 'exporter_id' }).pluck("shm_det_quantity", "book_id").coerceTo('array')
//                                 .eqJoin('book_id', r.db('g2g').table('book')).pluck("left", { right: "etd_date" }).zip()
//                                 .filter(date_filter => {
//                                     return date_filter('etd_date').ge(date_start).and(date_filter('etd_date').le(date_end))
//                                 })
//                                 .sum('shm_det_quantity')
//                         }
//                     }).sum('quantity')
//             }
//         })
//         .orderBy('exporter_date_approve')
//         .run()
//         .then(function (result) {
//             //   res.json(result);
//             //  parameters = {}
//             res.ireport("exporter/report5_2.jasper", req.query.export || "pdf", result, parameters);
//         })
//         .error(function (err) {
//             res.json(err)
//         })
// }

