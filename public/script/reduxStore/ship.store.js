import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function shipReducer(state = initialState, action) {
    switch (action.type) {
        case 'SHIP_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'SHIP_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function shipAction(store) {
    return [commonAction(),
    {
        SHIP_GET_DATA: function () {
            axios.get('./ship')
                .then(function (response) {
                    store.dispatch({ type: 'SHIP_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        SHIP_GET_ID: function (id) {
            axios.get('./ship/id/' + id)
                .then(function (response) {
                    store.dispatch({ type: 'SHIP_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        SHIP_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        axios.get('./check/duplicate?table=ship&field=ship_name&value=' + data.ship_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.post('./ship/insert', data)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.SHIP_GET_DATA();
                                                    this.CLEAR_DATA();
                                                }
                                            });
                                        })
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'ชื่อเรือนี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        SHIP_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        let { ship_id, ship_name, shipline_id } = data;
                        let newData = { ship_name, shipline_id };
                        newData.id = data.ship_id;
                        axios.get('./check/duplicate?table=ship&field=ship_name&value=' + newData.ship_name)
                            .then((response) => {
                                if (response.data == 0) {
                                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                    axios.put('./ship/update', newData)
                                        .then((response) => {
                                            this.fire('toast', {
                                                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                    this.SHIP_GET_DATA();
                                                    this.SHIP_GET_ID(newData.id);
                                                }
                                            });
                                        })
                                }
                                else {
                                    axios.get('./check/myowner?table=ship&id=' + newData.id + '&field=ship_name&value=' + newData.ship_name)
                                        .then((response) => {
                                            if (response.data == 1) {
                                                this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                                                axios.put('./ship/update', newData)
                                                    .then((response) => {
                                                        this.fire('toast', {
                                                            status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                                                this.SHIP_GET_DATA();
                                                                this.SHIP_GET_ID(newData.id);
                                                            }
                                                        });
                                                    })
                                            }
                                            else {
                                                this.fire('toast', {
                                                    status: 'connectError', text: 'ชื่อเรือนี้มีอยู่แล้ว',
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
        SHIP_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./ship/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.SHIP_GET_DATA();
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