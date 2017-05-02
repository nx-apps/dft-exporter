import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function harmonizeReducer(state = initialState, action) {
    switch (action.type) {
        case 'HARMONIZE_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'HARMONIZE_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function harmonizeAction(store) {
    return [commonAction(),
    {
        HARMONIZE_GET_DATA: function () {
            axios.get('./harmonize')
                .then(function (response) {
                    store.dispatch({ type: 'HARMONIZE_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        HARMONIZE_GET_ID: function (id) {
            axios.get('./harmonize/id/' + id)
                .then(function (response) {
                    store.dispatch({ type: 'HARMONIZE_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        HARMONIZE_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        var newData = {
                            id: data.type_rice_id,
                            type_rice_name_th: data.type_rice_name_th,
                            type_rice_name_en: data.type_rice_name_en,
                        }
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.post('./harmonize/insert', newData)
                            .then((response) => {
                                this.fire('toast', {
                                    status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                        this.HARMONIZE_GET_DATA();
                                        this.CLEAR_DATA();
                                    }
                                });
                            })
                    }
                }
            })
        },
        HARMONIZE_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        var newData = {
                            id: data.type_rice_id,
                            type_rice_name_th: data.type_rice_name_th,
                            type_rice_name_en: data.type_rice_name_en,
                        }
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.put('./harmonize/update', newData)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                            this.HARMONIZE_GET_DATA();
                                            this.HARMONIZE_GET_ID(newData.id);
                                        }
                                    });
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'ข้าวชนิดนี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        HARMONIZE_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./harmonize/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.HARMONIZE_GET_DATA();
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