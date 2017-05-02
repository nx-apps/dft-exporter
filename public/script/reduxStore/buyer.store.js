import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function buyerReducer(state = initialState, action) {
    switch (action.type) {
        case 'BUYER_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'BUYER_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function buyerAction(store) {
    return [commonAction(),
    {
        BUYER_GET_DATA: function () {
            axios.get('./buyer')
                .then(function (response) {
                    store.dispatch({ type: 'BUYER_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        BUYER_GET_ID: function (id) {
            axios.get('./buyer/id/'+id)
                .then(function (response) {
                    store.dispatch({ type: 'BUYER_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        BUYER_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        let {country_id,buyer_name,buyer_masks,buyer_email,buyer_fax,buyer_tel,buyer_address} = data;
                        let newData = {country_id,buyer_name,buyer_masks,buyer_email,buyer_fax,buyer_tel,buyer_address};
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.post('./buyer/insert', newData)
                            .then((response) => {
                                // console.log("success");
                                // console.log(response);
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                            this.BUYER_GET_DATA();
                                            this.CLEAR_DATA();
                                        }
                                    });
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'ผู้ซื้ิอนี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        BUYER_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        let {country_id,buyer_name,buyer_masks,buyer_email,buyer_fax,buyer_tel,buyer_address,buyer_id} = data;
                        let newData = {country_id,buyer_name,buyer_masks,buyer_email,buyer_fax,buyer_tel,buyer_address};
                        newData.id = data.buyer_id
                        console.log(newData);
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.put('./buyer/update', newData)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                            this.BUYER_GET_DATA();
                                            this.BUYER_GET_ID(newData.id);
                                            this.$$('nylon-panel-right').close();
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
        BUYER_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./buyer/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.BUYER_GET_DATA();
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