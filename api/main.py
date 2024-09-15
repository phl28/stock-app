from datetime import datetime
from fastapi import FastAPI, Response  
import uvicorn
from futu_api import FUTU

app = FastAPI()

@app.get("/sync-futu-trades")
def sync_futu_trades():
    futu = FUTU()
    start_date = datetime.strptime("2000-01-01 00:00:00", "%Y-%m-%d %H:%M:%S")
    response = futu.get_futu_data(start_date=start_date)
    print("response", response)
    # return Response(content=response.trades, status_code=200)
    
if __name__ == '__main__':
    uvicorn.run(app)