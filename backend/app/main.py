from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.db import get_session, init_db
from app.models import AuthAccount, Order, Product, User
from app.schemas import (
    AuthLoginRequest,
    AuthLoginResponse,
    DashboardSummary,
    DistributorSummary,
    OrderRead,
    OrderStatusUpdate,
    PhoneLoginRequest,
    ProductCreate,
    ProductRead,
    UserRead,
)

app = FastAPI(title="Fireworks Mall API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    with get_session() as session:
        admin_user = session.exec(
            select(User).where(User.phone == "13763316649")
        ).first()
        if not admin_user:
            admin_user = User(name="平台管理员", phone="13763316649", role="admin")
            session.add(admin_user)
            session.commit()
            session.refresh(admin_user)

        distributor_a = session.exec(
            select(User).where(User.phone == "13800001111")
        ).first()
        if not distributor_a:
            distributor_a = User(name="渠道分销A", phone="13800001111", role="distributor")
            session.add(distributor_a)
            session.commit()
            session.refresh(distributor_a)

        distributor_b = session.exec(
            select(User).where(User.phone == "13800002222")
        ).first()
        if not distributor_b:
            distributor_b = User(name="渠道分销B", phone="13800002222", role="distributor")
            session.add(distributor_b)
            session.commit()
            session.refresh(distributor_b)

        if not session.exec(select(AuthAccount)).first():
            session.add(
                AuthAccount(
                    username="admin",
                    password="admin123",
                    role="admin",
                    user_id=admin_user.id,
                )
            )
            session.add(
                AuthAccount(
                    username="dist_a",
                    password="dist123",
                    role="distributor",
                    user_id=distributor_a.id,
                )
            )
            session.add(
                AuthAccount(
                    username="dist_b",
                    password="dist456",
                    role="distributor",
                    user_id=distributor_b.id,
                )
            )
            session.commit()

        if not session.exec(select(Product)).first():
            session.add(
                Product(
                    name="夜景礼花套装",
                    category="夜景礼花",
                    price=298.0,
                    image_url="https://images.unsplash.com/photo-1509228468518-180dd4864904",
                    is_featured=True,
                )
            )
            session.add(
                Product(
                    name="节庆鞭炮",
                    category="纸炮",
                    price=88.0,
                    image_url="https://images.unsplash.com/photo-1509228468518-180dd4864904",
                )
            )
            session.commit()

        if not session.exec(select(Order)).first():
            session.add(
                Order(
                    user_id=distributor_a.id,
                    status="待发货",
                    total=298.0,
                )
            )
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


@app.get("/orders", response_model=list[OrderRead])
def list_orders(session: Session = Depends(get_session)) -> list[OrderRead]:
    return session.exec(select(Order)).all()


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
    orders = session.exec(select(Order).where(Order.user_id == user_id)).all()
    total_orders = len(orders)
    commission = sum(order.total for order in orders) * 0.15
    return DistributorSummary(
        distributor_id=user.id,
        name=user.name,
        total_orders=total_orders,
        commission=commission,
        wallet_balance=1200.0,
        coupons=3,
        points=180,
    )
