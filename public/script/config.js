export function dispatchActionBehavior(){
    return {
        dispatchAction:function(){
            
            return new Promise((reslove,reject)=>{
                this.fire('dispatchAction',{
                    args:arguments,
                    callback:(promise)=>{
                        if(typeof promise == "undefined"){
                            //reslove('Action no promise.');
                        }else{
                            promise.then((res)=>{
                                reslove(promise);
                            }).catch((err)=>{
                                reject(err);
                            })
                        }
                    }
                });
            })
            
        }
    }
}

//export const baseURL = `https://${window.location.hostname}:${location.port}`;
window.baseURL = `https://${window.location.hostname}:${location.port}`
export const baseURL = window.baseURL