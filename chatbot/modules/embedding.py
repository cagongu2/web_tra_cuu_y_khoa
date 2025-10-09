from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import JSONLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from tenacity import retry, stop_after_attempt, wait_exponential


class RotatingEmbeddings:
    def __init__(self, api_keys: list[str], model="models/gemini-embedding-001"):
        self.api_keys = api_keys
        self.model = model
        self.index = 0
        self.emb = self._make_embedding()

    def _make_embedding(self):
        return GoogleGenerativeAIEmbeddings(
            google_api_key=self.api_keys[self.index], model=self.model
        )

    def _rotate_key(self):
        self.index = (self.index + 1) % len(self.api_keys)
        print(f"⚠️ API key bị limit. Đang chuyển sang key {self.index}")
        self.emb = self._make_embedding()

    @retry(
        stop=stop_after_attempt(4),
        wait=wait_exponential(multiplier=1, min=40, max=60),
    )
    def embed_query(self, text):
        try:
            return self.emb.embed_query(text)
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                self._rotate_key()
                raise e  # để tenacity retry
            else:
                raise e

    @retry(
        stop=stop_after_attempt(4),
        wait=wait_exponential(multiplier=1, min=40, max=60),
    )
    def embed_documents(self, texts):
        try:
            return self.emb.embed_documents(texts)
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                self._rotate_key()
                raise e
            else:
                raise e

    def __call__(self, text):
        return self.embed_query(text)
