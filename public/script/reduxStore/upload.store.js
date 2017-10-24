import axios from '../axios'
const initialState = {
    list: [],
    fileList: [],
    fileListDelete: []
}
export function uploadReducer(state = initialState, action) {
    switch (action.type) {
        case 'UPLOAD_GET_LIST':
            return Object.assign({}, state, { fileList: action.payload });
        case 'UPLOAD_GET_LIST_DELETE':
            return Object.assign({}, state, { fileListDelete: action.payload });

        default:
            return state
    }
}
export function uploadAction(store) {
    return {
        UPLOAD_GET_LIST: function (link) {
            axios.get('/file/list/?' + link)
                .then((response) => {
                    store.dispatch({ type: 'UPLOAD_GET_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        UPLOAD_GET_LIST_DELETE: function (link) {
            axios.get('/file/list/?' + link)
                .then((response) => {
                    // console.log(response.data);
                    store.dispatch({ type: 'UPLOAD_GET_LIST_DELETE', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        UPLOAD_FILE_CHANGE: function (key) {
            return axios.get('/external/document_file/id/' + key)
        },
        UPLOAD_DELETE_RECOVERY: function (file) {
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            return axios.put('/file/recovery/', file)

        },
        UPLOAD_RECOVERY: function (id, com_id) {
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.put('/upload/recovery/' + id)
                .then((response) => {
                    // console.log(response);
                    this.fire('toast', {
                        status: 'success', text: 'กู้คืนไฟล์สำเร็จ', callback: () => {
                            this.dispatchAction('EXPORTER_GET_FILE_DELETE', com_id);
                            this.dispatchAction('EXPORTER_GET_DATA');
                            // this.fire('refresh-exporter');
                            // this.fire('getFiles');
                        }
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }

}


// import axios from '../axios'
// const initialState = {
//     list: [],
//     fileList: [],
//     fileListDelete:[]
// }
// export function uploadReducer(state = initialState, action) {
//     switch (action.type) {
//         case 'UPLOAD_GET_LIST':
//             return Object.assign({}, state, { fileList: action.payload });
//         case 'UPLOAD_GET_LIST_DELETE':
//             return Object.assign({}, state, { fileListDelete: action.payload });

//         default:
//             return state
//     }
// }
// export function uploadAction(store) {
//     return 
//     {

//         UPLOAD_GET_LIST: function (link) {
//             axios.get('/file/list/?' + link)
//                 .then((response) => {
//                     store.dispatch({ type: 'UPLOAD_GET_LIST', payload: response.data })
//                 })
//                 .catch(function (error) {
//                     console.log(error);
//                 });
//         },
//         UPLOAD_GET_LIST_DELETE: function (link) {
//             axios.get('/file/list/?' + link)
//                 .then((response) => {
//                     // console.log(response.data);
//                     store.dispatch({ type: 'UPLOAD_GET_LIST_DELETE', payload: response.data })
//                 })
//                 .catch(function (error) {
//                     console.log(error);
//                 });
//         },
//         UPLOAD_FILE_CHANGE: function (key) {
//             return axios.get('/external/document_file/id/' + key)
//         },
//         UPLOAD_DELETE_RECOVERY: function (file) {
//             this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
//             return axios.put('/file/recovery/', file)

//         },
//         UPLOAD_RECOVERY: function (id, com_id) {
//             this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
//             axios.put('/upload/recovery/' + id)
//                 .then((response) => {
//                     // console.log(response);
//                     this.fire('toast', {
//                         status: 'success', text: 'กู้คืนไฟล์สำเร็จ', callback: () => {
//                             this.dispatchAction('EXPORTER_GET_FILE_DELETE', com_id);
//                             this.dispatchAction('EXPORTER_GET_DATA');
//                             // this.fire('refresh-exporter');
//                             // this.fire('getFiles');
//                         }
//                     });
//                 })
//                 .catch(function (error) {
//                     console.log(error);
//                 });
//         }
//     }
// }