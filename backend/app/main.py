from datetime import datetime
from pathlib import Path
import random
import re
import zipfile
import xml.etree.ElementTree as ET

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from app.config import AUTH_CONFIG, SUPPLIER_CONFIG
from app.db import get_session, init_db
from app.models import AuthAccount, Order, Product, User
from app.schemas import (
    AuthLoginRequest,
    AuthLoginResponse,
    DashboardSummary,
    DistributorSummary,
    OrderCreate,
    OrderRead,
    OrderStatusUpdate,
    PhoneLoginRequest,
    ProductCreate,
    ProductRead,
    SupplierRead,
    UserRead,
)

app = FastAPI(title="Fireworks Mall API")

IMAGE_DIR = Path(__file__).resolve().parent / "images"
IMAGE_DIR.mkdir(exist_ok=True)
app.mount("/images", StaticFiles(directory=str(IMAGE_DIR)), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

XLSX_PATH = Path(__file__).resolve().parent / "商品.xlsx"
XLSX_NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def _column_to_index(column: str) -> int:
    index = 0
    for char in column:
        index = index * 26 + (ord(char) - ord("A") + 1)
    return index - 1


def _load_products_from_xlsx() -> list[dict]:
    if not XLSX_PATH.exists():
        return []
    with zipfile.ZipFile(XLSX_PATH) as workbook:
        shared = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
        shared_strings = [
            "".join(text.text or "" for text in si.iter(f"{{{XLSX_NS['a']}}}t"))
            for si in shared.iter(f"{{{XLSX_NS['a']}}}si")
        ]
        sheet = ET.fromstring(workbook.read("xl/worksheets/sheet1.xml"))

    rows = []
    for row in sheet.findall("a:sheetData/a:row", XLSX_NS):
        values: list[str | None] = []
        for cell in row.findall("a:c", XLSX_NS):
            ref = cell.get("r") or ""
            match = re.match(r"([A-Z]+)", ref)
            if not match:
                continue
            index = _column_to_index(match.group(1))
            while len(values) <= index:
                values.append(None)
            value_node = cell.find("a:v", XLSX_NS)
            if value_node is None:
                values[index] = None
                continue
            if cell.get("t") == "s":
                values[index] = shared_strings[int(value_node.text)]
            else:
                values[index] = value_node.text
        if values:
            rows.append(values)

    products = []
    for row in rows[1:]:
        if not row or not row[0]:
            continue
        name = row[0]
        category = row[1] if len(row) > 1 else ""
        price = float(row[2]) if len(row) > 2 and row[2] else 0.0
        image_name = row[3] if len(row) > 3 else ""
        products.append(
            {
                "name": name,
                "category": category,
                "price": price,
                "image_url": f"/images/{image_name}" if image_name else "",
                "tags": category or "",
            }
        )
    return products


def _generate_order_number() -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    suffix = random.randint(1000, 9999)
    return f"WD{timestamp}{suffix}"


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    with get_session() as session:
        for account in AUTH_CONFIG:
            user_payload = account["user"]
            user = session.exec(select(User).where(User.phone == user_payload["phone"])).first()
            if not user:
                user = User(
                    name=user_payload["name"],
                    phone=user_payload["phone"],
                    role=account["role"],
                    pickup_address=user_payload.get("pickup_address"),
                )
                session.add(user)
                session.commit()
                session.refresh(user)
            else:
                user.pickup_address = user_payload.get("pickup_address")
                session.add(user)
                session.commit()

            existing_account = session.exec(
                select(AuthAccount).where(AuthAccount.username == account["username"])
            ).first()
            if not existing_account:
                session.add(
                    AuthAccount(
                        username=account["username"],
                        password=account["password"],
                        role=account["role"],
                        user_id=user.id,
                    )
                )
                session.commit()

        has_products = bool(session.exec(select(Product)).first())
        if not has_products:
            for payload in _load_products_from_xlsx():
                session.add(Product(**payload))
            session.commit()

        if not session.exec(select(Order)).first():
            distributor_user = session.exec(
                select(User).where(User.role == "distributor")
            ).first()
            if distributor_user:
                session.add(
                    Order(
                        user_id=distributor_user.id,
                        order_number=_generate_order_number(),
                        status="待提货",
                        total=298.0,
                        items=[],
                    )
                )
                session.commit()

        orders_missing_number = session.exec(
            select(Order).where(Order.order_number.is_(None))
        ).all()
        for order in orders_missing_number:
            order.order_number = _generate_order_number()
            session.add(order)
        if orders_missing_number:
            session.commit()

        orders_missing_items = session.exec(select(Order).where(Order.items.is_(None))).all()
        for order in orders_missing_items:
            order.items = []
            session.add(order)
        if orders_missing_items:
            session.commit()


@app.post("/auth/login", response_model=AuthLoginResponse)
def login(payload: AuthLoginRequest, session: Session = Depends(get_session)) -> AuthLoginResponse:
    account = session.exec(
        select(AuthAccount).where(
            AuthAccount.username == payload.username,
            AuthAccount.password == payload.password,
        )
    ).first()
    if not account or not account.user_id:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = session.get(User, account.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return AuthLoginResponse(role=account.role, user_id=user.id, name=user.name)


@app.post("/auth/phone", response_model=UserRead)
def phone_login(
    payload: PhoneLoginRequest, session: Session = Depends(get_session)
) -> UserRead:
    user = session.exec(select(User).where(User.phone == payload.phone)).first()
    if not user:
        user = User(name="手机用户", phone=payload.phone, role="customer")
        session.add(user)
        session.commit()
        session.refresh(user)
    return user


@app.get("/users", response_model=list[UserRead])
def list_users(session: Session = Depends(get_session)) -> list[UserRead]:
    return session.exec(select(User)).all()


@app.get("/products", response_model=list[ProductRead])
def list_products(session: Session = Depends(get_session)) -> list[ProductRead]:
    return session.exec(select(Product)).all()


@app.post("/products", response_model=ProductRead)
def create_product(
    payload: ProductCreate, session: Session = Depends(get_session)
) -> ProductRead:
    product = Product(**payload.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@app.get("/suppliers", response_model=list[SupplierRead])
def list_suppliers() -> list[SupplierRead]:
    return SUPPLIER_CONFIG



@app.get("/orders", response_model=list[OrderRead])
def list_orders(session: Session = Depends(get_session)) -> list[OrderRead]:
    return session.exec(select(Order)).all()


@app.post("/orders", response_model=OrderRead)
def create_order(
    payload: OrderCreate, session: Session = Depends(get_session)
) -> OrderRead:
    user = None
    if payload.phone:
        user = session.exec(select(User).where(User.phone == payload.phone)).first()
    elif payload.user_id:
        user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    order = Order(
        user_id=user.id,
        order_number=_generate_order_number(),
        status="待提货",
        total=payload.total,
        items=[item.model_dump() for item in payload.items],
    )
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@app.get("/users/{user_id}/orders", response_model=list[OrderRead])
def list_user_orders(
    user_id: int, session: Session = Depends(get_session)
) -> list[OrderRead]:
    return session.exec(select(Order).where(Order.user_id == user_id)).all()


@app.patch("/orders/{order_id}", response_model=OrderRead)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    session: Session = Depends(get_session),
) -> OrderRead:
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@app.get("/admin/summary", response_model=DashboardSummary)
def admin_summary(session: Session = Depends(get_session)) -> DashboardSummary:
    total_sales = sum(order.total for order in session.exec(select(Order)).all())
    pending_orders = len(
        [order for order in session.exec(select(Order)).all() if order.status != "已完成"]
    )
    active_distributors = len(
        [user for user in session.exec(select(User)).all() if user.role == "distributor"]
    )
    featured_products = len(
        [product for product in session.exec(select(Product)).all() if product.is_featured]
    )
    return DashboardSummary(
        total_sales=total_sales,
        pending_orders=pending_orders,
        active_distributors=active_distributors,
        featured_products=featured_products,
    )


@app.get("/distributor/{user_id}/summary", response_model=DistributorSummary)
def distributor_summary(
    user_id: int, session: Session = Depends(get_session)
) -> DistributorSummary:
    user = session.get(User, user_id)
    if not user or user.role != "distributor":
        raise HTTPException(status_code=404, detail="Distributor not found")
    account = session.exec(
        select(AuthAccount).where(AuthAccount.user_id == user_id)
    ).first()
    orders = session.exec(select(Order).where(Order.user_id == user_id)).all()
    total_orders = len(orders)
    commission = sum(order.total for order in orders) * 0.15
    completed_orders = [order for order in orders if order.status == "已完成"]
    now = datetime.utcnow()
    today = now.date()
    daily_completed_orders = len(
        [order for order in completed_orders if order.created_at.date() == today]
    )
    monthly_completed_orders = len(
        [
            order
            for order in completed_orders
            if order.created_at.year == now.year and order.created_at.month == now.month
        ]
    )
    return DistributorSummary(
        distributor_id=user.id,
        code=account.username if account else None,
        name=user.name,
        pickup_address=user.pickup_address,
        total_orders=total_orders,
        daily_completed_orders=daily_completed_orders,
        monthly_completed_orders=monthly_completed_orders,
        commission=commission,
        wallet_balance=1200.0,
        coupons=3,
        points=180,
    )
