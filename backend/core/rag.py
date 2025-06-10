
from __future__ import annotations

import os
from typing import List, Tuple
from uuid import uuid4
from urllib.parse import urlparse

import chromadb
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from core.llm import LLM


class RAG:
    """Minimal helper around a Chroma database and an LLM."""

    def __init__(self, llm: LLM, chroma_url: str) -> None:
        self.llm = llm
        parsed = urlparse(chroma_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 8000
        self.client = chromadb.HttpClient(host=host, port=port)

    def _collection(self, name: str):
        return self.client.get_or_create_collection(name)


    def embed_pdf(
        self, path: str, collection_name: str, is_temp: bool, doc_id: str | None = None
    ) -> None:

        """Embed the given PDF into the specified Chroma collection."""

        reader = PdfReader(path)
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        collection = self._collection(collection_name)

        doc_identifier = doc_id or os.path.basename(path)


        for page_number, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            chunks = splitter.split_text(text)
            for chunk_id, chunk in enumerate(chunks):
                embedding = self.llm.embed(chunk)
                metadata = {

                    "doc_id": doc_identifier,

                    "page": page_number,
                    "chunk_id": chunk_id,
                    "text": chunk,
                }
                collection.add(
                    ids=[str(uuid4())],
                    embeddings=[embedding],
                    documents=[chunk],
                    metadatas=[metadata],
                )

        if is_temp:
            os.remove(path)

    def query(
        self, question: str, temp_collection: str | None, top_k: int = 5
    ) -> Tuple[str, List[dict]]:
        """Query the RAG system and return the answer and source metadata."""

        collections = [self._collection("global")]
        if temp_collection:
            collections.append(self._collection(temp_collection))

        docs: List[str] = []
        sources: List[dict] = []
        for coll in collections:
            res = coll.query(
                query_texts=[question],
                n_results=top_k,
                include=["documents", "metadatas"],
            )
            docs.extend(res.get("documents", [[]])[0])
            sources.extend(res.get("metadatas", [[]])[0])

        context = "\n".join(docs)
        messages = [
            {
                "role": "system",
                "content": "Answer the question using the provided context.",
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ]
        answer = self.llm.chat(messages)
        return answer, sources

