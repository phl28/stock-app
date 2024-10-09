from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
import uvicorn
from futubull import FUTU

app = FastAPI()

@app.get("/sync-futu-trades")
def sync_futu_trades(
    start_date: str = Query(None, description="Start date in format YYYY-MM-DD"),
    end_date: str = Query(None, description="End date in format YYYY-MM-DD")
):
    futu = FUTU()
    try:
        parsed_start_date = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        parsed_end_date = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format. Use YYYY-MM-DD. Error: {str(e)}")

    response = futu.get_futu_data(start_date=parsed_start_date, end_date=parsed_end_date)
    if response.error:
        raise HTTPException(status_code=400, detail=response.error)

    return response

if __name__ == '__main__':
    uvicorn.run(app)