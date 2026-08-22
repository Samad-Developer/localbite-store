import { env } from "./env";
import type { Restaurant, MenuResponse, CreateOrderPayload, CreateOrderResponse } from "@/types/api";

const BASE_URL = env.NEXT_PUBLIC_ADMIN_API_URL;
const RESTAURANT_ID = env.NEXT_PUBLIC_RESTAURANT_ID;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isFrameworkControlFlowError(error: unknown): boolean {
  return typeof (error as { digest?: unknown } | null)?.digest === "string";
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    if (isFrameworkControlFlowError(error)) throw error;
    throw new ApiError("Could not reach the restaurant server. Please try again.", 0, endpoint);
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
    }
    console.error("API FAILURE:", { endpoint, status: res.status, url });
    throw new ApiError(message, res.status, endpoint);
  }

  return res.json() as Promise<T>;
}

export function getRestaurant(): Promise<Restaurant> {
  return apiFetch<Restaurant>(`/api/v1/restaurant/${RESTAURANT_ID}`, {
    cache: "no-store",
  });
}

export function getMenu(): Promise<MenuResponse> {
  return apiFetch<MenuResponse>(`/api/v1/menu/${RESTAURANT_ID}`, {
    cache: "no-store",
  });
}

export function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>(`/api/v1/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
