import { WorkOS } from "@workos-inc/node";
import { NextRequest, NextResponse } from "next/server";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

// POST /api/vault — create a vault object (encrypt + store)
export async function POST(req: NextRequest) {
  try {
    const { name, value } = await req.json();
    if (!name || !value) {
      return NextResponse.json({ error: "name and value are required" }, { status: 400 });
    }

    const metadata = await workos.vault.createObject({
      name,
      value,
      context: { app: "envpass" },
    });

    return NextResponse.json({ id: metadata.id });
  } catch (err: any) {
    console.error("Vault create error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to create vault object" }, { status: 500 });
  }
}

// DELETE /api/vault?id=kv_... — delete a vault object
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await workos.vault.deleteObject({ id });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Vault delete error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to delete vault object" }, { status: 500 });
  }
}
