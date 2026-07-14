from fastapi import APIRouter, Depends
from app.schemas import schemas
from app.models import models
from app.core import auth

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserOut)
async def get_my_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
