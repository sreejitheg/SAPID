import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Stub email service that logs send requests."""

    def send_email(self, to: str, subject: str, body: str, session_id: int) -> None:
        logger.info("Email to %s (session %s): %s", to, session_id, subject)
        logger.debug(body)
