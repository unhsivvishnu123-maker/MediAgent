import os
from dotenv import load_dotenv

load_dotenv()


OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY"
)

OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-4o-mini"
)

OPENAI_BASE_URL = os.getenv(
    "OPENAI_BASE_URL"
)


if not OPENAI_API_KEY:

    raise ValueError(
        "OPENAI_API_KEY is missing in .env"
    )