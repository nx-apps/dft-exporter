import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function shiplineReducer(state = initialState, action) {
    switch (action.type) {
        case 'SHIPLINE_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'SHIPLINE_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function shiplineAction(store) {
    return [commonAction(),
    {
        SHIPLINE_GET_DATA: function () {
            axios.get('./shipline')
                .then(function (response) {
                    store.dispatch({ type: 'SHIPLINE_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        SHIPLINE_GET_ID: function (id) {
            axios.get('./shipline/id/' + id)
                .then(function (response) {
                    store.dispatch({ type: 'SHIPLINE_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        SHIPLINE_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        axios.get('./check/duplicate?table=shipline&field=shipline_name&value=' + data.shipline_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.post('./shipline/insert', data)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.SHIPLINE_GET_DATA();
                                                    this.CLEAR_DATA();
                                                }
                                            });
                                        })
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'สายเรือนี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        SHIPLINE_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        let { shipline_id, shipline_name, shipline_tel } = data;
                        let newData = { shipline_name, shipline_tel };
                        newData.id = data.shipline_id;
                        axios.get('./check/duplicate?table=shipline&field=shipline_name&value=' + newData.shipline_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.put('./shipline/update', newData)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.SHIPLINE_GET_DATA();
                                                    this.SHIPLINE_GET_ID(newData.id);
                                                }
                                            });
                                        })
                                }
                                else {
                                    axios.get('./check/myowner?table=shipline&id=' + newData.id + '&field=shipline_name&value=' + newData.shipline_name)
                                        .then((response) => {
                                            if (response.data == 1) {
                                                this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                                axios.put('./shipline/update', newData)
                                                    .then((response) => {
                                                        this.fire('toast', {
                                                            status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                                this.SHIPLINE_GET_DATA();
                                                                this.SHIPLINE_GET_ID(newData.id);
                                                            }
                                                        });
                                                    })
                                            }
                                            else {
                                                this.fire('toast', {
                                                    status: 'connectError', text: 'สายเรือนี้มีอยู่แล้ว',
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
        SHIPLINE_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./shipline/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.SHIPLINE_GET_DATA();
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