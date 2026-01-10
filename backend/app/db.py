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


def get_session() -> Session:
    return Session(engine)
