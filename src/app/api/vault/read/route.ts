import { WorkOS } from "@workos-inc/node";
import { NextRequest, NextResponse } from "next/server";

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

// POST /api/vault/read — decrypt and return a vault object's value
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const obj = await workos.vault.readObject({ id });
    return NextResponse.json({ value: obj.value });
  } catch (err: any) {
    console.error("Vault read error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to read vault object" }, { status: 500 });
  }
}
