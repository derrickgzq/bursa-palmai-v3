from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
import pandas as pd
import psutil, os, time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "src", "data", "bursa_palmai_database.db")

@app.get("/api/memory")
def get_memory_usage():
    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()
    return {
        "memory_mb": round(mem_info.rss / (1024 * 1024), 2),
        "virtual_memory_mb": round(mem_info.vms / (1024 * 1024), 2)
    }

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

@app.get("/api/extraction/{company_short_name}")
def get_company_extraction_rate(company_short_name: str):
    conn = sqlite3.connect(DB_PATH)
    query = """
        SELECT date, company_short_name, value, category
        FROM company_extraction_rate
        WHERE company_short_name = ?
        ORDER BY date ASC
    """
    df = pd.read_sql_query(query, conn, params=[company_short_name])
    conn.close()
    return df.to_dict(orient="records")

@app.get("/api/plantation-area/{company_short_name}")
def get_company_plantation_area(company_short_name: str):
    conn = sqlite3.connect(DB_PATH)
    query = """
        SELECT date, company_short_name, value, category
        FROM company_plantation_area
        WHERE company_short_name = ?
        AND date = "2024"
    """
    df = pd.read_sql_query(query, conn, params=[company_short_name])
    conn.close()
    return df.to_dict(orient="records")

@app.get("/api/earnings/{company_short_name}")
def get_company_financials(company_short_name: str):
    conn = sqlite3.connect(DB_PATH)
    query = """
        SELECT company_short_name, date, revenue, net_profit, net_profit_margin
        FROM company_earnings_data
        WHERE company_short_name = ?
        AND date >= "2024-01-01"
        ORDER BY date ASC
    """
    df = pd.read_sql_query(query, conn, params=[company_short_name])
    conn.close()
    return df.to_dict(orient="records")