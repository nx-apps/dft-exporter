import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function companyReducer(state = initialState, action) {
    switch (action.type) {
        case 'COMPANY_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'COMPANY_SEARCH':
            return Object.assign({}, state, { data: action.payload });
        case 'COMPANY_CLEAR_DATA':
            return Object.assign({}, state, { data: action.payload });
        default:
            return state
    }
}
export function companyAction(store) {
    return [commonAction(),
    {
        COMPANY_GET_DATA: function () {
            this.fire('toast', { status: 'load', text: 'กำลังโหลดข้อมูล...' })
            axios.get('./external/company')
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                            response.data.map((item) => {
                                for (var key in item) {
                                    if (item[key] === "") {
                                        item[key] = '-';
                                    }
                                }
                                return item.company_name = '(' + item.company_taxno + ') ' + item.company_name_th + ' ' + item.company_name_en;
                            })
                            // console.log(response.data);
                            store.dispatch({ type: 'COMPANY_GET_DATA', payload: response.data })
                        }
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        COMPANY_SEARCH: function (id) {
            if (typeof id !== 'undefined') {
                if (typeof id.detail === 'undefined') {
                    axios.get('./external/company/' + id)
                        .then((response) => {
                            for (var key in response[0]) {
                                if (response[0][key] === '') {
                                    response[0][key] = "-";
                                }
                            }
                            store.dispatch({ type: 'COMPANY_SEARCH', payload: response.data[0] })
                        });
                } else {
                    axios.get('./external/company/' + id.detail)
                        .then((response) => {
                            for (var key in data[0]) {
                                if (data[0][key] === '') {
                                    data[0][key] = "-";
                                }
                            }
                            store.dispatch({ type: 'COMPANY_SEARCH', payload: response.data[0] })
                        })
                }
            }
        },
        COMPANY_INSERT: function (data) {
            axios.get('./external/check/duplicate?table=company&field=company_taxno&value=' + data.company_taxno)
                .then((response) => {
                    if (response.data < 1) {
                        axios.get('./external/check/duplicate?table=company&field=company_name_th&value=' + data.company_name_th)
                            .then((response2) => {
                                if (response2.data < 1) {
                                    axios.post('./external/company/insert', data)
                                        .then((response3) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.COMPANY_GET_DATA();
                                                    this.COMPANY_CLEAR_DATA();
                                                }
                                            });
                                        })
                                } else {
                                    this.fire('toast', { status: 'connectError', text: 'ชื่อบริษัทนี้มีอยู่แล้ว', callback: () => { } })
                                }
                            })
                    } else {
                        this.fire('toast', { status: 'connectError', text: 'เลขประจำตัวผู้เสียภาษีนี้มีอยู่แล้ว', callback: () => { } })
                    }
                })
        },
        COMPANY_UPDATE: function (data) {
            axios.get('./external/check/duplicate?table=company&field=company_name_th&value=' + data.company_name_th)
                .then((response) => {
                    if (response.data == 0) {
                        axios.put('./external/company/update', data)
                            .then((response2) => {
                                this.fire('toast', {
                                    status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                        this.COMPANY_SEARCH(data.company_taxno);
                                        this.COMPANY_GET_DATA();
                                    }
                                });
                            })
                    } else {
                        axios.get('./external/check/myowner?table=company&id=' + data.id + '&field=company_name_th&value=' + data.company_name_th)
                            .then((response2) => {
                                if (response2.data == 1) {
                                    axios.put('./external/company/update', data)
                                        .then((response3) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.COMPANY_SEARCH(data.company_taxno);
                                                    this.COMPANY_GET_DATA();
                                                }
                                            });
                                        })
                                } else {
                                    this.fire('toast', { status: 'connectError', text: 'ชื่อบริษัทนี้มีอยู่แล้ว', callback: () => { } })
                                }
                            })
                    }
                })
        },
        COMPANY_DELETE: function (id) {
            this.fire('toast', { status: 'load' });
            axios.delete('./external/company/delete/id/' + id)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                            this.COMPANY_GET_DATA();
                            this._backPage();
                        }
                    });
                })
        },
        COMPANY_CLEAR_DATA: function () {
            store.dispatch({ type: 'COMPANY_CLEAR_DATA', payload: { company_agent: [] } })
        }
    }
    ]
}