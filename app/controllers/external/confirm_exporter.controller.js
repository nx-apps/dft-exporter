exports.confirm = function (req, res) {
    var r = req._r;
    r.db('external_f3').table('confirm_exporter')
        .merge(function (m) {
            return {
                trader_date_approve: m('trader_date_approve').split('T')(0),
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
                )
            }
        })
        .eqJoin('type_lic_id', r.db('external_f3').table('type_license')).pluck({ right: 'type_lic_name' }, 'left').zip()
        .eqJoin("seller_id", r.db('external_f3').table("seller"))
        .pluck({ right: ["seller_address_en", "seller_address_th", "seller_agent", "seller_email", "seller_fax", "seller_name_en", "seller_name_th", "seller_phone"] }, 'left').zip()
        .orderBy('trader_no')
        .run()
        .then(function (result) {
            res.json(result)
        })
        .error(function (err) {
            res.json(err)
        })
}