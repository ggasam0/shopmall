from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProductRead(BaseModel):
    id: int
    name: str
    category: str
    price: float
    image_url: str
    tags: Optional[str] = None
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
    pickup_address: Optional[str] = None
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
    pickup_address: Optional[str] = None


class AuthLoginRequest(BaseModel):
    username: str
    password: str


class AuthLoginResponse(BaseModel):
    role: str
    user_id: int
    name: str


class PhoneLoginRequest(BaseModel):
    phone: str


class OrderStatusUpdate(BaseModel):
    status: str


class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    image_url: str
    tags: Optional[str] = None
    is_featured: Optional[bool] = False


class SupplierDistributor(BaseModel):
    code: str
    name: str
    pickup_address: Optional[str] = None


class SupplierRead(BaseModel):
    code: str
    suffix: str
    mall_name: str
    distributor: SupplierDistributor
