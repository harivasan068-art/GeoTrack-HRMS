from datetime import datetime
from pydantic import BaseModel


class WorkProofResponse(BaseModel):
    id: int
    attendance_id: int
    employee_id: str
    media_type: str
    file_url: str
    description: str | None = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}
