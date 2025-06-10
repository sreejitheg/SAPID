class IncidentAPI:
    """Stub for interacting with an external incident management API."""

    def get_incidents(self):
        return []

    def collect(self, session_id: int, text: str, intent: str) -> None:
        """Send incident-related text to the external system."""
        # This is a stub for future integration.
        return None
