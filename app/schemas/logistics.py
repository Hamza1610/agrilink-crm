from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from enum import Enum


class LogisticsStatus(Enum):
	REQUESTED = "requested"
	CONFIRMED = "confirmed"
	IN_TRANSIT = "in_transit"
	DELAYED = "delayed"
	COMPLETED = "completed"
	FAILED = "failed"
	CANCELLED = "cancelled"


class TransportType(Enum):
	TRUCK_SMALL = "truck_small"
	TRUCK_MEDIUM = "truck_medium"
	TRUCK_LARGE = "truck_large"
	VAN = "van"
	MOTORCYCLE = "motorcycle"


class LogisticsRequestCreate(BaseModel):
	pickup_location: str
	pickup_description: Optional[str] = None
	dropoff_location: str
	dropoff_description: Optional[str] = None
	scheduled_pickup: datetime
	estimated_delivery: Optional[datetime] = None
	transport_type: Optional[TransportType] = TransportType.TRUCK_SMALL
	estimated_cost: Optional[float] = None
	status: Optional[LogisticsStatus] = LogisticsStatus.REQUESTED
	contact_person: Optional[str] = None
	contact_phone: Optional[str] = None
	vehicle_plate: Optional[str] = None
	notes: Optional[str] = None


class LogisticsRequestUpdate(BaseModel):
	pickup_location: Optional[str] = None
	pickup_description: Optional[str] = None
	dropoff_location: Optional[str] = None
	dropoff_description: Optional[str] = None
	scheduled_pickup: Optional[datetime] = None
	estimated_delivery: Optional[datetime] = None
	transport_type: Optional[TransportType] = None
	estimated_cost: Optional[float] = None
	status: Optional[LogisticsStatus] = None
	contact_person: Optional[str] = None
	contact_phone: Optional[str] = None
	vehicle_plate: Optional[str] = None
	notes: Optional[str] = None


class LogisticsRequestResponse(BaseModel):
	id: str
	transaction_id: str
	pickup_location: str
	pickup_description: Optional[str] = None
	dropoff_location: str
	dropoff_description: Optional[str] = None
	scheduled_pickup: datetime
	estimated_delivery: Optional[datetime] = None
	transport_type: TransportType
	estimated_cost: Optional[float] = None
	actual_pickup: Optional[datetime] = None
	actual_delivery: Optional[datetime] = None
	status: LogisticsStatus
	created_at: datetime
	contact_person: Optional[str] = None
	contact_phone: Optional[str] = None
	vehicle_plate: Optional[str] = None
	notes: Optional[str] = None

