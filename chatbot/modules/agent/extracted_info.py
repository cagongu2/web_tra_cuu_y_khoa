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
# Các bước thực hiện (hãy thông báo cho người dùng bạn đang thực hiện bước nào, nhưng không tiết lộ chi tiết kỹ thuật):
1. Gọi công cụ search_database(query="<text>").
2. Gọi công cụ google_search(request=<text>) với truy vấn của người dùng để tìm kiếm thông tin y tế trên internet.
4. Đọc nội dung của các trang y tế  và thông tin y tế trên internet vừa mới tìm kiếm. Sau đó trích xuất thông tin chi tiết liên quan đến truy vấn.
5. Trả về thông tin đã trích xuất bằng tiếng việt dưới định dạng JSON.:
```json
{
  "extracted_results": ""
}
```
        """,
        tools=[search_database, AgentTool(agent=search_agent)],
    )
