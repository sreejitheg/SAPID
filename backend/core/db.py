from __future__ import annotations

import os
from contextlib import contextmanager
from datetime import datetime
from typing import Iterator, Optional

from sqlmodel import Field, SQLModel, Session, create_engine

DATABASE_URL = os.getenv("POSTGRES_URL", "sqlite:///./local.db")

engine = create_engine(DATABASE_URL, echo=False)


class ChatSession(SQLModel, table=True):
    __tablename__ = "chat_session"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class Message(SQLModel, table=True):
    __tablename__ = "message"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="chat_session.id")
    sender: str
    content: str
    llm_intent: Optional[str] = None
    confidence: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)


@contextmanager
def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session

