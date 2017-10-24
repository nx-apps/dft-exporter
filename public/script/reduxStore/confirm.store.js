import axios from '../axios'
const initialState = {
    list: [],
    data: {},
    dataRenew: {},
    dataChange: {},
    confirmType: {},
    draftById: {},
    draftChange:{}
}
export function confirmReducer(state = initialState, action) {
    switch (action.type) {
        case 'CONFIRM_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        // case 'CONFIRM_GET_ID_DATA':
        //     return Object.assign({}, state, { data: action.payload });
        case 'CONFIRM_SEARCH':
            return Object.assign({}, state, { data: action.payload });
        case 'CONFIRM_RENEW':
            return Object.assign({}, state, { dataRenew: action.payload });
        case 'CONFIRM_CHANGE':
            return Object.assign({}, state, { dataChange: action.payload });
        case 'CONFIRM_SEARCH_DRAFT':
            return Object.assign({}, state, { draftById: action.payload });
        case 'CONFIRM_CHANGE_DRAFT':
            return Object.assign({}, state, { draftChange: action.payload });
        case 'CONFIRM_TYPE':
            return Object.assign({}, state, { confirmType: action.payload });
        default:
            return state
    }
}
export function confirmAction(store) {
    return 
    {
        CONFIRM_GET_DATA: function () {
            axios.get('./draft/')
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
        }
        CONFIRM_TYPE: function (data) {
            store.dispatch({ type: 'CONFIRM_TYPE', payload: { data } })
        }
        CONFIRM_SEARCH_RESET: function () {
            store.dispatch({ type: 'CONFIRM_SEARCH', payload: {} })
        }
        CONFIRM_RENEW: function (company_taxno) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/renew?company_taxno=' + company_taxno)
                .then((response) => {
                    // console.log(response.data)
                    if (response.data.hasOwnProperty('company_taxno')) {
                        this.fire('toast', {
                            status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                store.dispatch({ type: 'CONFIRM_RENEW', payload: response.data })
                            }
                        });
                    } else {
                        this.fire('toast', { status: 'connectError', text: 'ไม่มีข้อมูลในระบบ' })
                        store.dispatch({ type: 'CONFIRM_RENEW', payload: {} })
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        CONFIRM_CHANGE_DRAFT: function (company_taxno) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/change?company_taxno=' + company_taxno)
                .then((response) => {
                    // console.log(response.data)
                    if (response.data.hasOwnProperty('company_taxno')) {
                        this.fire('toast', {
                            status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                store.dispatch({ type: 'CONFIRM_CHANGE_DRAFT', payload: response.data })
                            }
                        });
                    } else {
                        this.fire('toast', { status: 'connectError', text: response.error })
                        store.dispatch({ type: 'CONFIRM_CHANGE_DRAFT', payload: {} })
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        // ใช้สำหรับยกเลิก ยืนยัน กับพวก  doc และ app
        CONFIRM_DOC_AND_APPROVE: function (draft) {
            // console.log(draft);
            return axios.put('./draft/insert', draft)
        }
        CONFIRM_CHANGE: function (company_taxno) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/insert?company_taxno=' + company_taxno)
                .then((response) => {
                    // console.log(response.data)
                    if (response.data.hasOwnProperty('company_taxno')) {
                        this.fire('toast', {
                            status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                store.dispatch({ type: 'CONFIRM_CHANGE', payload: response.data })
                            }
                        });
                    } else {
                        this.fire('toast', { status: 'connectError', text: 'ไม่มีข้อมูลในระบบ' })
                        store.dispatch({ type: 'CONFIRM_CHANGE', payload: {} })
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        CONFIRM_SEARCH_DRAFT: function (idDraft) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/get?id=' + idDraft)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                            store.dispatch({ type: 'CONFIRM_SEARCH', payload: response.data })
                        }
                    })
                    store.dispatch({ type: 'CONFIRM_SEARCH_DRAFT', payload: response.data })
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        CONFIRM_SEARCH: function (company_taxno) {
            this.fire('toast', { status: 'load', text: 'กำลังค้นหาข้อมูล...' })
            axios.get('./draft/insert?company_taxno=' + company_taxno)
                .then((response) => {
                    // console.log(response.data)
                    if (response.data.hasOwnProperty('company_taxno')) {
                        this.fire('toast', {
                            status: 'success', text: 'โหลดข้อมูลสำเร็จ', callback: () => {
                                store.dispatch({ type: 'CONFIRM_SEARCH', payload: response.data })
                            }
                        })
                    } else {
                        this.fire('toast', { status: 'connectError', text: 'ไม่มีข้อมูลในระบบ' })
                        store.dispatch({ type: 'CONFIRM_SEARCH', payload: {} })
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        CONFIRM_REGISTER: function (company) {
            return axios.post('./draft/insert?company_taxno=' + company.company_taxno, company)
        }
        CONFIRM_RENEW_UPDATE: function (company) {
            // console.log(company);
            return axios.put('./draft/renew', company)
        }
        CONFIRM_CHANGE_DRAFT_UPDATE: function (company) {
            // console.log(company);
            return axios.put('./draft/change', company)
        }
    }
    
}