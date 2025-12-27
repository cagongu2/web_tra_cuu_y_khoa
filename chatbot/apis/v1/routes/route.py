import logging
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from data_model.chatbot import ChatbotResponse
from modules.chatbot import Chatbot
from services.chat_service import ChatService
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
    chat_id: str,  # Thêm chat_id parameter
    chatbot: Chatbot = Depends(Provide[AppContainer.chatbot]),
    chat_service: ChatService = Depends(Provide[AppContainer.chat_service])
):
    async def generate_response():
        try:
            # 1. Lưu user message vào MongoDB
            await chat_service.add_message(chat_id, user_id, "user", query)
            
            # 2. Kiểm tra xem đây có phải message đầu tiên không
            messages = await chat_service.get_chat_messages(chat_id, user_id)
            if messages and len(messages) == 2:  # welcome message + user first message
                # Cập nhật title = câu hỏi đầu tiên
                await chat_service.update_chat_title(
                    chat_id, user_id, query[:50]
                )
            
            # 3. Stream response từ chatbot
            full_response = ""
            response = chatbot.chat_with_agent(user_id, query)
            
            async for text in response:
                full_response += text
                yield str(
                    ChatbotResponse(status_code=200, text=text, message="Success")
                )
            
            # 4. Lưu assistant response vào MongoDB
            if full_response:
                await chat_service.add_message(
                    chat_id, user_id, "assistant", full_response
                )

            # 5. Gửi signal kết thúc
            yield str(
                ChatbotResponse(
                    status_code=200, text="[DONE]", message="Chat completed"
                )
            )

        except Exception as e:
            logger.error(f"Error in chatbot stream: {e}")
            yield str(ChatbotResponse(status_code=500, text="", message=str(e)))

    return StreamingResponse(generate_response(), media_type="text/event-stream")