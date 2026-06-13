from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time

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

# LabTestCatalog Schemas
class LabTestCatalogCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    reference_range: Optional[str] = None
    unit: Optional[str] = None

class LabTestCatalogOut(BaseModel):
    id: str
    lab_id: str
    name: str
    description: Optional[str] = None
    price: float
    reference_range: Optional[str] = None
    unit: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# LabAppointment Schemas
class LabAppointmentCreate(BaseModel):
    pet_id: str
    lab_id: str
    test_id: str
    scheduled_date: date
    scheduled_time: time
    notes: Optional[str] = None

class LabAppointmentOut(BaseModel):
    id: str
    client_id: str
    pet_id: str
    lab_id: str
    test_id: str
    scheduled_date: date
    scheduled_time: time
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
