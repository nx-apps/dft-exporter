import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    listDocType: [],
    listLictype: [],
    doctype: {},
    lictype: {},
    btn: {}
}
export function settingReducer(state = initialState, action) {
    switch (action.type) {
        case 'SETTING_GET_LIST_DOC':
            return Object.assign({}, state, { listDocType: action.payload });
        case 'SETTING_GET_LIST_LIC':
            return Object.assign({}, state, { listLictype: action.payload });
        case 'SETTING_GET_ID_DOC':
            return Object.assign({}, state, { doctype: action.payload });
        case 'SETTING_GET_ID_LIC':
            return Object.assign({}, state, { lictype: action.payload });
        case 'SETTING_BTN':
            return Object.assign({}, state, { btn: action.payload });
        default:
            return state
    }
}
export function settingAction(store) {
    return 
    {
        // SET BTN
        SETTING_BTN: function (data) {
            store.dispatch({ type: 'SETTING_BTN', payload: data })
        }
        // GET ALL
        SETTING_GET_LIST_DOC: function () {
            axios.get('/doctype')
                .then((response) => {
                    store.dispatch({ type: 'SETTING_GET_LIST_DOC', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        SETTING_GET_LIST_LIC: function () {
            axios.get('/lictype')
                .then((response) => {
                    store.dispatch({ type: 'SETTING_GET_LIST_LIC', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        //get by id
        SETTING_GET_ID_DOC: function (id) {
            axios.get('/doctype/get?id=' + id)
                .then((response) => {
                    store.dispatch({ type: 'SETTING_GET_ID_DOC', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        SETTING_GET_ID_LIC: function (id) {
            axios.get('/lictype/get?id=' + id)
                .then((response) => {
                    store.dispatch({ type: 'SETTING_GET_ID_LIC', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        // post
        SETTING_POST_DOC: function (data) {
            return axios.post('/doctype/insert', data)
        }
        SETTING_POST_LIC: function (data) {
            return axios.post('/lictype/insert', data)
        }
        //update 
        SETTING_PUT_DOC: function (data) {
            return axios.put('/doctype/update', data)
        }
        SETTING_PUT_LIC: function (data) {
            return axios.put('/lictype/update', data)
        }
        //delete
        //update 
        SETTING_DELETE_DOC: function (id) {
            return axios.delete('/doctype/delete?id='+id)
        }
        SETTING_DELETE_LIC: function (id) {
            return axios.delete('/lictype/delete?id='+id)
        }
        SETTING_CLEAR_DOC_LIC: function (id) {
            // return axios.delete('/lic
            store.dispatch({ type: 'SETTING_GET_ID_LIC', payload: {} })
            store.dispatch({ type: 'SETTING_GET_ID_DOC', payload: {} })
        }
    }
}