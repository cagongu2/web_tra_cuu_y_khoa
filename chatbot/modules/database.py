from dotenv import load_dotenv
import os
from modules.embedding import RotatingEmbeddings
from langchain_community.vectorstores import FAISS


class Database:
    def __init__(self, config: dict):
        self.config = config

        self.collection = None
        self.index = None
        self.db_path = config.get("database", {}).get("path", None)
        self.api_keys = config.get("genmini", {}).get("api", [])
        self.model_name = config.get("genmini", {}).get(
            "model", "models/gemini-embedding-001"
        )

        self.connect(db_path=self.db_path)

    def connect(self, db_path: str = None):
        if db_path:
            self.embeddings = RotatingEmbeddings(
                api_keys=self.api_keys, model_name=self.model_name
            )
            self.index = FAISS.load_local(
                db_path, self.embeddings, allow_dangerous_deserialization=True
            )
        else:
            raise ValueError("Database connection path is not provided.")
