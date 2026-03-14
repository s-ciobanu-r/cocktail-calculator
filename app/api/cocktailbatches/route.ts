import { NextRequest, NextResponse } from "next/server";
import { calculateTotals } from "@/lib/cocktails";

export async function POST(request: NextRequest) {
  let body: Record<string, string | number | null | undefined> = {};

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    body = await request.json();
  } else if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    body = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        typeof value === "string" ? value : value.name,
      ])
    ) as Record<string, string>;
  } else {
    return NextResponse.json(
      { error: "Unsupported content type. Use JSON or form submissions." },
      { status: 415 }
    );
  }

  try {
    const result = calculateTotals(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
