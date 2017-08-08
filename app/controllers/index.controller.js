exports.index = function (req, res) {
    res.sendfile('./public/index.html');
}
exports.db = function (req, res) {
    req.logger.info("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    req.jdbc.query("mysql", "SELECT *  FROM  vet_ages", [], function (err, data) {
        console.log(data);
    });



    var u = {
        id: 1333
    };

    if (!req.user) {
        var user = {
            id: 1234,
            name: "somchit",
            email: "somchit.c@nexts-corp.com"
        };

        req.login(user, function (err) {

        });


    } else {
        console.log('is loged');
    }

    console.log(req.ajv);
    var valid = req.ajv.validate('user', u);
    if (!valid) console.log(req.ajv.errorsText());

    req.r.table('session').coerceTo('array').run().then(function (result) {
        console.log(result);
        res.json(result);

    });



}
exports.render = function (req, res) {
    console.log(req.user);
    res.render('index', {
        'title': "Hello",
        'message': "somchit",
        'uname': "somchit@gm.com"
    });
}

exports.report = function (req, res) {
    //var iReport=req._jvm.import("nylon.report.iReport");
    var datas = [
        {
            name: "somchit",
            surname: "chanudom",
            address: "5/424",
            subject: [{
                name: "test",
                title: "xxxx"
            }],
            exports: [
                "a", "b", "c"
            ]
        },
        {
            name: "somchit",
            surname: "chanudom",
            address: "5/424",
            subject: [{
                name: "test",
                title: "xxxx"
            }]
            ,
            exports: [
                "a", "b", "c"
            ]
        }, {
            name: "somchit",
            surname: "chanudom",
            address: "5/424",
            subject: [{
                name: "test",
                title: "xxxx"
            }]
            ,
            exports: [
                "a", "b", "c"
            ]
        }
    ];
    // for(var i=0;i<1000;i++){
    //  datas[i]= {
    //    name:"somchit",
    //    surname:"chanudom",
    //     address:"5/424"
    // };
    //  }
    var parameters = {

        department: "it"
    };

    var type = req.param("type");
    console.log(type);
    res.ireport("report1.jasper", type, datas, parameters);






    //  var reportname=path.join(path.dirname(fs.realpathSync(__filename)), '../report/report1.jasper');
    // var rp=new iReport();
    // rp.export(reportname,"pdf",JSON.stringify(data),JSON.stringify(parameter),
    //   function(err,buff){
    //   res._responsePDF(buff);
    // var buffer= Buffer.from(buff, "hex");
    // var bufferStream = new stream.PassThrough();
    // bufferStream.end( buffer );
    // res.setHeader('Content-Length', buffer.length);
    //  res.setHeader('Content-Type', 'application/ms-word');
    //     res.setHeader('Content-Disposition', 'attachment; filename=quote.docx');
    // bufferStream.pipe(res);

    // }
    //);



}

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}
exports.sql = function (req, res) {
    var async = require('async');
    var mssql = req.jdbc;
    var re = req.r;
    var commands = [];
    var parameters = "";
    //_callback(1,2,3,4,5,)
    var _callback = function (...args) {
        var p1 = args[0];
        var out = {
            "deleted": p1('deleted'),
            "errors": p1('errors'),
            "inserted": p1('inserted'),
            "replaced": p1('replaced'),
            "skipped": p1('skipped'),
            "unchanged": p1('unchanged')
        };
        for (var i = 1; i < args.length; i++) {
            out.deleted = out.deleted.add(args[i]('deleted'));
            out.errors = out.errors.add(args[i]('errors'));
            out.inserted = out.inserted.add(args[i]('inserted'));
            out.replaced = out.replaced.add(args[i]('replaced'));
            out.skipped = out.skipped.add(args[i]('skipped'));
            out.unchanged = out.unchanged.add(args[i]('unchanged'));
        }
        return out;
    }


    mssql.query("mssql", `
        select
            company_taxno,left(convert(varchar,max(approve_date),120),10) as approve_date
        from f3
        where tran_type='E'
        group by company_taxno
    `, [], function (e, str_companys) {
            var companys = JSON.parse(str_companys);
            async.each(companys, function (company, next) {
                var date = r.ISO8601(company.approve_date + 'T00:00:00+07:00');
                var cmd = re.db('external').table('exporter').getAll(company.company_taxno, { index: 'company_taxno' })
                    .update({
                        date_load: date.inTimezone('+07:00'),
                        date_expire: r.time(date.year().add(1),
                            date.month(),
                            date.day(),
                            '+07:00').inTimezone('+07')
                    });

                // .run()
                // .then(function (data_com) {
                // var index = ddd.map(function (e) { return e.company_taxno; }).indexOf(data_com[0].company_taxno);
                //    if (data_com.length > 0) {
                //   var cmd = re.db('external').table('company_bak').get(data_com[0].id).update({
                //    date_exported: r.epochTime(company.approve_date / 1000).inTimezone('+07:00')
                //  })
                commands.push(cmd);
                if (parameters == "") {
                    parameters = "p" + company.company_taxno;
                } else {
                    parameters = parameters + ",p" + company.company_taxno;
                }
                //      }
                next();

                // })
            }, function (err) {

                global.callback = 0;
                eval("callback=function(" + parameters + "){return _callback.apply(this,arguments);};");
                commands.push(callback);
                re.do.apply(this, commands)
                    .run()
                    .then(function (data) {
                        res.json(data);
                    })
            })


            /* var ddd = JSON.parse(ddd);
             var a = [];
             var count = 0;
             for (var i = 0; i < ddd.length; i++) {
                 re.db('external').table('company_bak').getAll(ddd[i]['company_taxno'], { index: 'company_taxno' })
                     .run()
                     .then(function (data_com) {
                         if (data_com.length > 0) {
                             var index = ddd.map(function (e) { return e.company_taxno; }).indexOf(data_com[0].company_taxno);
 
                             a.push(
                                 re.db('external').table('company_bak').get(data_com[0].id).update({
                                     date_exported: r.epochTime(ddd[index]['approve_date'] / 1000).inTimezone('+07:00')
                                 })
                             );
                         }
 
                     })
             }
             setTimeout(function () {
                 // res.json(a);
                 re.do.apply(this, a)
                     .run()
                     .then(function (data) {
                         res.json(data);
                     })
             }, 3000);*/
            // res.send("update company success!");
        })

}
exports.date = function (req, res) {
    var d = req.body;
    d.date_register = r.ISO8601(d.date_register).inTimezone('+07');
    var re = req.r;
    // res.json(d);

    re.db('external_f3').table('test')
        // .insert(d)
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.importData = function (req, res) {

    req.jdbc.query('mssql', `
            select company_id as exporter_no,
                tax_id as company_taxno,
                company_name_th,
                company_name_en,
                address_en as company_address_en,
                address_th as company_address_th,
                isnull(province_en,'') +' '+zipCode as company_province_en,
                isnull(province_th,'') +' '+zipCode as company_province_th,
                tel_no as company_phone,
                fax_no as company_fax,
                email as company_email,
                convert(varchar(10),allow_date,120) as date_approve,
                convert(varchar(10),expire_date,120) as date_expire
            from Exporter_Companys
            where allow_id='ทั่วไป'
     `,
        [], function (err, data) {
            data = JSON.parse(data);
            // res.json(data);
            var dataSQL = r.expr(data)
                .filter(function (f) {
                    return (f('exporter_no').match('/').eq(null).and(f('exporter_no').match('ช').eq(null)))
                        .and(f('exporter_no').match('ข'))
                        .and(f('company_taxno').ne('3         ').and(f('company_taxno').ne('3')))
                });
            var dataRe = r.db('external').table('exporter').getField('company_taxno').coerceTo('array');

            var newdraft = r.expr(
                dataSQL.filter(function (f) {
                    return r.expr(dataRe).contains(f('company_taxno')).not()
                })
            )
                .map(function (m) {
                    var c = r.db('external').table('company').getAll(m('company_taxno'), { index: 'company_taxno' }).without('creater', 'updater', 'date_created', 'date_updated').coerceTo('array')(0);
                    return {
                        company: c,
                        approve_status: true,
                        doc_status: true,
                        draft_status: 'sign',
                        exporter_no: m('exporter_no'),
                        lic_type: {
                            "id": "NORMAL",
                            "lic_type_fullname": "อนุญาตให้ประกอบการค้าข้าวประเภทค้าข้าวส่งไปจำหน่ายต่างประเทศผู้ส่งออกทั่วไป",
                            "lic_type_name": "ทั่วไป"
                        },
                        lic_type_id: "NORMAL",
                        company_id: c('id'),
                        company_taxno: c('company_taxno'),
                        date_approve: r.ISO8601(m('date_approve').add('T00:00:00+07:00')),
                        date_expire: r.ISO8601(m('date_expire').add('T00:00:00+07:00')),
                        creater: 'admin',
                        updater: 'admin',
                        date_created: r.now().inTimezone('+07'),
                        date_updated: r.now().inTimezone('+07')
                    }
                });

            ////insert company
            //     var newcompany = r.expr(
            //     dataSQL.filter(function (f) {
            //         return r.expr(dataRe).contains(f('company_taxno')).not()
            //     })
            // )
            // .filter(function (f) {
            //     var c = r.db('external').table('company').getAll(f('company_taxno'), { index: 'company_taxno' }).coerceTo('array');
            //     return c.eq([])
            // })
            // .merge(function (m) {
            //     return {
            //         company_directors: [],
            //         company_date: r.ISO8601(m('date_approve').add('T00:00:00+07:00')),
            //         // company_date: m('date_approve'),
            //         creater: 'admin',
            //         updater: 'admin',
            //         date_created: r.now().inTimezone('+07'),
            //         date_updated: r.now().inTimezone('+07')
            //     }
            // }).without('date_approve', 'date_expire', 'company')
            // r.db('external').table('company').insert(newcompany)

            r.db('external').table('draft').insert(newdraft)
                .run().then(function (data) {
                    r.expr(data['generated_keys']).forEach(function (fe) {
                        return r.db('external').table('exporter').insert(
                            r.db('external').table('draft').get(fe)
                                .merge(function (m) {
                                    return {
                                        // date_expire: r.now().add(365 * 24 * 60 * 60).inTimezone('+07'),
                                        date_load: m('date_approve'),
                                        draft_id: m('id'),
                                        "expire_status": false,
                                        "exporter_status": false
                                    }
                                })
                                .without('id', 'approve_status')
                        )
                    }).run().then(function (data2) {
                        res.json(data2)
                    })
                })
        })
}