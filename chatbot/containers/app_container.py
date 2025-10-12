from dependency_injector import containers, providers
from fastapi import FastAPI
from modules.chatbot import Chatbot
from services.agent_service import AgentService


class AppContainer(containers.DeclarativeContainer):
    """
    App container for managing dependencies.
    """

    wiring_config = containers.WiringConfiguration(
        modules=[
            "config",
            "setting",
            "apis.v1.app",
            "apis.v1.routes.route",
            "apis.v1.routes.health",
            "modules.agent.tools",
        ]
    )
    config = providers.Configuration(json_files=["config/config.json"])

    server_config = providers.Resource(config.server)
    gemini_config = providers.Resource(config.gemini)
    logging_config = providers.Resource(config.logging)
    app = providers.Singleton(FastAPI)
    # Agent service để quản lý tất cả agents
    agent_service = providers.Singleton(AgentService, config=config)

    chatbot = providers.Singleton(Chatbot, config=config, agent_service=agent_service)
