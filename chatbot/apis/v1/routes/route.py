import logging
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from data_model.chatbot import ChatbotResponse
from modules.chatbot import Chatbot
from dependency_injector.wiring import inject, Provide
from containers.app_container import AppContainer

router = APIRouter(
    prefix="/v1",
    responses={404: {"description": "Not found"}, 500: {"description": "server error"}},
)
logger = logging.getLogger("route")


@router.get(path="/chatbot", tags=["CHATBOT"])
@inject
async def chatbot(
    query: str,
    user_id: int,
    chatbot: Chatbot = Depends(Provide[AppContainer.chatbot]),
):
    async def generate_response():
        try:
            response = chatbot.chat_with_agent(user_id, query)
            async for text in response:

                yield str(
                    ChatbotResponse(status_code=200, text=text, message="Success")
                )

            yield str(
                ChatbotResponse(
                    status_code=200, text="[DONE]", message="Chat completed"
                )
            )

        except Exception as e:

            yield str(ChatbotResponse(status_code=500, text="", message=str(e)))

    return StreamingResponse(generate_response(), media_type="text/event-stream")
