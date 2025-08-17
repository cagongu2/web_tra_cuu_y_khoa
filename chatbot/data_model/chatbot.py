from data_model.base import BaseResponse
import json
from typing import Optional

class ChatbotResponse(BaseResponse):
    text: Optional[str] = None
    def __str__(self):
        return f'data: {json.dumps(self.model_dump())}\n\n'
