from dependency_injector import containers, providers
from fastapi import FastAPI
from modules.chatbot import Chatbot


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
        ]
    )
    config = providers.Configuration(json_files=["config/config.json"])
    server_config = providers.Resource(config.server)
    gemini_config = providers.Resource(config.gemini)
    logging_config = providers.Resource(config.logging)

    app = providers.Singleton(FastAPI)

    chatbot = providers.Singleton(Chatbot, config=config)
