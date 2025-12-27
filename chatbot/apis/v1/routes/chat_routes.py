import logging
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from services.chat_service import ChatService
from dependency_injector.wiring import inject, Provide
from containers.app_container import AppContainer
from pydantic import BaseModel

router = APIRouter(
    prefix="/v1/chats",
    tags=["CHAT_HISTORY"]
)

logger = logging.getLogger(__name__)

class CreateChatResponse(BaseModel):
    chat_id: str
    message: str

class UpdateTitleRequest(BaseModel):
    title: str

@router.post("", response_model=CreateChatResponse)
@inject
async def create_new_chat(
    user_id: int,
    chat_service: ChatService = Depends(Provide[AppContainer.chat_service])
):
    """Tạo chat mới cho user"""
    try:
        chat_id = await chat_service.create_chat(user_id)
        return CreateChatResponse(
            chat_id=chat_id, 
            message="Chat created successfully"
        )
    except Exception as e:
        logger.error(f"Error creating chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
@inject
async def get_user_chats(
    user_id: int,
    chat_service: ChatService = Depends(Provide[AppContainer.chat_service])
):
    """Lấy danh sách tất cả chat của user"""
    try:
        chats = await chat_service.get_user_chats(user_id)
        return {"chats": chats}
    except Exception as e:
        logger.error(f"Error getting user chats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{chat_id}/messages")
@inject
async def get_chat_messages(
    chat_id: str,
    user_id: int,
    chat_service: ChatService = Depends(Provide[AppContainer.chat_service])
):
    """Lấy tất cả messages của một chat"""
    try:
        messages = await chat_service.get_chat_messages(chat_id, user_id)
        if messages is None:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {"messages": messages}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{chat_id}/title")
@inject
async def update_chat_title(
    chat_id: str,
    user_id: int,
    request: UpdateTitleRequest,
    chat_service: ChatService = Depends(Provide[AppContainer.chat_service])
):
    """Cập nhật title của chat"""
    try:
        success = await chat_service.update_chat_title(
            chat_id, user_id, request.title
        )
        if not success:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {"message": "Title updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating chat title: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{chat_id}")
@inject
async def delete_chat(
    chat_id: str,
    user_id: int,
    chat_service: ChatService = Depends(Provide[AppContainer.chat_service])
):
    """Xóa một chat"""
    try:
        success = await chat_service.delete_chat(chat_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {"message": "Chat deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))