import { PRIVATE_FUTU_WEBSOCKET_AUTH_KEY } from "$env/static/private";

// this does not work, cant seem to import from futu-api/proto.js
export async function TrdGetHistoryOrderList() {
    const ftWebsocket = await import("futu-api");
    let [addr, port, enable_ssl, key] = ["0.0.0.0", 11111, false, PRIVATE_FUTU_WEBSOCKET_AUTH_KEY];
    let websocket = new ftWebsocket();

    websocket.onlogin = (ret, msg)=>{
        if (ret) { 
            websocket.GetAccList({
                c2s: {
                    userID: 0,
                },
            }).then((res) => {
                let { retType,s2c: { accList } } = res
                if(retType == 0){
                    let acc = accList.filter((item)=>{ 
                        return item.trdEnv ==   {
                            value: 1, //Trd_Common.TrdEnv_Real
                            label: "真实环境",
                          } && item.trdMarketAuthList.some((auth)=>{ return auth == {value: 1, label: "US"} })
                    })[0]; // The sample takes the first US real trading environment account

                    const req = {
                        c2s: {
                            header: {
                                trdEnv: acc.trdEnv,
                                accID: acc.accID,
                                trdMarket: {value: 1, label: "US"}
                            },
                            filterConditions:{
                                beginTime:"2021-09-01 00:00:00",
                                endTime:"2021-09-30 00:00:00",
                            },
                        },
                    };

                    websocket.GetHistoryOrderList(req)
                    .then((res) => {
                        let { errCode, retMsg, retType,s2c } = res
                        console.log("GetHistoryOrderList: errCode %d, retMsg %s, retType %d", errCode, retMsg, retType); 
                        if(retType == 0){
                            let data = JSON.stringify(s2c);
                            console.log(data);
                        }
                    })
                    .catch((error) => {
                        console.log("error:", error);
                    });

                }
            })
            .catch((error) => {
                console.log("GetAccList error:", error);
            });
        } else {
            console.log("error", msg);
        }
    };

    websocket.start(addr, port, enable_ssl, key);
    
    // After using the connection, remember to close it to prevent the number of connections from running out
    setTimeout(()=>{ 
        websocket.stop();
        console.log("stop");
    }, 5000); // Set the script to receive OpenD push duration to 5 seconds
}
 