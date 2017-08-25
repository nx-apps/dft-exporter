var soap = require('soap');
var async = require('async');

exports.getCompany = function (company_taxno, callback) { //['1234567890123',...,'xxxx']
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