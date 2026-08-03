// lib/api.ts
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

interface FetchOptions extends RequestInit {
  revalidate?: number;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate, ...fetchOptions } = options;
  const url = `${BASE_URL}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      next: revalidate !== undefined ? { revalidate } : undefined,
    });
  } catch {
    // Network-level failure — admin panel unreachable, DNS issue, etc.
    throw new ApiError("Could not reach the restaurant server. Please try again.", 0, endpoint);
  }

// lib/api.ts — temporary debug line, remove once fixed
if (!res.ok) {
  let message = `Request failed with status ${res.status}`;
  try {
    const body = await res.json();
    if (body?.message) message = body.message;
  } catch {
    // response wasn't JSON — keep the generic message
  }
  console.error("API FAILURE:", { endpoint, status: res.status, url }); // ← add this
  throw new ApiError(message, res.status, endpoint);
}

  return res.json() as Promise<T>;
}

// ---------- Public API functions ----------

export function getRestaurant(): Promise<Restaurant> {
  return apiFetch<Restaurant>(`/api/v1/restaurant/${RESTAURANT_ID}`, {
    revalidate: 3600, // 1 hour, per your spec
  });
}

export function getMenu(): Promise<MenuResponse> {
  return apiFetch<MenuResponse>(`/api/v1/menu/${RESTAURANT_ID}`, {
    revalidate: 300, // 5 minutes, per your spec
  });
}

export function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>(`/api/v1/orders`, {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store", // orders must never be cached
  });
}