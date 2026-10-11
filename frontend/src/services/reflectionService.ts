
import type { Mission } from "../types/mission";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export class ReflectionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReflectionServiceError";
  }
}

export async function analyzeReflection(
  mission: Mission,
  notes: string,
): Promise<{ reflection: string }> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/reflections/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mission: {
          id: mission.id,
          pillar: mission.pillar,
          question: mission.question,
          objective: mission.objective,
          instructions: mission.instructions,
        },
        notes: notes.trim(),
      }),
    });
  } catch {
    throw new ReflectionServiceError(
      "Cannot reach Outverse's backend. Your notes are safe; please try again.",
    );
  }

  if (!response.ok) {
    let message =
      "Reflection analysis failed. Your notes are safe; please try again.";

    try {
      const data: unknown = await response.json();

      if (
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof data.detail === "string"
      ) {
        message = data.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new ReflectionServiceError(message);
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("reflection" in data) ||
    typeof data.reflection !== "string" ||
    data.reflection.trim().length === 0
  ) {
    throw new ReflectionServiceError(
      "The backend returned an invalid reflection.",
    );
  }

  return { reflection: data.reflection };
}
