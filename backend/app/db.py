from collections.abc import Generator

from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = "sqlite:///./shopmall.db"
engine = create_engine(DATABASE_URL, echo=False)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)
    with engine.begin() as connection:
        result = connection.execute(text("PRAGMA table_info(user)"))
        columns = {row._mapping["name"] for row in result}
        if "pickup_address" not in columns:
            connection.execute(
                text("ALTER TABLE user ADD COLUMN pickup_address VARCHAR")
            )

        order_result = connection.execute(text('PRAGMA table_info("order")'))
        order_columns = {row._mapping["name"] for row in order_result}
        if "order_number" not in order_columns:
            connection.execute(text('ALTER TABLE "order" ADD COLUMN order_number VARCHAR'))
        if "items" not in order_columns:
            connection.execute(text('ALTER TABLE "order" ADD COLUMN items TEXT'))
        if "completed_at" not in order_columns:
            connection.execute(
                text('ALTER TABLE "order" ADD COLUMN completed_at TIMESTAMP')
            )
            connection.execute(
                text(
                    'UPDATE "order" SET completed_at = created_at WHERE status = "已完成"'
                )
            )


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
