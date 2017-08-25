var soap = require('soap');
var async = require('async');
exports.list = function (req, res) {
    var r = req.r;
    var page = parseInt(req.query.page) - 1;
    var limit = parseInt(req.query.limit);
    var skip = page * limit;

    r.db('external').table('company').pluck('id', 'company_taxno', 'company_name_th', 'company_name_en', 'company_province_th')
        .orderBy('company_taxno')
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
exports.list_search = function (req, res) {
    var r = req.r;
    var table = r.db('external').table('company')
        .pluck('id', 'company_taxno', 'company_name_th', 'company_name_en', 'company_province_th')
        .orderBy('company_taxno');
    if (req.query.type == 'number') {
        table = table.filter(r.row('company_taxno').match(req.query.company_taxno));
    }
    if (req.query.type == 'char_th') {
        table = table.filter(r.row('company_name_th').match(req.query.company_name_th));
    }
    if (req.query.type == 'char_en') {
        table = table.filter(r.row('company_name_en').match(req.query.company_name_en));
    }
    table.run()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (err) {
            res.status(500).json(err);
        })
}
exports.page = function (req, res) {
    var limit = parseInt(req.query.limit);
    // var page = parseInt(req.query.page);
    req.r.db('external').table('company').count()
        .run()
        .then(function (data) {
            var countPage = Math.ceil(data / limit);
            res.json(countPage);

            //แบบสอง select แบบ dropdown

            // var txt = '<select id="mySelect" onchange="myFunction()">';
            // for (var i = 1; i <= countPage; i++) {
            //     if (i == page) {
            //         txt += '<option value="' + i + '" selected>' + i + '</option>';
            //     } else {
            //         txt += '<option value="' + i + '">' + i + '</option>';
            //     }

            // }
            // txt += '</select> / '+countPage + ' pages.';

            // txt += `
            // <script>
            // function myFunction(){
            //     var x = document.getElementById("mySelect").value;
            //     window.open('https://localhost:3000/api/external/company?page='+x+'&limit=100');
            // }
            // </script>
            // `;

            // แบบแรก 1,2,3....255,256,257

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

            // res.send(txt);

        })
        .catch(function (err) {
            res.json(err);
        })
}
exports.listId = function (req, res) {
    var id = [];
    id.push(req.params.id);
    getCompany(id, function (data) {
        var db = r.db('external').table('company');
        var company = db.getAll(req.params.id, { index: 'company_taxno' });
        if (typeof data[0].company_name_th === 'undefined') {
            company.run().then(function (datas) {
                if (datas.length > 0) {
                    res.json(datas);
                } else {
                    res.json(data);
                }
            })
        } else {
            // console.log(data[0].company_agent);
            // r.expr(company(0)('id')).run().then(function (dd) {
            //     res.json(dd)
            // })
            r.branch(company.count().eq(0),
                db.insert(data).do(function (d) {
                    return db.getAll(d('generated_keys')(0), { index: 'id' })
                }),
                db.get(company(0)('id')).update(data[0]).do(function (d) {
                    return db.getAll(company(0)('id'), { index: 'id' })
                })
            ).run().then(function (datas) {
                res.json(datas)
            })
        }
    })
    // var url = 'http://reg-users.dft.go.th/RegistrationService.asmx?WSDL';
    // var args = { CompanyTaxNo: req.params.id, BranchNo: 0 };
    // //0205545008860
    // soap.createClient(url, function (err, client) {
    //     client.GetCompanyProfile(args, function (err2, result) {
    //         if (result.GetCompanyProfileResult.CompanyAddress === null) {
    //             res.json([]);
    //         } else {
    //             var data = result.GetCompanyProfileResult;
    //             var address = data.CompanyAddress;
    //             var bkk = (address.ProvinceEN.toUpperCase() == "BANGKOK" ? true : false);
    //             var newdata = {
    //                 company_name_th: data.CompanyNameTH,
    //                 company_name_en: data.CompanyNameEN,
    //                 company_taxno: data.CompanyTaxno,
    //                 company_address_th: address.AddressNo
    //                 + (address.Moo == "" ? "" : " ม." + address.Moo)
    //                 + (address.BuildingTH == "" ? "" : " " + address.BuildingTH)
    //                 + (address.SoiTH == "" ? "" : " ซ." + address.SoiTH)
    //                 + (address.RoadTH == "" ? "" : " ถ." + address.RoadTH)
    //                 + (address.TumbolTH == "" ? "" : " " + (bkk ? "แขวง" : "ต.") + address.TumbolTH)
    //                 + (address.AmphurTH == "" ? "" : " " + (bkk ? "เขต" : "อ.") + address.AmphurTH),
    //                 company_address_en: address.AddressNo
    //                 + (address.Moo == "" ? "" : " Moo." + address.Moo)
    //                 + (address.BuildingEN == "" ? "" : " " + address.BuildingEN)
    //                 + (address.SoiEN == "" ? "" : " Soi." + address.SoiEN)
    //                 + (address.RoadEN == "" ? "" : " " + address.RoadEN + " Road,")
    //                 + (address.TumbolEN == "" ? "" : " " + address.TumbolEN + ",")
    //                 + (address.AmphurEN == "" ? "" : " " + address.AmphurEN),
    //                 company_province_th: address.ProvinceTH
    //                 + (address.Zipcode == "" ? "" : " " + address.Zipcode),
    //                 company_province_en: address.ProvinceEN
    //                 + (address.Zipcode == "" ? "" : " " + address.Zipcode),
    //                 company_fax: data.CompanyFaxNo,
    //                 company_phone: data.CompanyPhoneNo,
    //                 company_email: data.CompanyEmail,
    //                 company_date: r.ISO8601(data.JuristicRegDate.toISOString().replace(".000Z", "+07:00")).inTimezone('+07'),
    //                 directors: data.Directors
    //             };
    //             var db = r.db('external').table('company');
    //             var company = db.getAll(data.CompanyTaxno, { index: 'company_taxno' });
    //             r.branch(company.count().eq(0),
    //                 db.insert(newdata).do(function (d) {
    //                     return db.getAll(d('generated_keys')(0), { index: 'id' })
    //                 }),
    //                 db.get(company(0)('id')).update(newdata).do(function (d) {
    //                     return db.getAll(company(0)('id'), { index: 'id' })
    //                 })
    //             ).run().then(function (datas) {
    //                 res.json(datas)
    //             })
    //         }
    //     });
    // });
}
exports.insert = function (req, res) {
    console.log(111111);
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
    req.body = Object.assign(req.body, {
        updater: 'admin',
        date_updated: r.now().inTimezone('+07')
    });
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
exports.companyUpdate = function (req, res) {
    r.db('external').table('exporter').getField('company_taxno')
        .run()
        .then(function (taxnos) {
            var url = 'http://reg-users.dft.go.th/RegistrationService.asmx?WSDL';
            soap.createClient(url, function (err, client) {
                var msg = { error: [], updated: 0 };
                async.eachOfLimit(taxnos, 25, function (value, index, callback) {
                    var args = { CompanyTaxNo: value, BranchNo: 0 };
                    client.GetCompanyProfile(args, function (err2, result) {
                        if (result.GetCompanyProfileResult.CompanyAddress === null) {
                            msg.error.push(value);
                            callback();
                        } else {
                            var data = setDataCompany(result.GetCompanyProfileResult);
                            var company = r.db('external').table('test').getAll(data.company_taxno, { index: 'company_taxno' });
                            company(0).update({ company: data })
                                .run().then(function (datas) {
                                    // var keys = Object.keys(datas);
                                    // for (i = 0; i < keys.length; i++) {
                                    //     if (index == 0) {
                                    //         msg.success[keys[i]] = 0;
                                    //     }
                                    //     msg.success[keys[i]] += Number(datas[keys[i]]);
                                    // }
                                    msg.updated++;
                                    callback();

                                })
                        }
                    });
                }, function (err) {
                    if (err !== null) {
                        res.json(err);
                    } else {
                        res.json(msg);
                    }
                });
                //

                /*   client.GetCompanyProfile(args, function (err2, result) {
                       // if (result.GetCompanyProfileResult.CompanyAddress === null) {
                       //     msg.error.push(value);
                       //     callback();
                       // } else {
                       var data = setDataCompany(result.GetCompanyProfileResult);
                       r.expr(data).run().then(function (data) {
                           return res.json(data)
                       })
   
                       //     var db = r.db('external').table('test');
                       //     var company = db.getAll(data.CompanyTaxno, { index: 'company_taxno' });
                       //     company(0).update({ company: newdata })
                       //         .run().then(function (datas) {
                       //             msg.success.push(datas);
                       //             callback();
                       //         })
                       // }
                   }); */
            });

        })
}
exports.test = function (req, res) {
    //insert
    // getCompany(['0105553124599'], function (datas) {
    //     r.expr(datas)
    //         .forEach(function (fe) {
    //             return r.db('external').table('test').insert(fe)
    //         })
    //         .run()
    //         .then(function (datas) {
    //             res.json(datas);
    //         })
    // });
    //update
    // r.db('external').table('test').getField('company_taxno')
    //     .run()
    //     .then(function (datas) {
    //         getCompany(datas, function (datas) {
    //             r.expr(datas)
    //                 .forEach(function (fe) {
    //                     return r.db('external').table('test').getAll(fe('company_taxno'), { index: 'company_taxno' }).update(fe)
    //                 })
    //                 .run()
    //                 .then(function (datas) {
    //                     res.json(datas);
    //                 })
    //         });
    //     });
}
exports.countCompany = function (req, res) {
    r.db('external').table('company').count()
        .run()
        .then(function (datas) {
            res.json(datas);
        })
}
function setDataCompany(data) {
    var address = data.CompanyAddress;
    var bkk = (address.ProvinceEN.toUpperCase() == "BANGKOK" ? true : false);
    return {
        company_name_th: data.CompanyNameTH,
        company_name_en: data.CompanyNameEN,
        company_taxno: data.CompanyTaxno,
        company_address_th: address.AddressNo
        + (address.Moo == "" ? "" : " ม." + address.Moo)
        + (address.BuildingTH == "" ? "" : " " + address.BuildingTH)
        + (address.SoiTH == "" ? "" : " ซ." + address.SoiTH)
        + (address.RoadTH == "" ? "" : " ถ." + address.RoadTH)
        + (address.TumbolTH == "" ? "" : " " + (bkk ? "แขวง" : "ต.") + address.TumbolTH)
        + (address.AmphurTH == "" ? "" : " " + (bkk ? "เขต" : "อ.") + address.AmphurTH),
        company_address_en: address.AddressNo
        + (address.Moo == "" ? "" : " Moo." + address.Moo)
        + (address.BuildingEN == "" ? "" : " " + address.BuildingEN)
        + (address.SoiEN == "" ? "" : " Soi." + address.SoiEN)
        + (address.RoadEN == "" ? "" : " " + address.RoadEN + " Road,")
        + (address.TumbolEN == "" ? "" : " " + address.TumbolEN + ",")
        + (address.AmphurEN == "" ? "" : " " + address.AmphurEN),
        company_province_th: address.ProvinceTH
        + (address.Zipcode == "" ? "" : " " + address.Zipcode),
        company_province_en: address.ProvinceEN
        + (address.Zipcode == "" ? "" : " " + address.Zipcode),
        company_fax: data.CompanyFaxNo,
        company_phone: data.CompanyPhoneNo,
        company_email: data.CompanyEmail,
        company_date: data.JuristicRegDate.toISOString().replace(".000Z", "+07:00"),
        company_directors: data.Directors === null ? [] : data.Directors.Director
    };
}
function getCompany(company_taxno, callback) { //['1234567890123',...,'xxxx']
    var url = 'http://reg-users.dft.go.th/RegistrationService.asmx?WSDL';
    soap.createClient(url, function (err, client) {
        var datas = [];
        async.eachOfLimit(company_taxno, 25, function (value, index, callback) {
            var args = { CompanyTaxNo: value, BranchNo: 0 };
            client.GetCompanyProfile(args, function (err2, result) {
                var result = result.GetCompanyProfileResult;
                if (result.CompanyAddress === null) {
                    datas.push({ company_taxno: value });
                    callback();
                } else {
                    datas.push(setDataCompany(result));
                    callback();
                }
            });
        }, function (err) {
            callback(datas);
        });
    });
}

