import logging
from typing import Dict
from fastapi import FastAPI
import uvicorn
from containers.app_container import AppContainer
from apis.v1.routes import route, health
from dependency_injector.wiring import inject, Provide
from middleware.auth import AuthMiddleware
from modules.chatbot import Chatbot

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
    app.include_router(health.router)

    return app


@inject
def initialize(
    chatbot: Chatbot = Provide[AppContainer.chatbot],
):
    logger = logging.getLogger(FastAPI.__name__)
    logger.info("Initialize successfully")


@inject
def start_app(server_config: dict = Provide[AppContainer.server_config]):
    app = create_app()
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
