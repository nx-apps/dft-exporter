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
    r.db('external_f3').table('confirm_exporter')
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
                approve_status_name: r.branch(m('approve_status').eq("request"), 'ตรวจสอบเอกสาร', m('approve_status').eq("process"), 'รออนุมัติ', 'รอส่งเอกสารใหม่')
            }
        })
        .eqJoin('type_lic_id', r.db('external_f3').table('type_license')).pluck({ right: 'type_lic_name' }, 'left').zip()
        .eqJoin("seller_id", r.db('external_f3').table("seller")).without('id').zip()
        .merge({date_create:r.row('date_create').split('T')(0)})
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
    r.db('external_f3').table('confirm_exporter')
    .run()
    .then(function(result){
        res.json(result);
    })
    .error(function(err){
        res.json(err);
    })
}