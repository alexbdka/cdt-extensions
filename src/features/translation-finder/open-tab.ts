import { sendMessage } from "../../shared/browser";

export async function openTab(url: string): Promise<void> {
  const response = await sendMessage({ type: "cdt:openTab", url });
  if (!response?.ok) {
    throw new Error(response?.error || "Failed to open tab");
  }
}
