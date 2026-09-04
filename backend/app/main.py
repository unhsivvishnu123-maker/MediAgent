from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agent import run_agent


app = FastAPI(
    title="MediAgent API",
    description="Autonomous Healthcare Coordination Agent",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def root():
    return {
        "name": "MediAgent",
        "status": "online",
        "description": "Autonomous Healthcare Coordination Agent"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/api/agent")
def agent(request: ChatRequest):

    result = run_agent(request.message)

    return result