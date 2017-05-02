import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    seleted:{},
    data: {}
}
export function incotermsReducer(state = initialState, action) {
    switch (action.type) {
        case 'INCOTERMS_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'INCOTERMS_GET_ID':
            return Object.assign({}, state, { seleted: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { seleted: {} });
        default:
            return state
    }
}
export function incotermsAction(store) {
    return [commonAction(),
    {
        INCOTERMS_GET_DATA: function () {
            axios.get('./incoterms')
                .then(function (response) {
                    store.dispatch({ type: 'INCOTERMS_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        INCOTERMS_GET_ID: function (id) {
            axios.get('./incoterms/id/'+id)
                .then(function (response) {
                // console.log(data);
                    store.dispatch({ type: 'INCOTERMS_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        INCOTERMS_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        var newData = {
                            id: data.inct_id,
                            inct_name: data.inct_name,
                        }
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.post('./incoterms/insert', newData)
                            .then((response) => {
                                // console.log("success");
                                // console.log(response);
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                            this.INCOTERMS_GET_DATA();
                                            this.CLEAR_DATA();
                                        }
                                    });
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'ข้อกำหนดส่งสินค้ามีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        INCOTERMS_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        var newData = {
                            id: data.inct_id,
                            inct_name: data.inct_name,
                        }
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.put('./incoterms/update', newData)
                            .then((response) => {
                                console.log(response);
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                            this.INCOTERMS_GET_DATA();
                                            this.INCOTERMS_GET_ID(newData.id);
                                        }
                                    });
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'ข้อกำหนดส่งสินค้ามีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        INCOTERMS_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./incoterms/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.INCOTERMS_GET_DATA();
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