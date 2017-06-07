exports.list = function (req, res) {
    var r = req.r;
    r.db('external').table('company')
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.listId = function (req, res) {
    var r = req.r;
    r.db('external').table('company').getAll(req.params.id, { index: 'company_taxno' })
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.insert = function (req, res) {
    var r = req.r;
    req.body = Object.assign(req.body, {
        creater: 'admin',
        date_created: r.now().inTimezone('+07')
    });
    r.db('external').table('company').insert(req.body)
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            result.message = err;
            res.json(result);
        })
}
exports.update = function (req, res) {
    var r = req.r;
    r.db('external').table('company').get(req.body.id).update(req.body)
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            result.message = err;
            res.json(result);
        })
}
exports.delete = function (req, res) {
    var r = req.r;
    r.db('external').table('company').get(req.params.id).delete()
        .run()
        .then(function (result) {
            res.json(result);
        })
        .error(function (err) {
            result.message = err;
            res.json(result);
        })
}
exports.toRethink = function (req, res) {
    var r = req.r;
    req.jdbc.query('mssql', `SELECT [company_taxno]
      ,[company_name_th]
      ,[company_name_en]
      ,[company_address_th]
      ,[company_address_en]
      ,[company_province_th]
      ,[company_province_en]
      ,[company_phone]
      ,[company_fax]
      ,convert(nvarchar(10),[company_date],121)+'T00:00:00+07:00' as company_date
      ,[username]
      ,convert(nvarchar(10),[create_date],121)+'T00:00:00+07:00' as create_date
      ,convert(nvarchar(10),[update_date],121)+'T00:00:00+07:00' as update_date
	  from company_info `, [],
        function (err, data) {

            r.db('external').table('company').insert(r.json(data).merge(function (m) {
                return {
                    company_date: r.ISO8601(m('company_date')),
                    create_date: r.ISO8601(m('create_date')),
                    update_date: r.ISO8601(m('update_date'))
                }
            }))
                .run()
                .then(function (result) {
                    res.json(result);
                })
        })
}