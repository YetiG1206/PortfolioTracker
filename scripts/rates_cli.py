import json
import sys
from datetime import datetime, timedelta

import yfinance as yf

SPX_TICKER = "^GSPC"
FX_TICKER = "ILS=X"


def latest_close(ticker):
    hist = yf.Ticker(ticker).history(period="5d")
    if hist.empty:
        return None, None
    row = hist.iloc[-1]
    return float(row["Close"]), hist.index[-1].strftime("%Y-%m-%d")


def close_on_or_after(ticker, date_str):
    start = datetime.strptime(date_str, "%Y-%m-%d")
    end = start + timedelta(days=7)
    hist = yf.Ticker(ticker).history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"))
    if hist.empty:
        return None, None
    row = hist.iloc[0]
    return float(row["Close"]), hist.index[0].strftime("%Y-%m-%d")


def main():
    date = sys.argv[1] if len(sys.argv) > 1 else None
    try:
        if date:
            spx, spx_date = close_on_or_after(SPX_TICKER, date)
            usdils, _ = close_on_or_after(FX_TICKER, date)
            as_of = spx_date or date
        else:
            spx, spx_date = latest_close(SPX_TICKER)
            usdils, _ = latest_close(FX_TICKER)
            as_of = spx_date or "unknown"

        if spx is None or usdils is None:
            print(json.dumps({"error": "No market data found for that date"}))
            sys.exit(1)

        print(json.dumps({"spx": round(spx, 2), "usdils": round(usdils, 4), "asOf": as_of}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
