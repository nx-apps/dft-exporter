import axios from '../axios'
const initialState = {
    list: [],
    list_search: [],
    company_count:0,
    pages: [],
    data: {}
}
export function companyReducer(state = initialState, action) {
    switch (action.type) {
        case 'COMPANY_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'COMPANY_GET_PAGE':
            return Object.assign({}, state, { pages: action.payload });
        case 'COMPANY_COUNT':
            return Object.assign({}, state, { company_count: action.payload });
        case 'COMPANY_GET_DATA_SEARCH':
            return Object.assign({}, state, { list_search: action.payload });
        case 'COMPANY_SEARCH':
            return Object.assign({}, state, { data: action.payload });
        case 'COMPANY_CLEAR_DATA':
            return Object.assign({}, state, { data: action.payload });
        case 'COMPANY_GET_TAXNO':
            return Object.assign({}, state, { data: action.payload });
        case 'COMPANY_CLEAR_LIST_SEARCH':
            return Object.assign({}, state, { list_search: action.payload });
        default:
            return state
    }
}
export function companyAction(store) {
    return 
    {
        COMPANY_GET_DATA: function (page) {
            if (page == 'COMPANY_GET_DATA') {
                page = 1;
            } else {
                page = parseInt(page);
            }
            this.fire('toast', { status: 'load', text: 'กำลังโหลดข้อมูล...' })
            axios.get('./external/company?page=' + page + '&limit=100')
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
        COMPANY_GET_PAGE: function () {
            axios.get('./external/company/page?limit=100')
                .then((response) => {
                    var pages = [];
                    for (var i = 1; i <= response.data; i++) {
                        pages.push(i);
                    }
                    // console.log(pages);
                    store.dispatch({ type: 'COMPANY_GET_PAGE', payload: pages })
                })
        },
        COMPANY_COUNT : function (){
           axios.get('./external/company/countCompany')
                .then((response) => {
                    // console.log(pages);
                    store.dispatch({ type: 'COMPANY_COUNT', payload: response.data })
                }) 
        },
        COMPANY_GET_DATA_SEARCH: function (data) {
            axios.get('./external/company/list_search?' + data.att_name + '=' + data.val + '&type=' + data.type)
                .then((response) => {
                    response.data.map((item) => {
                        return item.company_name = '(' + item.company_taxno + ') ' + item.company_name_th + ' ' + item.company_name_en;
                    })
                    console.log(response.data);
                    store.dispatch({ type: 'COMPANY_GET_DATA_SEARCH', payload: response.data })
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        COMPANY_SEARCH: function (id) {
            this.fire('toast', { status: 'load' });
            if (typeof id !== 'undefined') {
                if (typeof id.detail === 'undefined') {
                    axios.get('./external/company/id/' + id)
                        .then((response) => {
                            for (var key in response.data[0]) {
                                if (response.data[0][key] === '') {
                                    response.data[0][key] = "-";
                                }
                            }
                            this.fire('toast', {
                                status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                    store.dispatch({ type: 'COMPANY_SEARCH', payload: response.data[0] })
                                }
                            });
                        });
                } else {
                    axios.get('./external/company/id/' + id.detail)
                        .then((response) => {
                            for (var key in response.data[0]) {
                                if (response.data[0][key] === '') {
                                    response.data[0][key] = "-";
                                }
                            }
                            this.fire('toast', {
                                status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                    store.dispatch({ type: 'COMPANY_SEARCH', payload: response.data[0] })
                                }
                            });
                        })
                }
            }
        },
        COMPANY_INSERT: function (data) {
            axios.get('./external/check/duplicate?table=company&field=company_taxno&value=' + data.company_taxno)
                .then((response) => {
                    console.log(response.data);
                    if (response.data < 1) {
                        console.log('true');
                        // axios.get('./external/check/duplicate?table=company&field=company_name_th&value=' + data.company_name_th)
                        //     .then((response2) => {
                        //         if (response2.data < 1) {
                        //             axios.post('./external/company/insert', data)
                        //                 .then((response3) => {
                        //                     this.fire('toast', {
                        //                         status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                        //                             this.COMPANY_GET_DATA(1);
                        //                             this.COMPANY_CLEAR_DATA();
                        //                             this.COMPANY_GET_DATA_SEARCH();
                        //                         }
                        //                     });
                        //                 })
                        //         } else {
                        //             this.fire('toast', { status: 'connectError', text: 'ชื่อบริษัทนี้มีอยู่แล้ว', callback: () => { } })
                        //         }
                        //     })
                    } else {
                        console.log('false');
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
                                        this.COMPANY_GET_DATA(1);
                                        this.COMPANY_GET_DATA_SEARCH();
                                        this.$$('company-manage').clearData(data.company_taxno);
                                    }
                                });
                            })
                    } else {
                        axios.get('./external/check/duplicate?table=company&id=' + data.id + '&field=company_name_th&value=' + data.company_name_th)
                            .then((response2) => {
                                if (response2.data == 1) {
                                    axios.put('./external/company/update', data)
                                        .then((response3) => {
                                            // console.log(response3);
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.COMPANY_SEARCH(data.company_taxno);
                                                    this.COMPANY_GET_DATA(1);
                                                    this.$$('company-manage').clearData(data.company_taxno);
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
                            this.COMPANY_GET_DATA(1);
                            this._backPage();
                            this.COMPANY_GET_DATA_SEARCH();
                        }
                    });
                })
        },
        COMPANY_CLEAR_DATA: function () {
            store.dispatch({ type: 'COMPANY_CLEAR_DATA', payload: { company_directors: [] } })
        },
        COMPANY_CLEAR_LIST_SEARCH: function () {
            store.dispatch({ type: 'COMPANY_CLEAR_LIST_SEARCH', payload: [] })
        },
        COMPANY_GET_TAXNO: function (taxno) {
            if (typeof taxno !== 'undefined' && taxno !== '') {
                axios.get('./external/company/id/' + taxno)
                    .then((response) => {
                        var data = response.data[0];
                        if (typeof data.company_name_th !== 'undefined') {
                            for (var key in data) {
                                if (data[key] === '') {
                                    data[key] = "-";
                                }
                            }
                            store.dispatch({ type: 'COMPANY_GET_TAXNO', payload: data })
                        } else {
                            data.company_directors = [];
                            store.dispatch({ type: 'COMPANY_GET_TAXNO', payload: data })
                            this.fire('toast', { status: 'connectError', text: 'ไม่มีข้อมูล' });
                        }
                    })
            } else {
                this.fire('toast', { status: 'connectError', text: 'กรุณากรอกเลขประจำตัวผู้เสียภาษี' });
            }
        }
    }
    
}