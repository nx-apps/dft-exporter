import axios from '../axios'
import { commonAction } from '../config'

const initialState = {
    country: [],
    list: [],
    select: {}
}

export function countryGroupReducer(state = initialState, action) {

    switch (action.type) {
        case 'COUNTRY_LIST':
            return Object.assign({}, state, { country: action.payload });
        case 'COUNTRY_GROUP_LIST':
            return Object.assign({}, state, { list: action.payload });
        case 'COUNTRY_GROUP_SELECT':
            return Object.assign({}, state, { select: action.payload });
        case 'COUNTRY_GROUP_CLEAR_SELECT':
            return Object.assign({}, state, { select: { country: [] } });
        default:
            return state
    }

}

export function countryGroupAction(store) {

    return [commonAction(),
    {

        COUNTRY_GROUP_LIST: function () {
            axios.get('/countryGroup')
                .then(res => {
                    store.dispatch({ type: 'COUNTRY_GROUP_LIST', payload: res.data })
                })
                .catch(err => {

                })
        },
        COUNTRY_LIST: function (id) {
            var url;
            if (id == "list") {
                url = `countryGroup/country`;
            } else {
                url = `countryGroup/country/${id}`;
            }
            axios.get(url)
                .then(res => {
                    store.dispatch({ type: 'COUNTRY_LIST', payload: res.data })
                })
                .catch(err => {

                })
        },
        COUNTRY_GROUP_SELECT: function (id) {
            axios.get(`/countryGroup/group/${id}`)
                .then(res => {
                    store.dispatch({ type: 'COUNTRY_GROUP_SELECT', payload: res.data })
                    this.COUNTRY_LIST(id);
                    this.$$('nylon-panel-right').open();
                })
                .catch(err => {
                    console.log(err);
                })
        },
        COUNTRY_GROUP_CLEAR_SELECT: function () {
            store.dispatch({ type: 'COUNTRY_GROUP_CLEAR_SELECT' })
            this.COUNTRY_LIST('list');
        },
        COUNTRY_GROUP_INSERT: function (data) {
            this.fire('toast', { status: 'load' });
            axios.post(`/countryGroup/group`, data)
                .then(res => {
                    this.COUNTRY_GROUP_LIST();
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            this.$$('nylon-panel-right').close();
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                })
        },
        COUNTRY_GROUP_UPDATE: function (data) {
            this.fire('toast', { status: 'load' });
            axios.put(`/countryGroup/group`, data)
                .then(res => {
                    //store.dispatch({ type: 'COUNTRY_GROUP_SELECT', payload: res.data })
                    this.COUNTRY_GROUP_LIST();
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            this.$$('nylon-panel-right').close();
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                })
        },
        COUNTRY_GROUP_DELETE: function (id) {
            this.fire('toast', { status: 'load' });
            axios.delete(`/countryGroup/group/${id}`)
                .then(res => {
                    this.COUNTRY_GROUP_LIST();
                    this.fire('toast', {
                        status: 'success', text: 'ลบข้อมูลสำเร็จ',
                        callback: () => {
                            this.$$('nylon-panel-right').close();
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }
    ]

}