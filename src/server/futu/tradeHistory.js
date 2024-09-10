import { getFtWebsocket, getCommon, getTrd_Common } from "./futuApiWrapper";
import { PRIVATE_FUTU_WEBSOCKET_AUTH_KEY } from "$env/static/private";

export async function TrdGetHistoryOrderList(){
    const ftWebsocket = await getFtWebsocket();
    const Common = await getCommon();
    const Trd_Common = await getTrd_Common();

    const { RetType } = Common
    const { TrdEnv, TrdMarket } = Trd_Common
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
                if(retType == RetType.RetType_Succeed){
                    let acc = accList.filter((item)=>{ 
                        return item.trdEnv == TrdEnv.TrdEnv_Simulate && item.trdMarketAuthList.some((auth)=>{ return auth == TrdMarket.TrdMarket_HK})
                    })[0]; // The sample takes the first HK paper trading environment account

                    const req = {
                        c2s: {
                            header: {
                                trdEnv: acc.trdEnv,
                                accID: acc.accID,
                                trdMarket: TrdMarket.TrdMarket_HK,
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
                        if(retType == RetType.RetType_Succeed){
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
 