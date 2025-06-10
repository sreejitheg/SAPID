
from __future__ import annotations

import os
from contextlib import contextmanager
from datetime import datetime
from typing import Iterator, Optional


from sqlmodel import Field, SQLModel, Session, create_engine, delete, select


DATABASE_URL = os.getenv("POSTGRES_URL", "sqlite:///./local.db")

engine = create_engine(DATABASE_URL, echo=False)


class ChatSession(SQLModel, table=True):
    __tablename__ = "chat_session"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)



class Conversation(SQLModel, table=True):
    __tablename__ = "conversation"

    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="chat_session.id")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_message"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")

    sender: str
    content: str
    llm_intent: Optional[str] = None
    confidence: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)



class Document(SQLModel, table=True):
    __tablename__ = "document"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str
    size: int
    uploaded_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    session_id: Optional[int] = Field(default=None, foreign_key="chat_session.id")



class FormSubmission(SQLModel, table=True):
    __tablename__ = "form_submission"

    id: Optional[int] = Field(default=None, primary_key=True)
    form_id: str
    session_id: int = Field(foreign_key="chat_session.id")
    data: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

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


def create_session() -> ChatSession:
    """Explicitly create a new chat session."""
    with get_session() as session:
        new_session = ChatSession()
        session.add(new_session)
        session.commit()
        session.refresh(new_session)
        return new_session


def delete_session(session_id: int) -> None:
    """Delete a chat session and its messages."""
    with get_session() as session:

        conv_ids = [c.id for c in session.exec(select(Conversation.id).where(Conversation.session_id == session_id))]
        if conv_ids:
            session.exec(delete(ChatMessage).where(ChatMessage.conversation_id.in_(conv_ids)))
            session.exec(delete(Conversation).where(Conversation.id.in_(conv_ids)))

        session.exec(delete(ChatSession).where(ChatSession.id == session_id))
        session.commit()



def create_conversation(session_id: int) -> Conversation:
    """Create a new conversation for a session."""
    with get_session() as session:
        conv = Conversation(session_id=session_id)
        session.add(conv)
        session.commit()
        session.refresh(conv)
        return conv


def list_conversations(session_id: Optional[int] = None) -> list[Conversation]:
    with get_session() as session:
        stmt = select(Conversation)
        if session_id is not None:
            stmt = stmt.where(Conversation.session_id == session_id)
        return session.exec(stmt).all()


def delete_conversation(conversation_id: int) -> None:
    with get_session() as session:
        session.exec(delete(ChatMessage).where(ChatMessage.conversation_id == conversation_id))
        session.exec(delete(Conversation).where(Conversation.id == conversation_id))
        session.commit()


def get_conversation(conversation_id: int) -> Conversation | None:
    with get_session() as session:
        return session.get(Conversation, conversation_id)


def get_messages(conversation_id: int) -> list[ChatMessage]:
    with get_session() as session:
        stmt = select(ChatMessage).where(ChatMessage.conversation_id == conversation_id)
        return session.exec(stmt).all()


def add_message(
    conversation_id: int,

    sender: str,
    content: str,
    llm_intent: Optional[str] = None,
    confidence: Optional[float] = None,

) -> ChatMessage:
    """Persist a chat message."""
    with get_session() as session:
        msg = ChatMessage(
            conversation_id=conversation_id,

            sender=sender,
            content=content,
            llm_intent=llm_intent,
            confidence=confidence,
        )
        session.add(msg)
        session.commit()
        session.refresh(msg)
        return msg



def add_document(name: str, type: str, size: int, session_id: Optional[int]) -> Document:
    with get_session() as session:
        doc = Document(name=name, type=type, size=size, session_id=session_id)
        session.add(doc)
        session.commit()
        session.refresh(doc)
        return doc


def list_documents(session_id: Optional[int] = None) -> list[Document]:
    with get_session() as session:
        stmt = select(Document)
        if session_id is not None:
            stmt = stmt.where(Document.session_id == session_id)
        return session.exec(stmt).all()


def get_document(doc_id: int) -> Document | None:
    with get_session() as session:
        return session.get(Document, doc_id)


def delete_document(doc_id: int) -> None:
    with get_session() as session:
        session.exec(delete(Document).where(Document.id == doc_id))
        session.commit()



def add_form_submission(form_id: str, session_id: int, data: str) -> FormSubmission:
    """Store a submitted form."""
    with get_session() as session:
        sub = FormSubmission(form_id=form_id, session_id=session_id, data=data)
        session.add(sub)
        session.commit()
        session.refresh(sub)
        return sub

