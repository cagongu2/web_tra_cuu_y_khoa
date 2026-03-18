from google.adk.agents import Agent
from modules.agent.tools import DatabaseSearchTool
from google.adk.tools import google_search
from google.adk.tools.agent_tool import AgentTool


def create_search_agent(config: dict) -> Agent:
    return Agent(
        model=config["genmini"]["model"],
        name="SearchAgent",
        instruction="""
        You're a spealist in Google Search
        """,
        tools=[
            google_search,
        ],
    )


def create_extracted_info_agent(config: dict) -> Agent:
    search_agent = create_search_agent(config)
    search_database = DatabaseSearchTool(config)
    return Agent(
        model=config["genmini"]["model"],
        name="Extracted_Info_Agent",
        output_key="extracted_results",
        instruction="""
# Công việc của bạn là trích xuất thông tin quan trọng từ danh sách các trang thông tin y tế.
# QUY TẮC BẮT BUỘC:
1. GỌI công cụ search_database(query="<text>") ĐẦU TIÊN để tìm trong CSDL.
2. Kiểm tra log từ database, mỗi kết quả đều có "similarity_score" (khoảng cách L2, càng gần 0 càng tốt).
3. NẾU database KHÔNG CÓ thông tin hoặc điểm không đủ tốt, VÀ CHỈ KHI ĐÓ, mới gọi SearchAgent(input="<text>") để tìm kiếm web.
4. Trả về thông tin bằng tiếng Việt dưới định dạng JSON sau:
```json
{
  "extracted_results": "<nội dung tìm được>",
  "source": "<chỉ định rõ 'Dữ liệu Y khoa nội bộ' hoặc 'Google Search'>",
  "similarity_score": "<Ghi điểm tương thích cao nhất lấy từ thông tin database, ví dụ: 0.85, hoặc 'N/A' nếu từ Google Search>"
}
```
        """,
        tools=[search_database, AgentTool(agent=search_agent)],
    )
