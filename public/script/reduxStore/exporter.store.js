import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    list_search: [],
    pages: [],
    data: {},
    // licType: [],
    docType: [],
    // files: []
}
export function exporterReducer(state = initialState, action) {
    switch (action.type) {
        case 'EXPORTER_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        // case 'EXPORTER_GET_DATA_SEARCH':
        //     return Object.assign({}, state, { list_search: action.payload });
        case 'EXPORTER_GET_PAGE':
            return Object.assign({}, state, { pages: action.payload });
        case 'EXPORTER_GET_DATA_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'EXPORTER_GET_DOC_TYPE':
            return Object.assign({}, state, { docType: action.payload });
        case 'EXPORTER_SEARCH':
            return Object.assign({}, state, { list: action.payload });
        case 'EXPORTER_CLEAR_LIST_SEARCH':
            return Object.assign({}, state, { list_search: action.payload });
        // -------------------------------------------------------
        default:
            return state
    }
}
export function exporterAction(store) {
    return [commonAction(),
    {
        CHECK_EXPORTER_NO: function (exporter_no) {
            return axios.get('./draft/check?no=' + exporter_no)
        },
        UPDATE_DRAFT_EXPORTER_NO: function (exporter_no) {
            return axios.put('./exporter/close', data)
        },
        EXPORTER_GET_DATA: function (page = 1) {
            // console.log(page);
            // &pluck=company,lic_type,export_status,date_load,date_expire
            axios.get('./exporter?page=' + page + '&limit=100&close_status=false')
                .then(function (response) {
                    // console.log(response.data);
                    store.dispatch({ type: 'EXPORTER_GET_DATA', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        EXPORTER_GET_DATA_SEARCH: function (data, page = 1) {
            this.fire('toast', { status: 'load' })
            axios.get('./exporter/search?field=' + data.att_name + '&value=' + data.val + '&page=' + page + '&limit=100&close_status=false')
                .then((response) => {
                    let text = 'ค้นหาข้อมูลสำเร็จ เจอบริษัทจำนวน'+  response.data.rows_count + ' บริษัท'
                    store.dispatch({ type: 'EXPORTER_SEARCH', payload: response.data })
                    this.fire('toast', { status: 'success', text: text, callback: function () { } })
                    // response.data.map((item) => {
                    //     return item.company_name = '(' + item.company.company_taxno + ') ' + item.company.company_name_th + ' ' + item.company.company_name_en;
                    // })
                    // store.dispatch({ type: 'EXPORTER_GET_DATA_SEARCH', payload: response.data })
                })
        },
        EXPORTER_GET_PAGE: function () {
            axios.get('./exporter/page?limit=100')
                .then((response) => {
                    var pages = [];
                    for (var i = 1; i <= response.data; i++) {
                        pages.push(i);
                    }
                    // console.log(pages);
                    store.dispatch({ type: 'EXPORTER_GET_PAGE', payload: pages })
                })
        },
        EXPORTER_GET_DATA_ID: function (url) {
            // console.log(company_taxno);
            axios.get('./exporter/get/?' + url)
                .then(function (response) {
                    store.dispatch({ type: 'EXPORTER_GET_DATA_ID', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },

        EXPORTER_GET_DOC_TYPE: function () {
            axios.get('./doctype')
                .then(function (response) {
                    store.dispatch({ type: 'EXPORTER_GET_DOC_TYPE', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        EXPORTER_SEARCH: function (val, page, type) {
            if (type !== 'report') {
                // console.log('search');
                var page = parseInt(page);
                this.fire('toast', { status: 'load' })
                axios.get('./exporter?page=' + page + '&limit=100&close_status=false&' + val)
                    .then(function (response) {
                        // console.log(response.data);
                        store.dispatch({ type: 'EXPORTER_SEARCH', payload: response.data })
                    });
                this.fire('toast', { status: 'success', text: 'ค้นหาข้อมูลสำเร็จ', callback: function () { } })
            } else {
                // console.log('report');
                axios.get('./exporter' + val)
                    .then(function (response) { });
            }
        },
        // new
        EXPORTER_UPDATE: (data) => {
            return axios.put('./exporter', data)
        },
        EXPORTER_CLOSE: (data) => {
            return axios.put('./exporter/close', data)
        },

        EXPORTER_CLEAR_LIST_SEARCH: function () {
            store.dispatch({ type: 'EXPORTER_CLEAR_LIST_SEARCH', payload: [] });
        }
        //-------------------------------------
    }
    ]
}