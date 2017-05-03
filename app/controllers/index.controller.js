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
    var mssql = req.jdbc;
    var re = req.r;
    mssql.query("mssql", `
        select
            company_taxno,max(approve_date) as approve_date
        from f3
        where tran_type='E'
        group by company_taxno
    `, [], function (eee, ddd) {
            var ddd = JSON.parse(ddd);
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
            }, 3000);
            // res.send("update company success!");
        })

}