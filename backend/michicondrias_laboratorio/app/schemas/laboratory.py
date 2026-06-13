from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LabResultBase(BaseModel):
    parameter_name: str
    measured_value: float
    reference_range: Optional[str] = None
    unit: Optional[str] = None
    is_anomaly: Optional[bool] = False
    pdf_report_url: Optional[str] = None

class LabResultCreateItem(BaseModel):
    parameter_name: str
    measured_value: float
    reference_range: Optional[str] = None
    unit: Optional[str] = None
    is_anomaly: Optional[bool] = False

class LabResultsUpload(BaseModel):
    pdf_report_url: Optional[str] = None
    results: List[LabResultCreateItem]

class LabResultOut(LabResultBase):
    id: str
    order_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class LabOrderBase(BaseModel):
    pet_id: str
    lab_id: str
    test_names: List[str]

class LabOrderCreate(LabOrderBase):
    pass

class LabOrderOut(LabOrderBase):
    id: str
    requesting_vet_id: Optional[str] = None
    status: str
    created_at: datetime
    results: List[LabResultOut] = []

    class Config:
        from_attributes = True
