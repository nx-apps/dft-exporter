import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function carrierReducer(state = initialState, action) {
    switch (action.type) {
        case 'CARRIER_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'CARRIER_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function carrierAction(store) {
    return [commonAction(),
    {
        CARRIER_GET_DATA: function () {
            axios.get('./carrier')
                .then(function (response) {
                    store.dispatch({ type: 'CARRIER_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        CARRIER_GET_ID: function (id) {
            axios.get('./carrier/id/' + id)
                .then(function (response) {
                    store.dispatch({ type: 'CARRIER_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        CARRIER_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        axios.get('./check/duplicate?table=carrier&field=carrier_name&value=' + data.carrier_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.post('./carrier/insert', data)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.CARRIER_GET_DATA();
                                                    this.CLEAR_DATA();
                                                }
                                            });
                                        })
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'ชื่อผู้ให้บริการเรือนี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        CARRIER_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        var newData = {
                            id: data.carrier_id,
                            carrier_name: data.carrier_name
                        }
                        axios.get('./check/duplicate?table=carrier&field=carrier_name&value=' + newData.carrier_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.put('./carrier/update', newData)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.CARRIER_GET_ID(newData.id);
                                                }
                                            });
                                        })
                                }
                                else {
                                    axios.get('./check/myowner?table=carrier&id=' + newData.id + '&field=carrier_name&value=' + newData.carrier_name)
                                        .then((response) => {
                                            if (response.data == 1) {
                                                this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                                axios.put('./carrier/update', newData)
                                                    .then((response) => {
                                                        this.fire('toast', {
                                                            status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                                this.CARRIER_GET_ID(newData.id);
                                                            }
                                                        });
                                                    })
                                            }
                                            else {
                                                this.fire('toast', {
                                                    status: 'connectError', text: 'ชื่อผู้ให้บริการเรือนี้มีอยู่แล้ว',
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
        CARRIER_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./carrier/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.CARRIER_GET_DATA();
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