import os
from dotenv import load_dotenv
import json
from modules.database import Database


load_dotenv()
with open("config/config.json", "r") as f:
    config = json.load(f)
if os.getenv("comicapi"):
    config["host"]["comicapi"] = os.getenv("comicapi")

db = Database(config=config)


def search_database(query: str):
    """Search the database for a specific query.
    Args:
        query (str): The search query.
    Returns:
        dict: page_contents: List of page contents matching the query.
    """
    results = db.search(query)
    data = []
    for r in results:
        data.append(r.page_content)
    return {"page_contents": data}
