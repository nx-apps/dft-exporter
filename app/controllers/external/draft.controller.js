exports.list = function (req, res) {
    r.db('external').table('draft').getAll([true, false, 'sign'], [true, true, 'sign'],
        [true, true, 'type'], [true, true, 'extend'], { index: 'docAppDraftStatus' })
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no').eq(false), null,
                    m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                    m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                    r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                ),
                status_approve: r.branch(m.hasFields('date_approve'),
                    r.branch(m('draft_status').eq('sign'),
                        true,
                        false),
                    false)
            }
        })
        .merge({ date_created: r.row('date_created').toISO8601().split('T')(0) })
        .orderBy('exporter_no')
        .filter({ status_approve: false })
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.company_id = function (req, res) {
    var exporter_id = r.db('external').table('exporter')
        .getAll(req.params.company_id, { index: 'company_id' }).coerceTo('array').getField('id');
    r.db('external').table('draft').getAll(req.params.company_id, { index: 'company_id' })
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no').eq(false), null,
                    m('lic_type_id').eq('NORMAL'), r.expr('ข.').add(m('exporter_no').coerceTo('string')),
                    m('lic_type_id').eq('BORDER'), r.expr('ช.').add(m('exporter_no').coerceTo('string')),
                    r.expr('ห.').add(m('exporter_no').coerceTo('string'))
                ),
                doc_status_name: r.branch(m('doc_status').eq(true), 'ตรวจสอบเอกสาร',
                    'รอส่งเอกสารใหม่'),
                status_approve: r.branch(m.hasFields('date_approve'),
                    r.branch(m('draft_status').eq('sign'),
                        true,
                        false),
                    false),
                approve_status_name: r.branch(m('approve_status').eq(true), 'รออนุมัติ', 'ยังไม่อนุมัติ'),
                exporter_id: r.branch(exporter_id.eq([]), null, exporter_id(0))
            }
        })
        .merge(function (mm) {
            return {
                status_approve_name: r.branch(mm('status_approve').eq(true), 'อนุมัติแล้ว', 'รออนุมัติ')
            }
        })
        .run()
        .then(function (result) {
            if (result.length > 0) {
                res.json(result[0])
            } else {
                res.json(null)
            }

        })
        .error(function (err) {
            res.json(err)
        })
}
exports.insert = function (req, res) {
    var result = { result: false, message: null, id: null };
    var draft = r.db('external').table('draft').getAll(req.body.lic_type_id, { index: 'lic_type_id' });
    var maxno = r.branch(draft.count().eq(0),
        1,
        draft.max('exporter_no').getField('exporter_no').add(1)
    );
    var company = r.db('external').table('company').getAll(req.body.company_taxno, { index: 'company_taxno' }).without('date_created', 'date_updated', 'date_exported')(0);
    var lic_type = r.db('external').table('license_type').get(req.body.lic_type_id)
        .merge(function (m) {
            return {
                date_created: r.now().inTimezone('+07')
            }
        });
    r.expr(maxno)
        .run()
        .then(function (response) {
            // res.json(response)
            if (response > 0) {
                req.body.exporter_no = response;
                req.body.company = company;
                req.body.lic_type = lic_type;
                req.body = Object.assign(req.body, {
                    date_created: r.now().inTimezone('+07'),
                    creater: 'admin'
                })
                r.db('external').table('draft').insert(req.body)
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
}
exports.update = function (req, res) {
    var result = { result: false, message: null, id: null };
    if (req.body.id != '' && req.body.id != null && typeof req.body.id != 'undefined') {
        result.id = req.body.id;
        req.body = Object.assign(req.body, { date_updated: r.now().inTimezone('+07'), updater: 'admin' });
        r.db('external').table('draft')
            .get(req.body.id)
            .update(req.body, { returnChanges: true })
            .run()
            .then(function (response) {
                result.message = response;
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
exports.approve = function (req, res) {
    var valid = req.ajv.validate('exporter.exporter', req.body);
    // var result = { result: false, message: null, id: null };
    var company = r.db('external').table('company').getAll(req.body.company_taxno, { index: 'company_taxno' }).without('date_created', 'date_updated', 'date_exported')(0);
    var lic_type = r.db('external').table('license_type').get(req.body.lic_type_id).merge(function (m) {
        return {
            date_approve: r.now().inTimezone('+07')
        }
    });
    if (valid) {
        req.body.company = company;
        req.body.lic_type = lic_type;
        req.body.date_approve = r.now().inTimezone('+07');
        req.body.date_load = r.now().inTimezone('+07');
        req.body = Object.assign(req.body, {
            creater: 'admin',
            date_created: r.now().inTimezone('+07'),
            company_id: req.body.company_id,
            company_taxno: req.body.company_taxno,
            exporter_no: req.body.exporter_no,
            date_expire: r.time(req.body.date_load.year().add(1),
                req.body.date_load.month(),
                req.body.date_load.day(),
                "+07:00"
            ).inTimezone('+07')
            // exporter_date_approve: r.now().inTimezone('+07')
        });
        r.db('external').table('exporter').insert(req.body)
            .do(function () {
                return r.db('external').table('draft').get(req.body.draft_id).update({ date_approve: r.now().inTimezone('+07') })
            })
            .run()
            .then(function (response) {
                res.json(response);
            })
            .error(function (err) {
                // result.message = err;
                res.json(err);
            })
    } else {
        // result.message = req.ajv.errorsText()
        res.json(req.ajv.errorsText());
    }
}
exports.changetype = function (req, res) {
    var lic_type = r.db('external').table('license_type').get(req.body.lic_type_id)
        .merge(function (m) {
            return {
                date_updated: r.now().inTimezone('+07')
            }
        });
    r.db('external').table('draft').get(req.body.id)
        .update({
            draft_status: 'sign',
            lic_type: lic_type,
            date_updated: r.now().inTimezone('+07'),
            updater: 'admin'
        }, { nonAtomic: true })
        .do(function (d) {
            return r.db('external').table('exporter').get(req.body.exporter_id)
                .update({
                    lic_type_id: req.body.lic_type_id,
                    lic_type: lic_type,
                    date_updated: r.now().inTimezone('+07'),
                    updater: 'admin'
                }, { nonAtomic: true })
        })
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            res.json(err)
        })
}