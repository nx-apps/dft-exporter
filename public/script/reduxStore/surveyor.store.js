import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function surveyorReducer(state = initialState, action) {
    switch (action.type) {
        case 'SURVEYOR_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'SURVEYOR_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function surveyorAction(store) {
    return [commonAction(),
    {
        SURVEYOR_GET_DATA: function () {
            axios.get('./surveyor')
                .then(function (response) {
                    store.dispatch({ type: 'SURVEYOR_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        SURVEYOR_GET_ID: function (id) {
            axios.get('./surveyor/id/' + id)
                .then(function (response) {
                    store.dispatch({ type: 'SURVEYOR_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        SURVEYOR_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        axios.get('./check/duplicate?table=surveyor&field=surveyor_name&value=' + data.surveyor_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.post('./surveyor/insert', data)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.SURVEYOR_GET_DATA();
                                                    this.CLEAR_DATA();
                                                }
                                            });
                                        })
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'หน่วยงานตรวจสอบสินค้านี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        SURVEYOR_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        let { surveyor_id, surveyor_name } = data;
                        let newData = { surveyor_name };
                        newData.id = data.surveyor_id;
                        axios.get('./check/duplicate?table=surveyor&field=surveyor_name&value=' + newData.surveyor_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.put('./surveyor/update', newData)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.SURVEYOR_GET_DATA();
                                                    this.SURVEYOR_GET_ID(newData.id);
                                                }
                                            });
                                        })
                                }
                                else {
                                    axios.get('./check/myowner?table=surveyor&id=' + newData.id + '&field=surveyor_name&value=' + newData.surveyor_name)
                                        .then((response) => {
                                            if (response.data == 1) {
                                                this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                                axios.put('./surveyor/update', newData)
                                                    .then((response) => {
                                                        this.fire('toast', {
                                                            status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                                this.SURVEYOR_GET_DATA();
                                                                this.SURVEYOR_GET_ID(newData.id);
                                                            }
                                                        });
                                                    })
                                            }
                                            else {
                                                this.fire('toast', {
                                                    status: 'connectError', text: 'หน่วยงานตรวจสอบสินค้านี้มีอยู่แล้ว',
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
        SURVEYOR_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./surveyor/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.SURVEYOR_GET_DATA();
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