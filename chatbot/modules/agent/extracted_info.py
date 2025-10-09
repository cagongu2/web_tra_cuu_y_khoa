from dotenv import load_dotenv
from google.adk.agents import Agent
from modules.agent.tools import search_database
import json
from google.adk.tools import google_search

from google.adk.tools.agent_tool import AgentTool

load_dotenv()
with open("config/config.json", "r") as f:
    config = json.load(f)


search_agent = Agent(
    model=config["genmini"]["model"],
    name="SearchAgent",
    instruction="""
    You're a spealist in Google Search
    """,
    tools=[
        google_search,
    ],
)

extracted_info_agent = Agent(
    model=config["genmini"]["model"],
    name="Extracted_Info_Agent",
    output_key="extracted_results",
    instruction="""
# Your job is to extract important data from a list of information medical pages.
# Follow these steps in order (be sure to tell the user what you're doing at each
step, but without giving technical details)  
1. Call the search_database tool with the user's query with argument {user_query}.
2. Call the google_search tool with the user's query with argument {user_query} for search information medical in internet.
4. Read the contents of the medical pages and information medical in internet. Then extract detailed information related to the query.
5. Return the extracted information in a JSON format:
```json
{
  "extracted_results": ""
}
```
    """,
    tools=[search_database, AgentTool(agent=search_agent)],
)
