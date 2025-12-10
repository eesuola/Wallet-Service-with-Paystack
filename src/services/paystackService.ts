import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    customer: {
      email: string;
    };
  };
}

export const initializePayment = async (
  email: string,
  amount: number,
  reference: string
): Promise<InitializePaymentResponse> => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, 
        reference,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Paystack initialize error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to initialize payment");
  }
};

export const verifyPayment = async (
  reference: string
): Promise<VerifyPaymentResponse> => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Paystack verify error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to verify payment");
  }
};
