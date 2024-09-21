import base64
from decimal import Decimal
from enum import Enum
import os
import tempfile
from pydantic import BaseModel
from futu import OpenSecTradeContext, TrdMarket, SecurityFirm, RET_OK, TrdEnv, SysConfig
from datetime import datetime
from typing import List, Optional

class Region(str, Enum):
    US = "US"
    HK = "HK"
    UK = "UK"

class Currency(str, Enum):
    USD = "USD"
    HKD = "HKD"
    EUR = "EUR"
    GBP = "GBP"
    CNY = "CNY"

class Platform(str, Enum):
    FUTU = "FUTU"
    IBKR = "IBKR"

class TradeSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class TradeData(BaseModel):
    ticker: str
    region: Region = Region.US
    currency: Currency = Currency.USD
    price: Decimal
    fees: Decimal = Decimal('0')
    totalCost: Decimal
    volume: int
    platform: Platform = Platform.FUTU
    tradeSide: TradeSide
    executedAt: datetime
    profitLoss: Optional[Decimal] = None

class FUTUResponse(BaseModel):
    trades: List[TradeData]
    error: Optional[str] = None


class FUTUConfig(BaseModel):
    host: str = "127.0.0.1"
    port: int = 11111
    security_firm: SecurityFirm = SecurityFirm.FUTUSECURITIES

    class Config:
        arbitrary_types_allowed = True

class FUTU(BaseModel):
    config: FUTUConfig = FUTUConfig()
    
    def _setup_rsa_key(self):
        rsa_key = os.environ.get('FUTU_RSA_KEY')
        try:
            decoded_key = base64.b64decode(rsa_key).decode('utf-8')
        except Exception:
            decoded_key = rsa_key

        if not decoded_key.startswith('-----BEGIN RSA PRIVATE KEY-----'):
            decoded_key = '-----BEGIN RSA PRIVATE KEY-----\n' + decoded_key
        if not decoded_key.endswith('-----END RSA PRIVATE KEY-----'):
            decoded_key = decoded_key + '\n-----END RSA PRIVATE KEY-----'

        lines = decoded_key.split('\n')
        formatted_lines = [lines[0]]  
        for line in lines[1:-1]: 
            formatted_lines.extend([line[i:i+64] for i in range(0, len(line), 64)])
        formatted_lines.append(lines[-1])  
        formatted_key = '\n'.join(formatted_lines)

        with tempfile.NamedTemporaryFile(mode='w', delete=False) as temp_file:
            temp_file.write(formatted_key)
            temp_file_path = temp_file.name
        
        return temp_file_path

    def get_futu_data(self, start_date: Optional[datetime.date] = None, end_date: Optional[datetime.date] = None, market: Optional[TrdMarket] = TrdMarket.US) -> FUTUResponse:
        try:
            temp_file_path = self._setup_rsa_key()

            SysConfig.enable_proto_encrypt(is_encrypt = True)
            SysConfig.set_init_rsa_file(temp_file_path)
            trd_ctx = OpenSecTradeContext(
            filter_trdmarket=market,
            host="0.0.0.0",
            port=11111,
            is_encrypt=True,
            security_firm=SecurityFirm.FUTUSECURITIES,
            )

            start_str = start_date.strftime("%Y-%m-%d %H:%M:%S") if start_date else "2000-06-17 21:15:59"
            end_str = end_date.strftime("%Y-%m-%d %H:%M:%S") if end_date else datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            ret, data = trd_ctx.history_order_list_query(
                start=start_str,
                end=end_str,
                acc_index=0,
                trd_env=TrdEnv.REAL
            )

            if ret == RET_OK:
                trades = []
                for _, row in data.iterrows():
                    price = Decimal(str(row['dealt_avg_price'])) if row['dealt_avg_price'] else Decimal(str(row['price']))
                    volume = int(row['dealt_qty']) if row['dealt_qty'] else Decimal(str(row['qty']))
                    total_cost = price * volume
                    code = row['code']
                    currency = row['currency']
                    
                    trade = TradeData(
                        region=Region.US if market == TrdMarket.US else Region.HK if market == TrdMarket.HK else Region.UK,
                        currency=Currency.USD if currency == 'USD' else Currency.HKD if currency == 'HKD' else Currency.EUR if currency == 'EUR' else Currency.GBP if currency == 'GBP' else Currency.CNY,
                        ticker=code.replace("US.", ""),
                        price=price,
                        totalCost=total_cost,
                        volume=volume,
                        tradeSide=TradeSide.BUY if row['trd_side'] == 'BUY' or row['trd_side'] == 'BUY_BACK' else TradeSide.SELL,
                        executedAt=datetime.datetime.strptime(row['updated_time'], "%Y-%m-%d %H:%M:%S"),
                    )
                    trades.append(trade)
                
                return FUTUResponse(trades=trades)
            else:
                return FUTUResponse(trades=[], error=f"history_order_list_query error: {data}")
        except Exception as e:
            return FUTUResponse(trades=[], error=str(e))
        finally:
            trd_ctx.close()

    def prepare_for_db_insert(self, response: FUTUResponse) -> list[dict]:
        return [trade.model_dump(exclude={'profitLoss', 'notes'}) for trade in response.trades]
