import os
import razorpay
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/payments", tags=["payments"])

# Initialize the Razorpay Client with Sandbox Credentials
client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

class CreateOrderRequest(BaseModel):
    amount: int  # Amount in lowest currency subunit (e.g., 49900 paise = ₹499)
    currency: str = "INR"

@router.post("/create-order")
def create_subscription_order(payload: CreateOrderRequest):
    """Generates a secure transaction mapping entry for the checkout page modal."""
    try:
        order_data = {
            "amount": payload.amount,
            "currency": payload.currency,
            "payment_capture": 1  # Auto-capture payment instantly upon validation
        }
        
        # Requests a secure transaction payload directly from Razorpay's Sandbox API
        razorpay_order = client.order.create(data=order_data)
        
        return {
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": os.getenv("RAZORPAY_KEY_ID")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Razorpay Sandbox Order Generation Failed: {str(e)}")