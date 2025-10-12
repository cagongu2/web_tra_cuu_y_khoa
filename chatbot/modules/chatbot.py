# import psycopg2
import os
from typing import Dict, List, Union
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_fixed
from modules.agent.agent import root_agent
import httpx
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.memory import InMemoryMemoryService
from google.genai.types import Content, Part

load_dotenv()


class Chatbot:
    _cache_memory: Dict[int, InMemoryMemoryService] = {}

    def __init__(self, config: dict):

        self.config = config
        self.device = config["device"]
        self.verbose = config["verbose"]
        self.config_geminai = config["genmini"]
        self.current_account_index = 0
        self.session_service = InMemorySessionService()
        self._initialize_chat()

    def _initialize_chat(self):
        print("api thứ", self.current_account_index)
        self.current_account_index = (self.current_account_index + 1) % len(
            self.config_geminai["api"]
        ) - 1
        api_key = self.config_geminai["api"][self.current_account_index]
        os.environ["GOOGLE_API_KEY"] = api_key

        self.current_account_index += 1

    @retry(stop=stop_after_attempt(5), wait=wait_fixed(5))
    async def chat_with_agent(self, user_id: int, messages: str):
        user_id = str(user_id)
        try:
            if user_id not in self._cache_memory:

                session = await self.session_service.create_session(
                    app_name="MoiBot", user_id=user_id, session_id="sess1"
                )
                memory_service = InMemoryMemoryService()
                self._cache_memory[user_id] = memory_service
            memory_service = self._cache_memory[user_id]

            runner = Runner(
                app_name="MoiBot",
                agent=root_agent,
                session_service=self.session_service,
                memory_service=memory_service,
            )
            content = Content(role="user", parts=[Part(text=messages)])
            async for event in runner.run_async(
                user_id=user_id, session_id="sess1", new_message=content
            ):
                # if event.is_final_response():
                # print("Agent trả lời:",event )

                for part in event.content.parts:
                    if part.text:
                        yield part.text

        except Exception as e:
            print(f"[Retry] Lỗi khi xử lý: {e}")
            self._initialize_chat()
            raise e
