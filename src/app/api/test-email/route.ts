import { NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";

export async function GET() {
  try {
    await sendOrderEmails({
      customerName: "Test Kunde",
      customerEmail: process.env.EMAIL_TO!,
      productName: "Test Produkt — Starter Guide",
      amount: 299,
      orderId: "test_" + Date.now(),
      orderDate: new Date().toLocaleDateString("no-NO", { day: "numeric", month: "long", year: "numeric" }),
    });

    return NextResponse.json({ ok: true, message: "Testmail sendt til " + process.env.EMAIL_TO });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
