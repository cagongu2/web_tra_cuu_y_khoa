import os

from dotenv import load_dotenv
from fastapi import Request
from fastapi.responses import JSONResponse

# import multiprocessing
from apis.v1.app import start_app, create_app
from containers.app_container import AppContainer
import ast
from setting import setup_server

load_dotenv()


app_container = AppContainer()
# Tải các biến từ file .env
app_container = AppContainer()
app_container.config.verbose.from_env("verbose")
app_container.config.genmini.api.from_value(ast.literal_eval(os.getenv("api_key")))
app_container.config.database.path.from_env("faiss_path")

setup_server()


app = create_app()
if __name__ == "__main__":
    # multiprocessing.set_start_method("spawn")
    start_app()
