import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {},
    dataRenew: {},
    dataChange: {},
    confirmType: {},
    draftById: {},
    draftChange:{}
}
export function confirmReducer(state = initialState, action) {
    switch (action.type) {
        case 'CONFIRM_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        // case 'CONFIRM_GET_ID_DATA':
        //     return Object.assign({}, state, { data: action.payload });
        case 'CONFIRM_SEARCH':
            return Object.assign({}, state, { data: action.payload });
        case 'CONFIRM_RENEW':
            return Object.assign({}, state, { dataRenew: action.payload });
        case 'CONFIRM_CHANGE':
            return Object.assign({}, state, { dataChange: action.payload });
        case 'CONFIRM_SEARCH_DRAFT':
            return Object.assign({}, state, { draftById: action.payload });
        case 'CONFIRM_CHANGE_DRAFT':
            return Object.assign({}, state, { draftChange: action.payload });
        case 'CONFIRM_TYPE':
            return Object.assign({}, state, { confirmType: action.payload });
        default:
            return state
    }
}
export function confirmAction(store) {
    return [commonAction(),
    {
        CONFIRM_GET_DATA: function () {
            axios.get('./draft/')
                .then(function (response) {
                    response.data.map((item) => {
                        for (var key in item) {
                            if (item[key] === "") {
                                item[key] = '-';
                            }
                        }
                    })
                    store.dispatch({ type: 'CONFIRM_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        CONFIRM_TYPE: function (data) {
            store.dispatch({ type: 'CONFIRM_TYPE', payload: { data } })
        },
        CONFIRM_SEARCH_RESET: function () {
            store.dispatch({ type: 'CONFIRM_SEARCH', payload: {} })
        },
        CONFIRM_RENEW: function (company_taxno) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/renew?company_taxno=' + company_taxno)
                .then((response) => {
                    // console.log(response.data)
                    if (response.data.hasOwnProperty('company_taxno')) {
                        this.fire('toast', {
                            status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                store.dispatch({ type: 'CONFIRM_RENEW', payload: response.data })
                            }
                        });
                    } else {
                        this.fire('toast', { status: 'connectError', text: 'ไม่มีข้อมูลในระบบ' })
                        store.dispatch({ type: 'CONFIRM_RENEW', payload: {} })
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        CONFIRM_CHANGE_DRAFT: function (company_taxno) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/change?company_taxno=' + company_taxno)
                .then((response) => {
                    // console.log(response.data)
                    if (response.data.hasOwnProperty('company_taxno')) {
                        this.fire('toast', {
                            status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                store.dispatch({ type: 'CONFIRM_CHANGE_DRAFT', payload: response.data })
                            }
                        });
                    } else {
                        this.fire('toast', { status: 'connectError', text: response.error })
                        store.dispatch({ type: 'CONFIRM_CHANGE_DRAFT', payload: {} })
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        // ใช้สำหรับยกเลิก ยืนยัน กับพวก  doc และ app
        CONFIRM_DOC_AND_APPROVE: function (draft) {
            // console.log(draft);
            return axios.put('./draft/insert', draft)
        },
        CONFIRM_CHANGE: function (company_taxno) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/insert?company_taxno=' + company_taxno)
                .then((response) => {
                    // console.log(response.data)
                    if (response.data.hasOwnProperty('company_taxno')) {
                        this.fire('toast', {
                            status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                store.dispatch({ type: 'CONFIRM_CHANGE', payload: response.data })
                            }
                        });
                    } else {
                        this.fire('toast', { status: 'connectError', text: 'ไม่มีข้อมูลในระบบ' })
                        store.dispatch({ type: 'CONFIRM_CHANGE', payload: {} })
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        CONFIRM_SEARCH_DRAFT: function (idDraft) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/get?id=' + idDraft)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                            store.dispatch({ type: 'CONFIRM_SEARCH', payload: response.data })
                        }
                    })
                    store.dispatch({ type: 'CONFIRM_SEARCH_DRAFT', payload: response.data })
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        CONFIRM_SEARCH: function (company_taxno) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/insert?company_taxno=' + company_taxno)
                .then((response) => {
                    // console.log(response.data)
                    if (response.data.hasOwnProperty('company_taxno')) {
                        this.fire('toast', {
                            status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                store.dispatch({ type: 'CONFIRM_SEARCH', payload: response.data })
                            }
                        })
                    } else {
                        this.fire('toast', { status: 'connectError', text: 'ไม่มีข้อมูลในระบบ' })
                        store.dispatch({ type: 'CONFIRM_SEARCH', payload: {} })
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        CONFIRM_REGISTER: function (company) {
            return axios.post('./draft/insert?company_taxno=' + company.company_taxno, company)
        },
        CONFIRM_RENEW_UPDATE: function (company) {
            // console.log(company);
            return axios.put('./draft/renew', company)
        },
        CONFIRM_CHANGE_DRAFT_UPDATE: function (company) {
            // console.log(company);
            return axios.put('./draft/change', company)
        },
        //-------------------------------------------
        
        // CONFIRM_ADMIN_REJECT: function (data) {
        //     // console.log(data);
        //     this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //     axios.put('./external/draft/update', data)
        //         .then((response) => {
        //             this.fire('toast', {
        //                 status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                     this.CONFIRM_GET_DATA();
        //                 }
        //             });
        //         });
        // },
        // CONFIRM_COMPANY_REJECT: function (data) {
        //     this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //     axios.put('./external/draft/update', data)
        //         .then((response) => {
        //             this.fire('toast', {
        //                 status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                     this.CONFIRM_GET_DATA();
        //                     this.CONFIRM_SEARCH(data.company_taxno);
        //                     // this.fire('back_page');
        //                     this.fire('clearData');
        //                 }
        //             });
        //         });
        // },
        // CONFIRM_ACCEPT_PASS: function (data) {
        //     this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //     axios.put('./external/draft/update', data)
        //         .then((response) => {
        //             this.fire('toast', {
        //                 status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                     this.CONFIRM_GET_DATA();
        //                     this._backPage();
        //                 }
        //             });
        //         });
        // },
        // CONFIRM_ADMIN_APPROVE: function (data) {
        //     if (data.draft_status == 'type') {
        //         let { id, exporter_id, lic_type_id } = data;
        //         let newData = { id, exporter_id, lic_type_id };
        //         this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //         axios.put('./external/draft/changetype', newData)
        //             .then((response) => {
        //                 this.fire('toast', {
        //                     status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                         this.CONFIRM_GET_DATA();
        //                         this._backPage();
        //                     }
        //                 });
        //             })
        //     } else {
        //         let { exporter_no, company_id, company_taxno, id, lic_type_id, approve_status, doc_status } = data;
        //         let newData = { exporter_no, company_id, company_taxno, lic_type_id };
        //         newData.draft_id = data.id;
        //         // newData.exporter_status = false;
        //         // newData.expire_status = false;
        //         // console.log(newData);
        //         this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //         axios.post('./external/draft/approve', newData)
        //             .then((response) => {
        //                 this.fire('toast', {
        //                     status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                         this.CONFIRM_GET_DATA();
        //                         this._backPage();
        //                     }
        //                 });
        //             })
        //     }
        // },
        // CONFIRM_ADMIN_EXTEND: function (data) {
        //     // console.log(data);
        //     this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //     axios.put('./external/exporter/update/date', data)
        //         .then((response) => {
        //             this.fire('toast', {
        //                 status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                     this.CONFIRM_GET_DATA();
        //                     this._backPage();
        //                 }
        //             });
        //         })
        //         .catch(function (err) {
        //             console.log(err);
        //         })
        // },
        // CONFIRM_OB_DATA: function (id) {
        //     return axios.get('./external/confirm_exporter/get/' + id)
        // },
        // CONFIRM_CHANGE_EXPORTER_NO: function (data) {
        //     axios.get('./external/check/duplicate?table=draft&field=exporter_no&value=' + data.exporter_no)
        //         .then((response) => {
        //             if (response.data == 0) {
        //                 this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //                 axios.put('./external/draft/update', data)
        //                     .then((response2) => {
        //                         this.fire('toast', {
        //                             status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                                 this.CONFIRM_GET_DATA();
        //                             }
        //                         });
        //                     })
        //             } else {
        //                 axios.get('./external/check/duplicate?table=draft&id=' + data.id + '&field=exporter_no&value=' + data.exporter_no)
        //                     .then((response2) => {
        //                         if (response2.data == 1) {
        //                             this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
        //                             axios.put('./external/draft/update', data)
        //                                 .then((response3) => {
        //                                     this.fire('toast', {
        //                                         status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
        //                                             this.CONFIRM_GET_DATA();
        //                                         }
        //                                     });
        //                                 })
        //                         } else {
        //                             this.fire('toast', {
        //                                 status: 'connectError', text: 'เลข ข. นี้มีอยู่แล้ว',
        //                                 callback: function () { }
        //                             })
        //                         }
        //                     })
        //             }
        //         })
        // }
    }
    ]
}