from datetime import datetime
from fastapi import FastAPI
import uvicorn
from futu_api import FUTU

app = FastAPI()

@app.get("/sync-futu-trades")
def sync_futu_trades():
    futu = FUTU()
    start_date = datetime.strptime("2000-01-01 00:00:00", "%Y-%m-%d %H:%M:%S")
    response = futu.get_futu_data(start_date=start_date)
    print("response", response)
    
if __name__ == '__main__':
    uvicorn.run(app)