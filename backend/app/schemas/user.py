from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "customer" # customer, agent, admin
    tenant_id: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    tenant_id: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class DetailedAccessTokenPayload(BaseModel):
    sub: str # email
    role: str
    tenant_id: str
