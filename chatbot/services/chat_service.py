import logging
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from models.chat import ChatHistory, Message
from bson import ObjectId
from datetime import datetime

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self, mongodb_url: str, db_name: str):
        self.mongodb_url = mongodb_url
        self.db_name = db_name
        self.client = None
        self.db = None
        self.collection = None

    async def connect(self):
        """Khởi tạo kết nối MongoDB"""
        try:
            self.client = AsyncIOMotorClient(self.mongodb_url)
            self.db = self.client[self.db_name]
            self.collection = self.db["chat_histories"]
            
            # Tạo index để tăng hiệu suất query
            await self.collection.create_index([("user_id", 1)])
            await self.collection.create_index([("updated_at", -1)])
            
            logger.info(f"Connected to MongoDB: {self.db_name}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def disconnect(self):
        """Đóng kết nối MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    async def create_chat(self, user_id: int) -> str:
        """Tạo chat mới"""
        chat = ChatHistory(
            user_id=user_id,
            title="Chat mới",
            messages=[
                Message(
                    role="assistant",
                    content="Xin chào! Tôi có thể giúp gì cho bạn?"
                )
            ]
        )
        result = await self.collection.insert_one(
            chat.dict(by_alias=True, exclude={"id"})
        )
        logger.info(f"Created new chat for user {user_id}: {result.inserted_id}")
        return str(result.inserted_id)

    async def get_user_chats(self, user_id: int, limit: int = 50) -> List[dict]:
        """Lấy danh sách chat của user"""
        cursor = self.collection.find(
            {"user_id": user_id}
        ).sort("updated_at", -1).limit(limit)
        
        chats = []
        async for doc in cursor:
            chats.append({
                "id": str(doc["_id"]),
                "title": doc["title"],
                "lastMessage": self._format_time(doc["updated_at"]),
                "createdAt": doc["created_at"].isoformat(),
                "messageCount": len(doc.get("messages", []))
            })
        
        logger.info(f"Retrieved {len(chats)} chats for user {user_id}")
        return chats

    async def get_chat_messages(self, chat_id: str, user_id: int) -> Optional[List[dict]]:
        """Lấy messages của một chat"""
        try:
            chat = await self.collection.find_one({
                "_id": ObjectId(chat_id),
                "user_id": user_id
            })
            
            if not chat:
                logger.warning(f"Chat {chat_id} not found for user {user_id}")
                return None
            
            messages = [
                {
                    "role": msg["role"],
                    "content": msg["content"],
                    "timestamp": msg["timestamp"].isoformat()
                }
                for msg in chat["messages"]
            ]
            
            logger.info(f"Retrieved {len(messages)} messages from chat {chat_id}")
            return messages
        except Exception as e:
            logger.error(f"Error getting messages for chat {chat_id}: {e}")
            return None

    async def add_message(self, chat_id: str, user_id: int, role: str, content: str) -> bool:
        """Thêm message vào chat"""
        try:
            message = Message(role=role, content=content)
            
            result = await self.collection.update_one(
                {"_id": ObjectId(chat_id), "user_id": user_id},
                {
                    "$push": {"messages": message.dict()},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"Added {role} message to chat {chat_id}")
                return True
            else:
                logger.warning(f"Failed to add message to chat {chat_id}")
                return False
        except Exception as e:
            logger.error(f"Error adding message to chat {chat_id}: {e}")
            return False

    async def update_chat_title(self, chat_id: str, user_id: int, title: str) -> bool:
        """Cập nhật title của chat"""
        try:
            result = await self.collection.update_one(
                {"_id": ObjectId(chat_id), "user_id": user_id},
                {
                    "$set": {
                        "title": title[:100],  # Giới hạn 100 ký tự
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                logger.info(f"Updated title for chat {chat_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error updating title for chat {chat_id}: {e}")
            return False

    async def delete_chat(self, chat_id: str, user_id: int) -> bool:
        """Xóa chat"""
        try:
            result = await self.collection.delete_one({
                "_id": ObjectId(chat_id),
                "user_id": user_id
            })
            
            if result.deleted_count > 0:
                logger.info(f"Deleted chat {chat_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting chat {chat_id}: {e}")
            return False

    def _format_time(self, dt: datetime) -> str:
        """Format thời gian hiển thị"""
        now = datetime.utcnow()
        diff = now - dt
        
        if diff.days == 0:
            hours = diff.seconds // 3600
            if hours == 0:
                minutes = diff.seconds // 60
                return f"{minutes} phút trước" if minutes > 0 else "Vừa xong"
            return f"{hours} giờ trước"
        elif diff.days == 1:
            return "Hôm qua"
        elif diff.days < 7:
            return f"{diff.days} ngày trước"
        else:
            return dt.strftime("%d/%m/%Y")