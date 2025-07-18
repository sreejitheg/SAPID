from __future__ import annotations

import json
from typing import List, Tuple

import requests


class LLM:
    """Simple client for interacting with an LLM service."""

    def __init__(self, base_url: str, chat_model: str, embed_model: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.chat_model = chat_model
        self.embed_model = embed_model

        # Ensure the required models are available on the Ollama server. If a
        # model is missing, attempt to pull it using the API so the first
        # request doesn't fail because of a missing model.
        for model in {self.chat_model, self.embed_model}:
            self._ensure_model(model)

    def _ensure_model(self, model: str) -> None:
        """Verify *model* exists on the server and pull it if missing."""
        try:
            resp = requests.get(f"{self.base_url}/api/tags")
            resp.raise_for_status()
            models = [m.get("name") for m in resp.json().get("models", [])]
            if model in models:
                return
        except Exception:
            # If we can't check, just skip pulling to avoid raising during init
            return

        try:
            # Pull the model; the API streams progress line by line which we
            # simply consume and ignore.
            resp = requests.post(
                f"{self.base_url}/api/pull",
                json={"name": model},
                stream=True,
            )
            resp.raise_for_status()
            for _ in resp.iter_lines():
                pass
        except Exception:
            # Swallow errors so initialization doesn't fail if the pull fails
            pass

    def embed(self, text: str) -> List[float]:
        """Return the embedding vector for *text* using the embed model."""
        url = f"{self.base_url}/api/embeddings"
        resp = requests.post(url, json={"model": self.embed_model, "prompt": text})
        resp.raise_for_status()
        data = resp.json()
        if "embedding" in data:
            return data["embedding"]
        # Fallback to OpenAI style {data:[{embedding:[]}]}
        return data.get("data", [{}])[0].get("embedding", [])

    def chat(self, messages: List[dict]) -> str:
        """Chat with the model using OpenAI formatted messages."""
        url = f"{self.base_url}/api/chat"
        payload = {"model": self.chat_model, "messages": messages}
        resp = requests.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, dict):
            if "message" in data and isinstance(data["message"], dict):
                return data["message"].get("content", "")
            if "choices" in data:
                return data["choices"][0]["message"]["content"]
        return str(data)

    def classify_intent(self, text: str) -> Tuple[str, float]:
        """Classify the intent of *text* using the chat model."""
        system = (
            "You are an intent classifier. Respond with JSON of the form "
            "{\"intent\":<intent>,\"confidence\":<score>} where confidence is "
            "between 0 and 1."
        )
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": text},
        ]
        response = self.chat(messages)
        try:
            result = json.loads(response)
            return result.get("intent", ""), float(result.get("confidence", 0))
        except Exception:
            return response.strip(), 0.0
