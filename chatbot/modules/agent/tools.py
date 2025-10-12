import logging
from google.adk.tools import FunctionTool
from modules.database import Database  # Import lớp Database của bạn

logger = logging.getLogger(__name__)


class DatabaseSearchTool(FunctionTool):
    # Khai báo hàm _run_impl là hàm mà LLM sẽ gọi
    def search_database(self, query: str) -> dict:
        """
        Search the knowledge database for relevant information.
        Use this tool to answer questions about internal knowledge or documents.

        Args:
            query (str): The specific question or search term to look up in the database.
        """
        # Sử dụng đối tượng database đã được lưu trong self
        logger.info(f"search_database - query: {query}")

        if self.database.index is None:
            return {"page_contents": ["Database index not available"]}

        results = self.database.index.similarity_search(query, k=2)
        data = [r.page_content for r in results]
        logger.info(f"search_database - query: {query}, results: {data}")
        return {"page_contents": data}

    def __init__(self, config: Database):
        # Lưu dependency vào instance của class
        self.database = Database(config)

        # Gọi hàm khởi tạo của lớp cha
        # Tên và mô tả (docstring của database_search) sẽ được ADK tự động lấy
        super().__init__(func=self.search_database)
