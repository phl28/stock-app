from futu import *
import datetime
import os

# Futu trading data
def connect_futu():
    SysConfig.set_init_rsa_file(os.environ.get('RSA_KEY_PATH'))
    trd_ctx = OpenSecTradeContext(
        filter_trdmarket=TrdMarket.US,
        host="0.0.0.0",
        port=11111,
        security_firm=SecurityFirm.FUTUSECURITIES,
        is_encrypt=True,
    )
    return trd_ctx



def get_historical_orders(lastSync:str=None):
    trd_ctx = connect_futu()

    if (lastSync is not None and not isinstance(lastSync, str)):
        return 
    ret, data = trd_ctx.history_order_list_query(
        start=lastSync if lastSync else "2000-01-01 00:00:00", end=datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    )

    if ret == RET_OK:
        trade_history = data[
            ["order_id", "code", "stock_name", "order_type", "order_status", "trd_side", "updated_time", "dealt_qty", "dealt_avg_price"]
        ]
        renamed_trade_history = trade_history.rename(
            columns={
                "code": "ticker",
                "trd_side": "trade_side",
                "dealt_qty": "quantity",
                "dealt_avg_price": "price",
                "updated_time": "execution_time"
            }
        )
        renamed_trade_history.loc[:, "ticker"] = renamed_trade_history["ticker"].str.replace("US.", "")
    else:
        print("Get Historical Orders Error", data)
        renamed_trade_history = None
    trd_ctx.close()
    return renamed_trade_history

def get_positions():
    trd_ctx = connect_futu()

    ret, data = trd_ctx.position_list_query()
    
    if ret == RET_OK:
        positions = data[
            ["code", "stock_name", "position_side", "qty", "nominal_price", "cost_price", "market_val", "pl_ratio", "pl_val", "today_pl_val", "today_sell_qty", "today_sell_val", "today_buy_qty", "today_buy_val", "unrealized_pl", "realized_pl"]
        ]
        renamed_positions = positions.rename(
            columns={
                "code": "ticker",
                "qty": "quantity",
            }
        )
        renamed_positions.loc[:, "ticker"] = renamed_positions["ticker"].str.replace("US.", "")
    else:
        print("Get Positions Error", data)
        renamed_positions = None
    
    trd_ctx.close()
    return renamed_positions
