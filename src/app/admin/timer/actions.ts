"use server";

import { writeContent } from "@/lib/content";
import { revalidatePath } from "next/cache";

interface TimerRow {
  icon: string;
  label: string;
  value: string;
}

interface TimerData {
  sectionTag: string;
  sectionTitle: string;
  heading: string;
  headingAccent: string;
  body: string;
  cardHeaderText: string;
  cardHeaderBg: string;
  cardFooterLabel: string;
  cardFooterValue: string;
  cardFooterBg: string;
  rows: TimerRow[];
}

export async function saveTimerAction(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    const rowsRaw = formData.get("rows") as string;
    const rows: TimerRow[] = JSON.parse(rowsRaw || "[]");

    const data: TimerData = {
      sectionTag: (formData.get("sectionTag") as string) ?? "",
      sectionTitle: (formData.get("sectionTitle") as string) ?? "",
      heading: (formData.get("heading") as string) ?? "",
      headingAccent: (formData.get("headingAccent") as string) ?? "",
      body: (formData.get("body") as string) ?? "",
      cardHeaderText: (formData.get("cardHeaderText") as string) ?? "",
      cardHeaderBg: (formData.get("cardHeaderBg") as string) ?? "#1a1a2e",
      cardFooterLabel: (formData.get("cardFooterLabel") as string) ?? "",
      cardFooterValue: (formData.get("cardFooterValue") as string) ?? "",
      cardFooterBg: (formData.get("cardFooterBg") as string) ?? "#fff1ea",
      rows,
    };

    await writeContent("timer.json", data);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Noe gikk galt. Prøv igjen." };
  }
}
