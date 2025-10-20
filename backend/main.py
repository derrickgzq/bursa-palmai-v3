from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
import pandas as pd

app = FastAPI()

# Allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dynamically find absolute path to DB
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "src", "data", "bursa_palmai_database.db")

@app.get("/api/company/{short_name}")
def get_company(short_name: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM company_master_table WHERE company_short_name = ?", (short_name.upper(),))
    row = cur.fetchone()
    conn.close()

    if row:
        return {
            "company_long_name": row[1],
            "company_stock_code": row[2],
            "company_board": row[3],
            "company_description": row[4],
            "company_website": row[5],
        }
    return {"error": "Company not found"}

@app.get("/api/production/{company_short_name}")
def get_company_production(company_short_name: str):
    conn = sqlite3.connect(DB_PATH)
    query = f"""
        SELECT date, raw_material, volume
        FROM company_monthly_production
        WHERE company_short_name = ?
        AND date >= '2025-01-01'
        ORDER BY date ASC
    """
    df = pd.read_sql_query(query, conn, params=[company_short_name])
    conn.close()
    return df.to_dict(orient="records")
