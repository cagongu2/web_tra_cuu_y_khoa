import sqlite3
import json
import os
from typing import List, Dict, Any


class MedicalArticleDB:
    def __init__(self, db_path: str = "medical_articles.db"):
        self.db_path = db_path
        self.conn = self._create_connection()
        self._init_db()

    def _create_connection(self) -> sqlite3.Connection:
        """Create a database connection"""
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        """Initialize database tables and indexes"""
        cursor = self.conn.cursor()

        # Create articles table
        cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT,
            specialty TEXT,
            content TEXT NOT NULL,
            categories TEXT,
            updated_at TEXT
        )"""
        )

        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_title ON articles(title)")
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_categories ON articles(categories)"
        )

        self.conn.commit()

    def import_json_file(self, json_file: str):
        """Import a single JSON file into the database"""
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Extract data
            title = data["content"][0]["h1"][0]
            author_info = data["content"][1]["div"][1]
            author = author_info["a"][0] if "a" in author_info else None
            specialty = author_info["div"][0] if "div" in author_info else None
            updated_at = author_info.get("time", [None])[0]
            content = json.dumps(data["content"], ensure_ascii=False)
            categories = json.dumps(data["groupts"], ensure_ascii=False)

            cursor = self.conn.cursor()
            cursor.execute(
                """
            INSERT INTO articles (title, author, specialty, content, categories, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
                (title, author, specialty, content, categories, updated_at),
            )

            self.conn.commit()
            return True
        except Exception as e:
            print(f"Error importing {json_file}: {str(e)}")
            return False

    def import_directory(self, directory: str):
        """Import all JSON files from a directory recursively"""
        success_count = 0
        error_count = 0

        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(".json"):
                    full_path = os.path.join(root, file)
                    if self.import_json_file(full_path):
                        success_count += 1
                    else:
                        error_count += 1

        return success_count, error_count

    def get_article_by_title(self, title: str) -> Dict[str, Any]:
        """Retrieve an article by its title"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM articles WHERE title = ?", (title,))
        row = cursor.fetchone()

        if row:
            return {
                "id": row[0],
                "title": row[1],
                "author": row[2],
                "specialty": row[3],
                "content": json.loads(row[4]),
                "categories": json.loads(row[5]),
                "updated_at": row[6],
            }
        return None

    def get_articles_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Retrieve all articles in a category"""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT * FROM articles WHERE categories LIKE ?", (f"%{category}%",)
        )

        articles = []
        for row in cursor.fetchall():
            articles.append(
                {
                    "id": row[0],
                    "title": row[1],
                    "author": row[2],
                    "specialty": row[3],
                    "content": json.loads(row[4]),
                    "categories": json.loads(row[5]),
                    "updated_at": row[6],
                }
            )
        return articles

    def close(self):
        """Close the database connection"""
        if self.conn:
            self.conn.close()


# Usage example
if __name__ == "__main__":
    db = MedicalArticleDB()
    # Import all JSON files from data directory
    success, errors = db.import_directory("data")
    print(f"Successfully imported {success} files, {errors} errors")

    # Example queries
    article = db.get_article_by_title("Viêm da dầu: Bệnh lý gây khó chịu vào mùa đông")
    if article:
        print(f"Found article: {article['title']} by {article['author']}")

    articles = db.get_articles_by_category("Da liễu")
    print(f"Found {len(articles)} articles in Da liễu category")

    db.close()
