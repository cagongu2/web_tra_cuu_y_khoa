import os
from dotenv import load_dotenv
import httpx
import json

load_dotenv()
with open("config/config.json", "r") as f:
    config = json.load(f)
if os.getenv("comicapi"):
    config["host"]["comicapi"] = os.getenv("comicapi")
