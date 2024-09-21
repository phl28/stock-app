from datetime import datetime
from fastapi import FastAPI, HTTPException
import uvicorn
from futubull import FUTU

app = FastAPI()

@app.get("/sync-futu-trades")
def sync_futu_trades():
    futu = FUTU()
    start_date = datetime.strptime("2000-01-01 00:00:00", "%Y-%m-%d %H:%M:%S")
    response = futu.get_futu_data(start_date=start_date)
    if response.error:
        raise HTTPException(status_code=400, detail=response.error)

    return response

if __name__ == '__main__':
    uvicorn.run(app)