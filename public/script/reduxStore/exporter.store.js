import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function exporterReducer(state = initialState, action) {
    switch (action.type) {
        case 'BANK_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'BANK_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function exporterAction(store) {
    return [commonAction(),
    {
        EXPORTER_GET_DATA: function () {
            axios.get('./external/exporter')
                .then(function (response) {
                    // response.data.map((item) => {
                    //     for (var key in item) {
                    //     if(item[key] === ""){
                    //         item[key] = '-';
                    //     }
                    //     }
                    //     return item.company_name = '('+item.company_taxno+ ') ' + item.company_name_th +' '+ item.company_name_en;
                    // })
                    console.log(response);
                    // this.exporters = response;
                    // this.exporter_id = response;
                    // store.dispatch({ type: 'BANK_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        BANK_GET_ID: function (id) {
            axios.get('./bank/id/'+id)
                .then(function (response) {
                    store.dispatch({ type: 'BANK_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        BANK_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        var newData = {
                            id: data.bank_id,
                            bank_name_th: data.bank_name_th,
                            bank_name_en: data.bank_name_en
                        }
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.post('./bank/insert', newData)
                            .then((response) => {
                                // console.log("success");
                                // console.log(response);
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                            this.BANK_GET_DATA();
                                            this.CLEAR_DATA();
                                        }
                                    });
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'ธนาคารนี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        BANK_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        var newData = {
                            id: data.bank_id,
                            bank_name_th: data.bank_name_th,
                            bank_name_en: data.bank_name_en
                        }
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.put('./bank/update', newData)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                            this.BANK_GET_DATA();
                                            this.BANK_GET_ID(newData.id);
                                        }
                                    });
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'ธนาคารนี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        BANK_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./bank/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.BANK_GET_DATA();
                                        }
                                    });
                                }
                            })
                    }
                }
            })
        },
        CLEAR_DATA: function () {
            store.dispatch({ type: 'CLEAR_DATA' })
        }
    }
    ]
}