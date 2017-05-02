import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function countryReducer(state = initialState, action) {
    switch (action.type) {
        case 'COUNTRY_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'COUNTRY_GET_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'CLEAR_DATA':
            return Object.assign({}, state, { data: {} });
        default:
            return state
    }
}
export function countryAction(store) {
    return [commonAction(),
    {
        COUNTRY_GET_DATA: function () {
            axios.get('./country')
                .then(function (response) {
                    // console.log(response.data);
                    store.dispatch({ type: 'COUNTRY_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        COUNTRY_GET_ID: function (id) {
            axios.get('./country/id/' + id)
                .then(function (response) {
                    store.dispatch({ type: 'COUNTRY_GET_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        COUNTRY_INSERT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการเพิ่มข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        let { continent_id, country_id, country_name_th, country_fullname_th, country_name_en, country_fullname_en } = data;
                        let newData = { continent_id, country_name_th, country_fullname_th, country_name_en, country_fullname_en };
                        newData.id = data.country_id
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.post('./country/insert', newData)
                            .then((response) => {
                                this.fire('toast', {
                                    status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                        this.COUNTRY_GET_DATA();
                                        this.CLEAR_DATA();
                                    }
                                });
                            })
                    }
                }
            })
        },
        COUNTRY_EDIT: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการแก้ไขข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        let { continent_id, country_id, country_name_th, country_fullname_th, country_name_en, country_fullname_en } = data;
                        let newData = { continent_id, country_name_th, country_fullname_th, country_name_en, country_fullname_en };
                        newData.id = data.country_id
                        this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                        axios.put('./country/update', newData)
                            .then((response) => {
                                this.fire('toast', {
                                    status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                        this.COUNTRY_GET_DATA();
                                        this.COUNTRY_GET_ID(newData.id);
                                    }
                                });
                            })
                    }
                }
            })
        },
        COUNTRY_DELETE: function (data) {
            this.fire('toast', {
                status: 'openDialog',
                text: 'ต้องการลบข้อมูลใช่หรือไม่ ?',
                confirmed: (result) => {
                    if (result == true) {
                        this.fire('toast', { status: 'load' });
                        axios.delete('./country/delete/id/' + data)
                            .then((response) => {
                                if (response.data.result == true) {
                                    this.fire('toast', {
                                        status: 'success', text: 'ลบข้อมูลสำเร็จ', callback: () => {
                                            this.COUNTRY_GET_DATA();
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