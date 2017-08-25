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
        case 'CONFIRM_GET_ID_DATA':
            return Object.assign({}, state, { data: action.payload });
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
            axios.get('./external/draft/')
                .then(function (response) {
                    response.data.map((item) => {
                        for (var key in item) {
                            if (item[key] === "") {
                                item[key] = '-';
                            }
                        }
                    })
                    store.dispatch({ type: 'CONFIRM_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        CONFIRM_SEARCH: function(id){
            this.fire('toast', { status: 'load', text: 'กำลังโหลดข้อมูล...' })
            axios.get('./external/company/id/'+id)
            .then((response) => {
                var data = response.data;
                if(data.length > 0){
                    axios.get('./external/draft/companyId/'+ data[0].id)
                    .then((response2) => {
                        // console.log(data[0]);
                        var data2 = response2.data;
                        if(data2 !== null){
                            for (var key in data2) {
                                if (data2[key] === '') {
                                    data2[key] = "-";
                                }
                            }
                            this.fire('toast',{
                                status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () =>{
                                    store.dispatch({type: 'CONFIRM_SEARCH', payload: data2})
                                }
                            });
                            // console.log('มี');
                        }else{
                            axios.get('./external/company/id/' + id)
                            .then((response3) => {
                                var data3 = response3.data;
                                if(typeof data3[0].company_name_th !== 'undefined'){
                                    for (var key in data3[0]) {
                                        if (data3[0][key] === '') {
                                                data3[0][key] = "-";
                                            }
                                        }
                                        let newData = { company: data3[0] };
                                        newData.register_status = true;
                                        newData.doc_status_name = 'ยังไม่ลงทะเบียนผู้ส่งออก';
                                        this.fire('toast',{
                                            status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () =>{
                                                store.dispatch({type: 'CONFIRM_SEARCH', payload: newData })
                                        }
                                    });
                                }else{
                                    this.fire('toast', { status: 'connectError', text: 'ไม่มีเลขประจำตัวผู้เสียภาษีในระบบ' })
                                    store.dispatch({type: 'CONFIRM_SEARCH', payload: {}})
                                }                    
                            });
                            // console.log('ไม่มี');
                        }
                    });
                }else{
                    this.fire('toast', { status: 'connectError', text: 'ไม่มีเลขประจำตัวผู้เสียภาษีในระบบ' })
                    store.dispatch({type: 'CONFIRM_SEARCH', payload: {}})
                }
            })
            .catch((err)=>{
                console.log(err);
            })
        },
        CONFIRM_REGISTER: function(data){
            // console.log(data);
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.post('./external/draft/insert', data)
            // axios.post('./external/confirm_exporter/register', data)
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
        CONFIRM_ADMIN_REJECT: function(data){
            // console.log(data);
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.put('./external/draft/update', data)
            .then((response) => {
                this.fire('toast', {
                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                        this.CONFIRM_GET_DATA();
                    }
                });
            });
        },
        CONFIRM_COMPANY_REJECT: function(data){
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.put('./external/draft/update', data)
            .then((response) => {
                this.fire('toast', {
                    status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                        this.CONFIRM_GET_DATA();
                        this.CONFIRM_SEARCH(data.company_taxno);
                        // this.fire('back_page');
                        this.fire('clearData');
                    }
                });
            });
        },
        CONFIRM_ACCEPT_PASS: function(data){
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.put('./external/draft/update', data)
            .then((response) => {
                this.fire('toast', {
                status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                        this.CONFIRM_GET_DATA();
                        this._backPage();
                    }
                });
            });
        },
        CONFIRM_ADMIN_APPROVE: function(data){
            if(data.draft_status == 'type'){
                let {id, exporter_id, lic_type_id} = data;
                let newData = {id, exporter_id, lic_type_id};
                this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                axios.put('./external/draft/changetype', newData)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                            this.CONFIRM_GET_DATA();
                            this._backPage();
                        }
                    });
                })
            }else{
                let { exporter_no, company_id, company_taxno, id, lic_type_id, approve_status, doc_status} = data;
                let newData = { exporter_no, company_id, company_taxno, lic_type_id};
                newData.draft_id = data.id;
                newData.exporter_status = false;
                newData.expire_status = false;
                // console.log(newData);
                this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                axios.post('./external/draft/approve', newData)
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
                this.fire('toast',{status:'success',text:'บันทึกสำเร็จ',callback:() => {
                    this.CONFIRM_GET_DATA();
                    this._backPage();
                }});
            })
            .catch(function(err){
                console.log(err);
            })
        },
        CONFIRM_OB_DATA: function (id) {
            return axios.get('./external/confirm_exporter/get/' + id)
        },
        CONFIRM_CHANGE_EXPORTER_NO: function(data){
            axios.get('./external/check/duplicate?table=draft&field=exporter_no&value=' + data.exporter_no)
            .then((response) => {
                if(response.data == 0){
                    this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                    axios.put('./external/draft/update', data)
                    .then((response2) => {
                        this.fire('toast', {
                            status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                this.CONFIRM_GET_DATA();
                            }
                        });
                    })
                }else{
                    axios.get('./external/check/duplicate?table=draft&id=' + data.id + '&field=exporter_no&value=' + data.exporter_no)
                    .then((response2) => {
                        if(response2.data == 1){
                            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
                            axios.put('./external/draft/update', data)
                            .then((response3) => {
                                this.fire('toast', {
                                    status: 'success', text: 'บันทึกสำเร็จ', callback: () => {
                                        this.CONFIRM_GET_DATA();
                                    }
                                });
                            })
                        }else{
                            this.fire('toast', {
                                status: 'connectError', text: 'เลข ข. นี้มีอยู่แล้ว',
                                callback: function () {}
                            })
                        }
                    })
                }
            })
        }
    }
    ]
}