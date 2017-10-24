import axios from '../axios'
const initialState = {
    ordinal: [],
    data: []
}
export function amountReducer(state = initialState, action) {
    switch (action.type) {
        case 'AMOUNT_GET_ORDINAL':
            return Object.assign({}, state, { ordinal: action.payload });
        case 'AMOUNT_GET_DATA':
            return Object.assign({}, state, { data: action.payload });
        default:
            return state
    }
}
export function amountAction(store) {
    return {
        AMOUNT_GET_ORDINAL: function (year, typeRice) {
            axios.get('./common/ordinal/amount', {
                params: {
                    year: year,
                    type_rice_id: typeRice
                }
            })
                .then(function (response) {
                    store.dispatch({ type: 'AMOUNT_GET_ORDINAL', payload: response.data })
                }.bind(this))
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                }.bind(this));
        },
        AMOUNT_GET_DATA: function (val) {
            return new Promise((res,rej)=>{
                axios.get('./amount/amount', {
                params: {
                    year: val.selectYear,
                    type_rice_id: val.selectTypeRice,
                    ordinal: val.selectOrdinal
                }
                })
                .then(function(response){
                    res();
                    store.dispatch({ type: 'AMOUNT_GET_DATA', payload: response.data })
                })
                .catch(function(error){
                    rej(error)
                    console.log('error');
                    console.log(error);
                });
            })
           
        },
        AMOUNT_UPDATE: function (data) {
            return axios.put('./amount/amount', data)
        }
    }
    
}

