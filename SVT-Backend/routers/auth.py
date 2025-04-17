from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models, schemas, database
import utils.security as security
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


# Registro de usuario
@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    hashed_password = security.pwd_context.hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, rol="USER")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Login de usuario
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    access_token = security.create_access_token(
        data={"sub": user.email},
        expires_delta=security.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {"access_token": access_token, "token_type": "bearer"}
