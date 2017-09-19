import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    list_search: [],
    pages: [],
    data: {},
    // licType: [],
    docType: [],
    // files: []
}
export function exporterReducer(state = initialState, action) {
    switch (action.type) {
        case 'EXPORTER_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'EXPORTER_GET_DATA_SEARCH':
            return Object.assign({}, state, { list_search: action.payload });
        case 'EXPORTER_GET_PAGE':
            return Object.assign({}, state, { pages: action.payload });
        case 'EXPORTER_GET_DATA_ID':
            return Object.assign({}, state, { data: action.payload });
        // case 'EXPORTER_GET_LIC_TYPE':
        //     return Object.assign({}, state, { licType: action.payload });
        case 'EXPORTER_GET_DOC_TYPE':
            return Object.assign({}, state, { docType: action.payload });
        // case 'EXPORTER_GET_FILE_DELETE':
        //     return Object.assign({}, state, { files: action.payload });
        case 'EXPORTER_SEARCH':
            return Object.assign({}, state, { list: action.payload });
        case 'EXPORTER_CLEAR_LIST_SEARCH':
            return Object.assign({}, state, { list_search: action.payload });
        // -------------------------------------------------------
        default:
            return state
    }
}
export function exporterAction(store) {
    return [commonAction(),
    {
        EXPORTER_GET_DATA: function (page = 1) {
            // console.log(page);
            axios.get('./exporter?page=' + page + '&limit=100')
                .then(function (response) {
                    // response.data.data.map((item) => {
                    //     for (var key in item) {
                    //         if (item[key] === "") {
                    //             item[key] = '-';
                    //         }
                    //     }
                    //     return item.company_name = '(' + item.company.company_taxno + ') ' + item.company.company_name_th + ' ' + item.company.company_name_en;
                    // })
                    // console.log(response.data);
                    store.dispatch({ type: 'EXPORTER_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        EXPORTER_GET_DATA_SEARCH: function (data) {
            axios.get('./exporter/search?field=' + data.att_name + '&value=' + data.val)
                .then((response) => {
                    response.data.map((item) => {
                        return item.company_name = '(' + item.company.company_taxno + ') ' + item.company.company_name_th + ' ' + item.company.company_name_en;
                    })
                    store.dispatch({ type: 'EXPORTER_GET_DATA_SEARCH', payload: response.data })
                })
        },
        EXPORTER_GET_PAGE: function () {
            axios.get('./exporter/page?limit=100')
                .then((response) => {
                    var pages = [];
                    for (var i = 1; i <= response.data; i++) {
                        pages.push(i);
                    }
                    // console.log(pages);
                    store.dispatch({ type: 'EXPORTER_GET_PAGE', payload: pages })
                })
        },
        EXPORTER_GET_DATA_ID: function (url) {
            // console.log(company_taxno);
            axios.get('./exporter/get/?' + url)
                .then(function (response) {
                    store.dispatch({ type: 'EXPORTER_GET_DATA_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        // EXPORTER_GET_FILE_DELETE: function (id) {
        //     console.log(id);
        //     axios.get('./upload/list/' + id)
        //         .then(function (response) {
        //             // console.log(response.data);
        //             store.dispatch({ type: 'EXPORTER_GET_FILE_DELETE', payload: response.data })
        //         })
        //         .catch(function (error) {
        //             console.log(error);
        //         });
        // },
        // EXPORTER_GET_LIC_TYPE: function () {
        //     axios.get('./license_type')
        //         .then(function (response) {
        //             // console.log(response.data);
        //             store.dispatch({ type: 'EXPORTER_GET_LIC_TYPE', payload: response.data })
        //         })
        //         .catch(function (error) {
        //             console.log(error);
        //         })
        // },
        EXPORTER_GET_DOC_TYPE: function () {
            axios.get('./doctype')
                .then(function (response) {
                    store.dispatch({ type: 'EXPORTER_GET_DOC_TYPE', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        EXPORTER_SEARCH: function (val, page, type) {
            if (type !== 'report') {
                // console.log('search');
                var page = parseInt(page);
                this.fire('toast', { status: 'load' })
                axios.get('./exporter?page=' + page + '&limit=100&' + val)
                    .then(function (response) {
                        // response.data.map((item) => {
                        //     for (var key in item) {
                        //         if (item[key] === '') {
                        //             item[key] = '-';
                        //         }
                        //     }
                        //     return item.company_name = '(' + item.company_taxno + ') ' + item.company_name_th + ' ' + item.company_name_en;
                        // })
                        store.dispatch({ type: 'EXPORTER_SEARCH', payload: response.data })
                    });
                this.fire('toast', { status: 'success', text: 'ค้นหาข้อมูลสำเร็จ', callback: function () { } })
            } else {
                // console.log('report');
                axios.get('./exporter' + val)
                    .then(function (response) { });
            }
        },
        // new
        EXPORTER_UPDATE: (data) => {
            return axios.put('./exporter',data)
        },
        EXPORTER_CLOSE: (data) => {
            return axios.put('./exporter/close',data)
        },
        // old
        // EXPORTER_UPDATE: function (data) {
        //     if (data.lic_type_id === undefined) {
        //         // console.log('ตัวเดิม');
        //         this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //         axios.put('./exporter/update', data)
        //             .then((result) => {
        //                 this.fire('toast', {
        //                     status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                         this.EXPORTER_GET_DATA(1);
        //                         this.EXPORTER_GET_DATA_ID(data.id);
        //                     }
        //                 });
        //             })
        //     } else {
        //         // console.log('เปลี่ยน');
        //         this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //         axios.put('./draft/update', data)
        //             .then((result) => {
        //                 this.fire('toast', {
        //                     status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                         this.EXPORTER_GET_DATA(1);
        //                         this.EXPORTER_GET_DATA_ID(data.exporter_id);
        //                     }
        //                 });
        //             })
        //     }
        // },
        // EXPORTER_ACTIVE_RENEW: function (data, data2) {
        //     // console.log(data,date);
        //     this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //     axios.put('./draft/update', data)
        //         .then((result) => {
        //             axios.put('./exporter/update', data2)
        //                 .then((result2) => {
        //                     this.fire('toast', {
        //                         status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                             this.EXPORTER_GET_DATA(1);
        //                             this.EXPORTER_GET_DATA_ID(data2.id);
        //                         }
        //                     });
        //                 })
        //         })
        // },
        // EXPORTER_DELETE: function(id){
        //     this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //     axios.delete('./exporter/delete/id/'+id)
        //     .then((response) =>{
        //         this.fire('toast', {
        //             status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
        //                 this.EXPORTER_GET_DATA(1);
        //                 this.$$('panel-right').close();
        //             }
        //         });
        //     })
        // },
        EXPORTER_CLEAR_LIST_SEARCH: function () {
            store.dispatch({ type: 'EXPORTER_CLEAR_LIST_SEARCH', payload: [] });
        }
        //-------------------------------------
    }
    ]
}