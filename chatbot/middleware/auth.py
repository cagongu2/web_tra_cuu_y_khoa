import time
from fastapi import FastAPI, Request
from dependency_injector.wiring import inject, Provide
from containers.app_container import AppContainer
from modules.validateauth import ValidateAuth
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
class AuthMiddleware(BaseHTTPMiddleware):
    @inject
    def __init__(self, app: FastAPI,CACHE_EXPIRY:int=3600, validateauth: ValidateAuth = Provide[AppContainer.validateauth]):
        super().__init__(app)
        self.validateauth = validateauth
        self.TOKEN_CACHE = dict()
        self.CACHE_EXPIRY = CACHE_EXPIRY 
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/public") or request.url.path in ["/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)
        request.state.user_id = 1  
        return await call_next(request)
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"message": "Unauthorized"})
        
        current_time=time.time()
        if auth_header in self.TOKEN_CACHE:
            user_id, expiry_time = self.TOKEN_CACHE[auth_header]
            if current_time < expiry_time:  # Kiểm tra thời gian hết hạn
                request.state.user_id = user_id
                return await call_next(request)
        user_id = self.validateauth.validate(auth_header)
       
        
        if not user_id:
            return JSONResponse(status_code=401, content={"message": "Invalid or expired token"})
        self.TOKEN_CACHE[auth_header] = (user_id, current_time + self.CACHE_EXPIRY)
        request.state.user_id = user_id  
        return await call_next(request)