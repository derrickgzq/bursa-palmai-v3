from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta, date
from bs4 import BeautifulSoup
from typing import Dict, Any
import yfinance as yf
import sqlite3
import os
import pandas as pd
import psutil, os, time
import re
import requests
import time

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

# news display
@app.get("/api/news")
def get_news():
    def format_description(text: str) -> str:
        # Replace "palmoil" with "palm oil"
        text = re.sub(r'(?i)\bpalmoil\b', 'palm oil', text)

        # Insert a space if words are glued: e.g. "palmOil" -> "palm Oil"
        text = re.sub(r'(?i)(palm)([A-Z])', r'palm \2', text)
        text = re.sub(r'(?i)(oil)([A-Z])', r'oil \2', text)

        # Fix missing spaces like "...palmoilexports" -> "...palm oil exports"
        text = re.sub(r'(?i)(palm)\s?(oil)', r'palm oil', text)

        # Capitalize if "palm" starts a sentence
        text = re.sub(r'(^|\.\s+)(palm)', lambda m: m.group(1) + "Palm", text, flags=re.IGNORECASE)

        return text

    def contains_relevant_keyword(text):
        keywords = [
            "palm oil", "oil palm", "fcpo", "plantation", 
            "crude palm oil", "cpo", "kernel", "fresh fruit bunch",
            "palm", "oilpalm", "palmoil"
        ]
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in keywords)

    today_str = date.today().strftime("%Y-%m-%d")
    offsets = [0, 10, 20, 30]  # Extend as needed
    data = []

    for offset in offsets:
        url = f"https://theedgemalaysia.com/news-search-results?keywords=palm%20oil&to={today_str}&from=1999-01-01&language=english&offset={offset}"
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        news_items = soup.find_all('div', class_='NewsList_newsListText__hstO7')

        for item in news_items:
            a_tag = item.find('a', href=True)
            headline_tag = item.find('span', class_='NewsList_newsListItemHead__dg7eK')
            description_tag = item.find('span', class_='NewsList_newsList__2fXyv')

            parent = item.parent
            date_tag = parent.find('div', class_='NewsList_infoNewsListSubMobile__SPmAG') # type: ignore
            publish_date = None
            if date_tag is not None:
                span = date_tag.find('span')
                if span is not None:
                    publish_date = span.get_text(strip=True)

            img_tag = item.find_previous_sibling('div')
            img_tag = img_tag.find('img', class_='NewsList_newsImage__j_h0a') if img_tag else None

            if a_tag and headline_tag and description_tag:
                headline = headline_tag.get_text(strip=True)

                if not contains_relevant_keyword(headline):
                    continue

                link = str(a_tag['href'])
                if link.startswith('/'):
                    link = f"https://theedgemalaysia.com{link}"

                description = format_description(description_tag.get_text(strip=True))
                image_url = img_tag['src'] if img_tag else None

                #sentiment, score = analyze_sentiment(headline)

                data.append({
                    'headline': headline,
                    'link': link,
                    'description': description,
                    'image_url': image_url,
                    'published': publish_date
                    #,
                    #'sentiment': sentiment,
                    #'score': round(score, 4)
                })

    return {"news": data}

@app.get("/api/company/{company_short_name}")
def get_company(company_short_name: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM company_master_table WHERE company_short_name = ?", (company_short_name.upper(),))
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

@app.get("/api/shareprice/{company_short_name}")
def get_company_price_data(company_short_name: str):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT company_stock_code FROM company_master_table WHERE company_short_name = ?", (company_short_name.upper(),))
    row = cur.fetchone()
    conn.close()

    if not row:
        return {"error": f"Company '{company_short_name}' not found in database."}

    stock_code = f"{row['company_stock_code']}.KL"

    end = datetime.today()
    start = end - timedelta(days=30)
    data = yf.download(stock_code, start=start, end=end)

    if data.empty: #type: ignore
        return {"error": f"No data found for stock code {stock_code}"}

    if isinstance(data.columns, pd.MultiIndex): #type: ignore
        data.columns = data.columns.droplevel(1) #type: ignore

    dates = list(data.index.strftime('%Y-%m-%d')) #type: ignore
    prices = [round(p, 2) for p in data['Close'].tolist()]  # type: ignore
    return {"dates": dates, "prices": prices}

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

@app.get("/api/company/sankey/{company_short_name}")
def get_company_sankey(company_short_name: str) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("""
        SELECT date, source, target, value
        FROM company_financials_data
        WHERE company_short_name = ?
        ORDER BY date DESC
        LIMIT 100
    """, (company_short_name.upper(),))
    rows = cur.fetchall()
    conn.close()

    if not rows:
        return {"nodes": [], "links": []}

    # Collect unique node names
    node_names = set()
    for r in rows:
        node_names.add(r["source"])
        node_names.add(r["target"])

    # Create node list
    node_list = sorted(list(node_names))  # sorted for consistent order
    node_index = {name: i for i, name in enumerate(node_list)}

    # Build links array
    links = []
    for r in rows:
        source_idx = node_index[r["source"]]
        target_idx = node_index[r["target"]]
        links.append({
            "source": source_idx,
            "target": target_idx,
            "value": float(r["value"])  # ensure numeric
        })

    return {
        "nodes": [{"name": name} for name in node_list],
        "links": links
    }
