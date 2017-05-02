import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    seleted: {},
    data: {}
}
export function notifypartyReducer(state = initialState, action) {
    switch (action.type) {
        case 'NOTIFY_PARTY_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'NOTIFY_PARTY_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function notifypartyAction(store) {
    return [commonAction(),
    {
        NOTIFY_PARTY_GET_DATA: function () {
            axios.get('./notify_party')
                .then(function (response) {
                    store.dispatch({ type: 'NOTIFY_PARTY_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        NOTIFY_PARTY_GET_ID: function (id) {
            axios.get('./notify_party/id/' + id)
                .then(function (response) {
                    store.dispatch({ type: 'NOTIFY_PARTY_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        NOTIFY_PARTY_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        axios.get('./check/duplicate?table=notify_party&field=notify_name&value=' + data.notify_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.post('./notify_party/insert', data)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.NOTIFY_PARTY_GET_DATA();
                                                    this.CLEAR_DATA();
                                                }
                                            });
                                        })
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'ที่อยู่ผู้รับสินค้านี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        NOTIFY_PARTY_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        let{notify_id,notify_name,notify_tel,notify_fax,notify_address,port_id,buyer_id} = data;
                        let newData = {notify_name,notify_tel,notify_fax,notify_address,port_id,buyer_id};
                        newData.id = data.notify_id;
                        axios.get('./check/duplicate?table=notify_party&field=notify_name&value=' + newData.notify_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.put('./notify_party/update', newData)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.NOTIFY_PARTY_GET_DATA();
                                                    this.NOTIFY_PARTY_GET_ID(newData.id);
                                                }
                                            });
                                        })
                                }
                                else {
                                    axios.get('./check/myowner?table=notify_party&id=' + newData.id + '&field=notify_name&value=' + newData.notify_name)
                                        .then((response) => {
                                            if (response.data == 1) {
                                                this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                                axios.put('./notify_party/update', newData)
                                                    .then((response) => {
                                                        this.fire('toast', {
                                                            status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                                this.NOTIFY_PARTY_GET_DATA();
                                                                this.NOTIFY_PARTY_GET_ID(newData.id);
                                                            }
                                                        });
                                                    })
                                            }
                                            else {
                                                this.fire('toast', {
                                                    status: 'connectError', text: 'ที่อยู่ผู้รับสินค้านี้มีอยู่แล้ว',
                                                    callback: function () {
                                                    }
                                                })
                                            }
                                        })
                                }
                            })
                    }
                }
            })
        },
        NOTIFY_PARTY_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./notify_party/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.NOTIFY_PARTY_GET_DATA();
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