from dependency_injector import containers, providers
from fastapi import FastAPI
from modules.chatbot import Chatbot
from services.agent_service import AgentService
from services.chat_service import ChatService


class AppContainer(containers.DeclarativeContainer):

    wiring_config = containers.WiringConfiguration(
        modules=[
            "config",
            "setting",
            "apis.v1.app",
            "apis.v1.routes.route",
            "apis.v1.routes.chat_routes",
            "apis.v1.routes.health",
            "modules.agent.tools",
        ]
    )

    config = providers.Configuration(json_files=["config/config.json"])

    server_config = providers.Singleton(config.server)
    gemini_config = providers.Singleton(config.gemini)
    logging_config = providers.Singleton(config.logging)
    mongodb_config = providers.Singleton(config.mongodb)

    app = providers.Singleton(FastAPI)

    agent_service = providers.Singleton(
        AgentService,
        config=config
    )

    chat_service = providers.Singleton(
        ChatService,
        mongodb_url=mongodb_config.provided["url"],
        db_name=mongodb_config.provided["db_name"]
    )


    chatbot = providers.Singleton(
        Chatbot,
        config=config,
        agent_service=agent_service
    )
