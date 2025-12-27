import logging
from typing import Dict
from fastapi import FastAPI
import uvicorn
from containers.app_container import AppContainer
from apis.v1.routes import route, health
from dependency_injector.wiring import inject, Provide
from middleware.auth import AuthMiddleware
from modules.chatbot import Chatbot
from apis.v1.routes import route, health, chat_routes
from services.chat_service import ChatService

from fastapi.middleware.cors import CORSMiddleware
from starlette.authentication import AuthCredentials, BaseUser, AuthenticationBackend


class BasicAuthBackend(AuthenticationBackend):
    async def authenticate(self, conn):
        return AuthCredentials(["authenticated"]), BaseUser("user")

@inject
def create_app(
    app: FastAPI = Provide[AppContainer.app],
    config: Dict = Provide[AppContainer.config],
):
    # ✅ Add CORS Middleware to FastAPI app (NOT in the router!)
    app.add_middleware(AuthMiddleware, CACHE_EXPIRY=3600)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
        allow_headers=["*"],  # Allow all headers
    )

    app.include_router(route.router)
    app.include_router(chat_routes.router)
    app.include_router(health.router)

    return app

@inject
async def on_startup(
    chat_service: ChatService = Provide[AppContainer.chat_service]
):
    """Khởi tạo kết nối MongoDB khi app start"""
    logger = logging.getLogger(FastAPI.__name__)
    try:
        # Giả sử chat_service.connect() chứa logic kết nối motor/pymongo
        await chat_service.connect() 
        logger.info("MongoDB connected successfully")
    except Exception as e:
        logger.error(f"Failed to connect MongoDB: {e}")


@inject
async def on_shutdown(
    chat_service: ChatService = Provide[AppContainer.chat_service]
):
    """Đóng kết nối MongoDB khi app shutdown"""
    logger = logging.getLogger(FastAPI.__name__)
    await chat_service.disconnect()
    logger.info("MongoDB disconnected")

@inject
def initialize(
    chatbot: Chatbot = Provide[AppContainer.chatbot],
):
    logger = logging.getLogger(FastAPI.__name__)
    logger.info("Initialize successfully")


@inject
def start_app(server_config: dict = Provide[AppContainer.server_config]):
    app = create_app()
    app.add_event_handler("startup", on_startup)
    app.add_event_handler("shutdown", on_shutdown)
    uvicorn.run(
        app,
        host=server_config["host"],
        port=int(server_config["port"]),
        reload=False,
        log_level="debug",
        workers=1,
        factory=False,
        loop="asyncio",
        timeout_keep_alive=120,
    )
