from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProductRead(BaseModel):
    id: int
    name: str
    category: str
    price: float
    image_url: str
    is_featured: bool


class OrderRead(BaseModel):
    id: int
    user_id: int
    status: str
    total: float
    created_at: datetime


class DashboardSummary(BaseModel):
    total_sales: float
    pending_orders: int
    active_distributors: int
    featured_products: int


class DistributorSummary(BaseModel):
    distributor_id: int
    name: str
    total_orders: int
    commission: float
    wallet_balance: float
    coupons: int
    points: int


class UserRead(BaseModel):
    id: int
    name: str
    phone: str
    role: str


class OrderStatusUpdate(BaseModel):
    status: str


class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    image_url: str
    is_featured: Optional[bool] = False
