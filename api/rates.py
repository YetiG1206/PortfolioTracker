import json
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

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


def get_rates(date):
    if date:
        spx, spx_date = close_on_or_after(SPX_TICKER, date)
        usdils, _ = close_on_or_after(FX_TICKER, date)
        as_of = spx_date or date
    else:
        spx, spx_date = latest_close(SPX_TICKER)
        usdils, _ = latest_close(FX_TICKER)
        as_of = spx_date or "unknown"

    if spx is None or usdils is None:
        raise ValueError("No market data found for that date")

    return {"spx": round(spx, 2), "usdils": round(usdils, 4), "asOf": as_of}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        date = query.get("date", [None])[0]

        try:
            payload = get_rates(date)
            self._send(200, payload)
        except Exception as e:
            self._send(502, {"error": str(e)})

    def _send(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)
