from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Session, select

from app.db import get_session, init_db
from app.models import Order, Product, User
from app.schemas import (
    DashboardSummary,
    DistributorSummary,
    OrderRead,
    OrderStatusUpdate,
    ProductCreate,
    ProductRead,
    UserRead,
)

app = FastAPI(title="Fireworks Mall API")


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    with get_session() as session:
        if not session.exec(select(User)).first():
            admin = User(name="平台管理员", phone="13763316649", role="admin")
            distributor = User(name="渠道分销", phone="13800001111", role="distributor")
            session.add(admin)
            session.add(distributor)
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
            session.add(
                Order(
                    user_id=2,
                    status="待发货",
                    total=298.0,
                )
            )
            session.commit()


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
