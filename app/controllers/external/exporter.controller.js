var dd = new Date();
var y = dd.getFullYear();
var m = dd.getMonth();
var d = dd.getDate();
var tz = "T00:00:00+07:00";
var d1y = (y - 1) + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (d < 10 ? '0' : '') + d + tz;

exports.exporter = function (req, res) {
    var page = parseInt(req.query.page) - 1;
    var limit = parseInt(req.query.limit);
    var skip = page * limit;
    var r = req.r;
    var q = {}, d = {};
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
        d = r.row('date_approve').gt(d.date_start).and(r.row('date_approve').lt(d.date_end));
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
                date_expire: m('date_expire').toISO8601().split('T')(0),
                export_status: r.branch(m('date_expire').gt(r.now()), true, false)
            }
        })
        .filter(q)
        .filter(d)
        .orderBy('exporter_no');
    if (typeof req.query.pluck !== 'undefined') {
        table = table.pluck(r.args(split(req.query.pluck)));
    }
    if (typeof req.query.without !== 'undefined') {
        table = table.without(r.args(split(req.query.without)));
    }
    if (!isNaN(skip)) {
        table = table.skip(skip).limit(limit);
    }
    // .pluck(req.query.pluck)
    table.run()
        .then(function (result) {
            // res.setHeader('Access-Control-Allow-Origin', 'https://localhost:3001')
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.exporter_search = function (req, res) {
    var r = req.r;
    var table = r.db('external').table('exporter')
        .orderBy('company_taxno');
    if (req.query.type == 'number') {
        table = table.filter(r.row('company')('company_taxno').match(req.query.company_taxno));
    }
    if (req.query.type == 'char_th') {
        table = table.filter(r.row('company')('company_name_th').match(req.query.company_name_th));
    }
    if (req.query.type == 'char_en') {
        table = table.filter(r.row('company')('company_name_en').match(req.query.company_name_en));
    }
    table.run()
        .then(function (result) {
            // res.setHeader('Access-Control-Allow-Origin', 'https://localhost:3001')
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.exporterId = function (req, res) {
    // res.json(req.query.company_taxno);
    req.jdbc.query('mssql', `
        select 
            convert(nvarchar(10),max(approve_date),120) as date_load
            from V_Header_EDI_Rice
            where company_taxno = ? or company_tax=?
    `, [req.query.company_taxno, req.query.company_taxno],
        function (err, data) {
            data = JSON.parse(data);
            var hasData = data[0]['date_load'];
            var dataQuery = r.db('external').table("exporter").getAll(req.params.exporter_id, { index: 'id' })
                .merge(function (m) {
                    return {
                        exporter_no_name: r.branch(
                            m.hasFields('exporter_no').eq(false), null,
                            m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                            m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                            r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                        ),
                        exporter_status_name: r.branch(m('exporter_status').eq(true), 'เป็นสมาชิก', 'ไม่เป็นสมาชิก'),
                        date_approve: m('date_approve').toISO8601().split('T')(0),
                        date_load: m('date_load').toISO8601().split('T')(0),
                        date_expire: m('date_expire').toISO8601().split('T')(0),
                        company_directors: r.branch(m('company').hasFields('company_directors').eq(true), m('company')('company_directors').pluck('TitleNameTH', 'FirstNameTH', 'LastNameTH')
                            .merge(function (m_name) {
                                return {
                                    director_name: m_name('TitleNameTH').add(' ').add(m_name('FirstNameTH')).add(' ').add(m_name('LastNameTH'))
                                }
                            }).without('TitleNameTH', 'FirstNameTH', 'LastNameTH'),
                            []
                        ),
                        // export_status: r.branch(m('date_expire').gt(r.now()), true, false),
                        export_status_name: r.branch(m('export_status').eq(true), 'ปกติ', 'หมดอายุ')
                    }
                })
                .eqJoin('draft_id', r.db('external').table('draft')).pluck("left", { right: ["draft_status"] }).zip();
            // if (data[0]['date_load'] != null) {
            r.db('external').table("exporter").get(req.params.exporter_id)
                .update(function (u) {
                    var dateLoad = r.ISO8601(data[0]['date_load'] + 'T00:00:00+07:00');
                    var dateExpire = r.time(dateLoad.year().add(1),
                        dateLoad.month(),
                        dateLoad.day(),
                        "+07:00"
                    ).inTimezone('+07');
                    return r.branch(
                        r.expr(hasData).eq(null),
                        {
                            export_status: r.branch(u('date_expire').gt(r.now().inTimezone('+07')), true, false)
                        },
                        {
                            date_load: dateLoad,
                            date_expire: dateExpire,
                            export_status: r.branch(dateExpire.gt(r.now().inTimezone('+07')), true, false)
                        }
                    )
                })
                .do(function (d) {
                    return dataQuery
                })
                .run().then(function (result) {
                    res.json(result)
                }).error(function (err) {
                    res.json(err)
                })
        })
}
exports.insert = function (req, res) {
    var r = req.r;
    var valid = req.ajv.validate('exporter.exporter', req.body);
    var result = { result: false, message: null, id: null };
    if (valid) {
        if (req.body.id == null) {
            r.db('external').table('exporter').getAll(req.body.lic_type_id, { index: 'lic_type_id' }).max('exporter_no').getField('exporter_no').add(1)
                .run()
                .then(function (response) {
                    if (response > 0) {
                        req.body.exporter_no = response;
                        req.body.exporter_date_approve = req.body.exporter_date_approve;
                        req.body = Object.assign(req.body, {
                            creater: 'admin',
                            date_created: new Date().inTimezone('+07')
                            // updater: 'admin',
                            // date_updated: new Date().toISOString()
                        });
                        r.db('external').table('exporter')
                            .insert(req.body)
                            .run()
                            .then(function (response) {
                                result.message = response;
                                if (response.errors == 0) {
                                    result.result = true;
                                    result.id = response.generated_keys;
                                }
                                res.json(result);
                            })
                            .error(function (err) {
                                result.message = err;
                                res.json(result);
                            })
                    }
                })
        } else {
            result.message = 'field "id" must do not have data';
            res.json(result);
        }
    } else {
        result.message = req.ajv.errorsText()
        res.json(result);
    }
}
exports.update = function (req, res) {
    var r = req.r;
    // var valid = req.ajv.validate('exporter.exporter', req.body);
    var result = { result: false, message: null, id: null };
    // if (valid) {
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        req.body = Object.assign(req.body, { date_updated: r.now().inTimezone('+07'), updater: 'admin' });
        r.db('external').table('exporter').get(req.body.id)
            .update(req.body, { returnChanges: true })
            .run()
            .then(function (response) {
                result.message = response;
                if (response.errors == 0) {
                    result.result = true;
                    var history = {
                        tb_name: 'exporter',
                        action: "update",
                        id_value: req.body.id,
                        old_value: null,
                        new_value: req.body,
                        date_created: r.now().inTimezone('+07'),
                        actor: 'admin'
                    };
                    if (response.changes != [] && response.unchanged != 1 || response.replaced == 1) {
                        // console.log(history.old_value);
                        history.old_value = response.changes[0].old_val;
                        //console.log(history.old_value);
                    }

                    r.db('external').table('history').insert(history).run().then()
                }
                res.json(result);
            })
            .error(function (err) {
                result.message = err;
                res.json(result);
            })
    } else {
        result.message = 'require field id';
        res.json(result);
    }
    // } else {
    //     result.message = req.ajv.errorsText()
    //     res.json(result);
    // }
}
exports.delete = function (req, res) {
    var r = req.r;
    var result = { result: false, message: null, id: null };
    if (req.params.id != '' || req.params.id != null) {
        // result.id = req.params.id;
        r.db('external').table('exporter').get(req.params.id)
            .merge(function (m) {
                return r.db('external').table('draft').get(m('draft_id')).delete()
            })
            .do(function (d) {
                return r.db('external').table('exporter').get(req.params.id).delete()
            })
            .run()
            .then(function (response) {
                res.json(response);
                // result.message = response;
                // if (response.errors == 0) {
                //     result.result = true;
                //     var history = {
                //         tb_name: 'exporter',
                //         action: "delete",
                //         id_value: req.params.id,
                //         old_value: response.changes[0].old_val,
                //         new_value: null,
                //         date_created: r.now().inTimezone('+07'),
                //         actor: 'admin'
                //     }
                //     r.db('external').table('history').insert(history).run().then()
                // }
                // res.json(response);
            })
            .error(function (err) {
                // result.message = err;
                res.json(err);
            })
    } else {
        result.message = 'require field id';
        res.json(result);
    }
}
exports.updateDate = function (req, res) {
    var result = { result: false, message: null, id: null };
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        req.body.date_approve = r.now().inTimezone('+07')
        req.body.date_load = r.now().inTimezone('+07')
        req.body = Object.assign(req.body,
            {
                date_expire: r.time(req.body.date_load.year().add(1),
                    req.body.date_load.month(),
                    req.body.date_load.day(),
                    "+07:00"
                ).inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin',
                expire_status: false
            });
        r.db('external').table('exporter').get(req.body.id)
            .update(req.body)
            .do(function () {
                return r.db('external').table('draft').get(req.body.draft_id)
                    .update({
                        draft_status: 'sign',
                        date_updated: r.now().inTimezone('+07'),
                        updater: 'admin'
                    })
            })
            .run()
            .then(function (response) {
                res.json(result);
            })
            .error(function (err) {
                result.message = err;
                res.json(result);
            })
    } else {
        result.message = 'require field id';
        res.json(result);
    }
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

function split(data) {
    return data.split(',')
}
