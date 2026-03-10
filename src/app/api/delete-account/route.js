import { NextResponse } from "next/server";

const USER_ONBOARD_BASE_URL =
  process.env.USER_ONBOARD_URL ||
  process.env.NEXT_PUBLIC_USER_ONBOARD ||
  "https://hfg-user-onboard.onrender.com";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json(
        { message: "Authorization token is required." },
        { status: 400 }
      );
    }

    const response = await fetch(`${USER_ONBOARD_BASE_URL}/api/users`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
      cache: "no-store",
    });

    const rawBody = await response.text();
    let payload = {};

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        payload = { message: rawBody };
      }
    }

    return NextResponse.json(
      {
        message:
          payload.message ||
          (response.ok
            ? "User deleted successfully."
            : "Failed to delete account."),
        error: payload.error,
      },
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to process delete account request.",
        error: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 500 }
    );
  }
}
