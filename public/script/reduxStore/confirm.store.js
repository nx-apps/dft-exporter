import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function confirmReducer(state = initialState, action) {
    switch (action.type) {
        case 'CONFIRM_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'CONFIRM_SEARCH':
        return Object.assign({}, state, { data: action.payload });
        default:
            return state
    }
}
export function confirmAction(store) {
    return [commonAction(),
    {
        CONFIRM_GET_DATA: function () {
            axios.get('./external/confirm_exporter/list')
                .then(function (response) {
                    response.data.map((item) => {
                        for (var key in item) {
                            if (item[key] === "") {
                                item[key] = '-';
                            }
                        }
                        for (var i = 0; i < response.data.length; i++) {
                            response.data[i]['check'] = false;
                        }
                    })
                    // console.log(response.data);
                    store.dispatch({ type: 'CONFIRM_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        CONFIRM_SEARCH: function(id){
            axios.get('./external/company/id/'+id)
            .then((response) => {
                var data = response.data;
                if(data.length > 0){
                    axios.get('./external/confirm_exporter/list/'+ data[0].id)
                    .then((response2) => {
                        var data2 = response2.data;
                        if(data2.length === undefined){
                            for (var key in data2) {
                                if (data2[key] === '') {
                                    data2[key] = "-";
                                }
                            }
                            store.dispatch({type: 'CONFIRM_SEARCH', payload: data2})
                            // console.log('มี');
                        }else{
                            axios.get('./external/company/id/' + id)
                            .then((response3) => {
                                var data3 = response3.data;
                                for (var key in data3[0]) {
                                    if (data3[0][key] === '') {
                                        data3[0][key] = "-";
                                    }
                                }
                                let newData = { company: data3[0] };
                                newData.approve_status = 'register';
                                newData.approve_status_name = 'ยังไม่ลงทะเบียนผู้ส่งออก';
                                store.dispatch({type: 'CONFIRM_SEARCH', payload: newData })
                            });
                            // console.log('ไม่มี');
                        }
                    });
                }else{
                    this.fire('toast', { status: 'connectError', text: 'ไม่มีเลขประจำตัวผู้เสียภาษีในระบบ' })
                    store.dispatch({type: 'CONFIRM_SEARCH', payload: {}})
                }
            });
        },
        CONFIRM_REGISTER: function(data){
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.post('./external/confirm_exporter/register', data)
            .then((response) => {
                this.fire('toast',{
                    status: 'success', text: 'บันทึกสำเร็จ', callback: () =>{
                        this.CONFIRM_GET_DATA();
                        this.CONFIRM_SEARCH(data.company_taxno);
                        this.fire('back_page');
                        this.fire('clearData');
                    }
                });
            });
        },
        CONFIRM_COMPANY_REJECT: function(data){
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.put('./external/confirm_exporter/reject', data)
            .then((response) => {
                this.fire('toast', {
                    status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                        this.CONFIRM_GET_DATA();
                        this.CONFIRM_SEARCH(data.company_taxno);
                        this.fire('back_page');
                        this.fire('clearData');
                    }
                });
            });
        },
        CONFIRM_OB_DATA: function (id) {
            return axios.get('./external/confirm_exporter/get/' + id)
        },
        CONFIRM_ACCEPT_PASS: function(data){
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.put('./external/confirm_exporter/update', data)
            .then((response) => {
                this.fire('toast', {
                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                        this.CONFIRM_GET_DATA();
                        this._backPage();
                    }
                });
            });
        },
        CONFIRM_ADMIN_REJECT: function(data){
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.put('./external/confirm_exporter/update', data)
            .then((response) => {
                this.fire('toast', {
                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                        this.CONFIRM_GET_DATA();
                    }
                });
            });
        },
        CONFIRM_ADMIN_APPROVE: function(data, exp_data){
            if(data.change_status === true){
                let {id, exporter_id, type_lic_id} = exp_data;
                let newData = {id, exporter_id, type_lic_id};
                this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                axios.put('./external/confirm_exporter/changetype', newData)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                            this.CONFIRM_GET_DATA();
                            this._backPage();
                        }
                    });
                })
            }else{
                let { exporter_no, company_id, company_taxno, id, type_lic_id} = data;
                let newData = { exporter_no, company_id, company_taxno, type_lic_id};
                newData.confirm_id = data.id;
                newData.exporter_status = 'no';
                newData.expire_status = false;
                this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                axios.post('./external/confirm_exporter/insert', newData)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                            this.CONFIRM_GET_DATA();
                            this._backPage();
                        }
                    });
                })
            }
        },
        CONFIRM_ADMIN_EXTEND: function(data){
            // console.log(data);
            this.fire('toast',{status:'load',text:'กำลังบันทึกข้อมูล...'})
            axios.put('./external/exporter/update/date', data)
            .then((response) => {
                if(data.change_status === true){
                    let newData = {};
                    newData.id = data.confirm_id;
                    newData.approve_status = 'process';
                    axios.put('./external/confirm_exporter/update', newData)
                    .then((response2) => {
                        this.fire('toast',{status:'success',text:'บันทึกสำเร็จ',callback: () => {
                            this.CONFIRM_GET_DATA();
                        }});
                    })
                }else{
                    this.fire('toast',{status:'success',text:'บันทึกสำเร็จ',callback:() => {
                        this.CONFIRM_GET_DATA();
                    }});
                }
            })

        }
    }
    ]
}