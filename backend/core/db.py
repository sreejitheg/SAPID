
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


def get_or_create_session(session_id: Optional[int]) -> ChatSession:
    """Return an existing ChatSession or create a new one."""
    with get_session() as session:
        if session_id is not None:
            existing = session.get(ChatSession, session_id)
            if existing:
                return existing

        new_session = ChatSession()
        session.add(new_session)
        session.commit()
        session.refresh(new_session)
        return new_session


def add_message(
    session_id: int,
    sender: str,
    content: str,
    llm_intent: Optional[str] = None,
    confidence: Optional[float] = None,
) -> Message:
    """Persist a chat message."""
    with get_session() as session:
        msg = Message(
            session_id=session_id,
            sender=sender,
            content=content,
            llm_intent=llm_intent,
            confidence=confidence,
        )
        session.add(msg)
        session.commit()
        session.refresh(msg)
        return msg

