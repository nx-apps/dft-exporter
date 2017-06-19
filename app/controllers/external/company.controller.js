exports.list = function (req, res) {
    var r = req.r;
    var page = parseInt(req.query.page) - 1;
    var limit = parseInt(req.query.limit);
    var skip = page * limit;

    r.db('external').table('company')
        .skip(skip)
        .limit(limit)
        .run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.page = function (req, res) {
    var limit = parseInt(req.query.limit);
    var page = parseInt(req.query.page);
    req.r.db('external').table('company').count()
        .run()
        .then(function (data) {
            var countPage = Math.ceil(data / limit);
            var txt = '<select id="mySelect" onchange="myFunction()">';
            for (var i = 1; i <= countPage; i++) {
                if (i == page) {
                    txt += '<option value="' + i + '" selected>' + i + '</option>';
                } else {
                    txt += '<option value="' + i + '">' + i + '</option>';
                }

            }
            txt += '</select>';

            txt += `
            <script>
            function myFunction(){
                var x = document.getElementById("mySelect").value;
                window.open('https://localhost:3000/api/external/company?page='+x+'&limit=100');
            }
            </script>
            `;

            // var halfPage = Math.round(countPage / 2);
            // var txt = '';
            // if (page < halfPage) {
            //     for (var i = (page + 1); i <= (page + 3); i++) {
            //         txt += '<a  href="?page=' + i + '&limit=100" api="external/company/list">p' + i + '</a> ';
            //     }
            //     txt += '........' + page + '..........';
            //     for (var i = (countPage - 2); i <= countPage; i++) {
            //         txt += '<a  href="?page=' + i + '&limit=100" api="external/company/list">p' + i + '</a> ';
            //     }
            // } else {
            //     for (var i = 1; i <= 3; i++) {
            //         txt += '<a  href="?page=' + i + '&limit=100" api="external/company/list">p' + i + '</a> ';
            //     }
            //     txt += '........' + page + '..........';
            //     for (var i = (page + 1); i <= (page + 3); i++) {
            //         if (i <= countPage)
            //             txt += '<a  href="?page=' + i + '&limit=100" api="external/company/list">p' + i + '</a> ';
            //     }
            // }

            res.send(txt);

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