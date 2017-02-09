exports.confirm = function (req, res) {
    var r = req._r;
    // var q = {}
    // for (key in req.query) {

    //     if (req.query[key] == "true") {
    //         req.query[key] = true;
    //     } else if (req.query[key] == "false") {
    //         req.query[key] = false;
    //     } else if (req.query[key] == "null") {
    //         req.query[key] = null;
    //     }
    //     q[key] = req.query[key];
    // }
    r.db('external').table('confirm_exporter')
        .merge(function (m) {
            return {
                exporter_no_name: r.branch(
                    m.hasFields('exporter_no'),
                    r.branch(
                        m('exporter_no').lt(10)
                        , r.expr('ข.000')
                        , r.branch(
                            m('exporter_no').lt(100)
                            , r.expr('ข.00')
                            , r.branch(
                                m('exporter_no').lt(1000)
                                , r.expr('ข.0')
                                , r.expr('ข.')
                            )
                        )
                    ).add(m('exporter_no').coerceTo('string'))
                    , null
                ),
                approve_status_name: r.branch(m('approve_status').eq('request'), 'ตรวจสอบเอกสาร', m('approve_status').eq('process'), 'รออนุมัติ', m('approve_status').eq('approve'), 'อนุมัติ', 'รอส่งเอกสารใหม่')
            }
        })
        .eqJoin('type_lic_id', r.db('external').table('type_license')).pluck({ right: 'type_lic_name' }, 'left').zip()
        .eqJoin("seller_id", r.db('external').table("seller")).without({ right: 'id' }).zip()
        .merge({ date_created: r.row('date_created').split('T')(0) })
        .orderBy('exporter_no')
        // .filter(q)
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}
exports.insert = function (req, res) {
    var r = req._r;
    var valid = req._validator.validate('exporter.confirm_exporter', req.body);
    var result = { result: false, message: null, id: null };
    if (valid) {
        r.db('external').table('confirm_exporter').get(req.body.confirm_id).update({ approve_status: 'approve' })
            .run()
        req.body = Object.assign(req.body, {
            creater: 'admin',
            updater: 'admin',
            seller_id: req.body.seller_id,
            exporter_no: req.body.exporter_no,
            exporter_date_approve: new Date().toISOString()
        }),
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
    } else {
        result.message = req._validator.errorsText()
        res.json(result);
    }
}