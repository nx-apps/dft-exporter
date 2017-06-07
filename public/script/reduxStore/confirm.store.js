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
        CONFIRM_GET_ID: function (id) {
            return axios.get('./external/confirm_exporter/get/' + id)
        }
    }
    ]
}