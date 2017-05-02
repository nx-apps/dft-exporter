import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    seleted: {},
    data: {}
}
export function packageReducer(state = initialState, action) {
    switch (action.type) {
        case 'PACKAGE_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'PACKAGE_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function packageAction(store) {
    return [commonAction(),
    {
        PACKAGE_GET_DATA: function () {
            axios.get('./package')
                .then(function (response) {
                    store.dispatch({ type: 'PACKAGE_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        PACKAGE_GET_ID: function (id) {
            axios.get('./package/id/' + id)
                .then(function (response) {
                    store.dispatch({ type: 'PACKAGE_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        PACKAGE_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        var newData = {
                            id: data.package_id,
                            package_kg_per_bag: Number(data.package_kg_per_bag),
                            package_name_en: data.package_name_en,
                            package_name_th: data.package_name_th,
                            package_weight_bag: Number(data.package_weight_bag)
                        }
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.post('./package/insert', newData)
                            .then((response) => {
                                // console.log("success");
                                // console.log(response);
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                            this.PACKAGE_GET_DATA();
                                            this.CLEAR_DATA();
                                        }
                                    });
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'แพ็คเกจนี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        PACKAGE_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        var newData = {
                            id: data.package_id,
                            package_kg_per_bag: Number(data.package_kg_per_bag),
                            package_name_en: data.package_name_en,
                            package_name_th: data.package_name_th,
                            package_weight_bag: Number(data.package_weight_bag)
                        }
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.put('./package/update', newData)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                            this.PACKAGE_GET_DATA();
                                            this.PACKAGE_GET_ID(newData.id);
                                        }
                                    });
                                }
                                else {
                                    this.fire('toast', {
                                        status: 'connectError', text: 'แพ็คเกจนี้มีอยู่แล้ว',
                                        callback: function () {
                                        }
                                    })
                                }
                            })
                    }
                }
            })
        },
        PACKAGE_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./package/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.PACKAGE_GET_DATA();
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