var company = require('../global/company');
exports.list = function (req, res) {
    r.table('draft').getAll(false, { index: 'approve_status' })
        .without('remark')
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.getId = function (req, res) {
    r.table('draft').get(req.query.id)
        .run()
        .then(function (data) {
            res.json(data);
        })
}
exports.getInsert = function (req, res) {
    company.getCompany([req.query.company_taxno], function (companyData) {
        if (companyData.length > 0 && companyData[0].hasOwnProperty('company_name_th')) {
            r.expr({ company: companyData[0], company_taxno: req.query.company_taxno })
                .merge({
                    lic_type: r.table('license_type').filter(function (f) {
                        return r.table('draft').getAll([req.query.company_taxno, 'sign', false], [req.query.company_taxno, 'change', false], { index: 'taxnoDraftStatusCloseStatus' })
                            .getField('lic_type_id')
                            .distinct().contains(f('id')).eq(false)
                    }).coerceTo('array')
                })
                .run()
                .then(function (data) {
                    res.json(data)
                })
        } else {
            res.json({});
        }
    })
}
exports.postInsert = function (req, res) {
    if (req.body.hasOwnProperty('company')) {
        var valid = req.ajv.validate('draft', req.body);
        if (valid) {
            var draftSign = (
                req.body.lic_type_id != "BORDER"
                    ? r.table('draft').getAll(['NORMAL', 'sign'], ['PACKAGE', 'sign'], { index: 'licTypeIdAndDraftStatus' })
                    : r.table('draft').getAll(['BORDER', 'sign'], { index: 'licTypeIdAndDraftStatus' })
            );
            var exporterNo = r.branch(
                draftSign.count().eq(0), 1, draftSign.max('exporter_no')('exporter_no').add(1)
            );
            var obj = Object.assign(req.body, {
                date_created: r.now().inTimezone('+07'),
                date_updated: r.now().inTimezone('+07'),
                // date_pkk: (req.body.date_pkk != '' ? r.ISO8601(req.body.date_pkk) : ''),
                creater: 'admin',
                updater: 'admin',
                doc_status: (req.body.lic_type_id != "BORDER" ? null : true),
                approve_status: (req.body.lic_type_id != "BORDER" ? false : true),
                draft_status: 'sign',
                exporter_no: exporterNo,
                remark: []
            });
            r.table('draft').insert(obj)
                .run()
                .then(function (data) {
                    insertDraftIdDoc(data.generated_keys[0], function () {
                        if (req.body.lic_type_id == "BORDER") {
                            res.json(insertExporter(data.generated_keys[0]));
                        } else {
                            res.json(data)
                        }
                    });


                })
        } else {
            res.json(req.ajv.errorsText());
        }
    } else {
        res.json('error: data want {company} object');
    }
}
exports.putInsert = function (req, res) {
    if (typeof req.body.id !== 'undefined') {
        r.branch(r.table('draft').get(req.body.id).eq(null),
            { error: 'This "id" is null.' },
            r.table('draft').get(req.body.id).update(function (u) {
                return r.expr(req.body)
                    .merge(function (m) {
                        return {
                            remark: r.branch(r.expr(req.body).hasFields('remark'),
                                m('remark').merge(function (m2) {
                                    return {
                                        date: r.branch(m2.hasFields('date'),
                                            r.ISO8601(m2('date')).inTimezone('+07'),
                                            r.now().inTimezone('+07')
                                        )
                                    }
                                }).orderBy('date'),
                                []
                            ),
                            date_updated: r.now().inTimezone('+07'),
                            updater: 'admin'
                        }
                    })
            })
        )
            .run()
            .then(function (data) {
                if (typeof req.body.approve_status !== 'undefined' && req.body.approve_status === true && !data.hasOwnProperty('error'))
                    res.json(insertExporter(req.body.id));
                else
                    res.json(data);
            })
    } else {
        res.json('error: "id" is empty!');
    }
}
function insertExporter(id) {
    r.table('exporter').insert(
        r.table('draft').get(id).merge(function (m) {
            var dateNow = r.now().inTimezone('+07');
            return {
                draft_id: m('id'),
                date_approve: dateNow.date(),
                date_load: dateNow.date(),
                date_expire: r.branch(
                    m('lic_type_id').eq('BORDER'),
                    r.ISO8601('9999-12-31T00:00:00+07:00'),
                    r.time(dateNow.year().add(1), dateNow.month(), dateNow.day(), '+07:00')
                ),
                export_status: true,
                date_created: dateNow,
                date_updated: dateNow,
                close_status: false,
                creater: 'admin',
                updater: 'admin'
            }
        }).without('id', 'approve_status', 'doc_status')
    )
        .run()
        .then(function (data) {
            return data
        })
}
exports.getRenew = function (req, res) {
    company.getCompany([req.query.company_taxno], function (companyData) {
        if (companyData.length > 0 && companyData[0].hasOwnProperty('company_name_th')) {
            r.expr({ company: companyData[0], company_taxno: req.query.company_taxno })
                .merge({
                    lic_type: r.table('exporter')
                        .getAll([req.query.company_taxno, false, false], { index: 'taxNoAndExportStatusAndCloseStatus' })
                        .merge(function (m) {
                            return {
                                lic_type: m('lic_type').merge(function (m2) {
                                    return { exporter_id: m('id') }
                                })
                            }
                        })
                        .getField('lic_type')
                        .coerceTo('array')
                })
                .run()
                .then(function (data) {
                    res.json(data)
                })
        } else {
            res.json({});
        }
    })
}
exports.putRenew = function (req, res) {
    var lic_type = req.body.lic_type;
    var exporter_id = lic_type.exporter_id;
    var company_taxno = req.body.company_taxno;
    if (typeof exporter_id !== 'undefined') {
        var getExporter = r.table('exporter').get(exporter_id);
        r.branch(getExporter.eq(null),
            { error: 'This { id : ' + exporter_id + ' } is null.' },
            getExporter.update({
                close_status: true,
                export_status: false,
                date_updated: r.now().inTimezone('+07'),
                updater: 'admin'
            })
        )
            .run()
            .then(function (data) {
                if (data.hasOwnProperty('error')) {
                    res.json(data.error);
                } else {
                    company.getCompany([company_taxno], function (companyData) {
                        if (companyData.length > 0 && companyData[0].hasOwnProperty('company_name_th')) {
                            var draftInsert = r.expr({ company: companyData[0], company_taxno: company_taxno })
                                .merge({
                                    date_created: r.now().inTimezone('+07'),
                                    date_updated: r.now().inTimezone('+07'),
                                    creater: 'admin',
                                    updater: 'admin',
                                    lic_type: r.table('license_type').get(lic_type.id),
                                    lic_type_id: lic_type.id,
                                    draft_status: 'renew',
                                    doc_status: null,
                                    approve_status: false,
                                    exporter_no: getExporter.getField('exporter_no'),
                                    remark: []
                                });
                            r.table('draft').insert(draftInsert)
                                .run()
                                .then(function (data) {
                                    insertDraftIdDoc(data.generated_keys[0], function () {
                                        res.json(data)
                                    });
                                })
                        } else {
                            res.json({});
                        }
                    })
                }
            })
    } else {
        res.json('error: "exporter_id" is empty!');
    }
}
exports.getChange = function (req, res) {
    var company_taxno = req.query.company_taxno;
    var exporterPack = r.table('exporter').getAll([company_taxno, 'PACKAGE', true], { index: 'taxNoLicIdExportStatus' });
    var draftNormal = r.table('draft').getAll([company_taxno, 'NORMAL'], { index: 'taxNoLicId' })
    var checkDraft = r.branch(
        draftNormal.count().gt(0),
        { error: "มีการสมัครหรือเปลี่ยนประเภทเป็นทั่วไปแล้ว" },
        exporterPack(0)
    )
    r.branch(
        exporterPack.count().eq(0),
        { error: "ยังไม่ได้เป็นผู้ส่งออกประเภทบรรจุภัณฑ์หรือหีบห่อ" },
        checkDraft
    )
        .run()
        .then(function (data) {
            res.json(data)
        })
}
exports.putChange = function (req, res) {
    var companyTaxno = req.body.company_taxno;
    var exporter = r.table('exporter').get(req.body.id);
    r.branch(
        exporter.eq(null), "ไม่พบข้อมูลกรุณาติดต่อเจ้าหน้าที่ {id:null}", "ok"
    ).run()
        .then(function (data) {
            if (data == "ok") {
                company.getCompany([companyTaxno], function (companyData) {
                    if (companyData.length > 0 && companyData[0].hasOwnProperty('company_name_th')) {
                        var draftInsert = r.expr({ company: companyData[0], company_taxno: companyTaxno })
                            .merge({
                                date_created: r.now().inTimezone('+07'),
                                date_updated: r.now().inTimezone('+07'),
                                creater: 'admin',
                                updater: 'admin',
                                lic_type: r.table('license_type').get('NORMAL'),
                                lic_type_id: 'NORMAL',
                                draft_status: 'change',
                                doc_status: null,
                                approve_status: false,
                                exporter_no: exporter('exporter_no'),
                                remark: req.body.remark
                            });
                        exporter.update({
                            close_status: true,
                            export_status: false,
                            date_updated: r.now().inTimezone('+07'),
                            updater: 'admin'
                        }).do(function (d) {
                            return r.table('draft').insert(draftInsert)
                        })
                            .run()
                            .then(function (data) {
                                insertDraftIdDoc(data.generated_keys[0], function () {
                                    res.json(data)
                                });
                            })
                    } else {
                        res.json("ไม่มีข้อมูลบริษัทกรุณาติดต่อเจ้าหน้าที่ {company_taxno:null}");
                    }
                })
            } else {
                res.json(data);
            }
        })
}
function insertDraftIdDoc(draftId, callback) {
    r.table('draft').get(draftId)
        .do(function (d) {
            return r.table('doc_draft').getAll([d('company_taxno'), d('draft_status'), ''], { index: 'taxNoDraftStatusDraftId' })
                .update({ draft_id: d('id') })
        })
        .run()
        .then(function (data) {
            callback();
        })
}