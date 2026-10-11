
import type { Mission, PillarId } from "../types/mission";
import { isMission } from "../types/mission";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export class MissionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissionServiceError";
  }
}

export async function generateMissions(
  pillar: PillarId,
): Promise<Mission[]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/missions/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pillar }),
    });
  } catch {
    throw new MissionServiceError(
      "Cannot reach Outverse's backend. Make sure the API server is running.",
    );
  }

  if (!response.ok) {
    let message = "Mission generation failed. Please try again.";

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
      // Keep the default error message if the response isn't JSON.
    }

    throw new MissionServiceError(message);
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("missions" in data) ||
    !Array.isArray(data.missions) ||
    data.missions.length === 0 ||
    !data.missions.every(isMission)
  ) {
    throw new MissionServiceError(
      "The backend returned an invalid mission response.",
    );
  }

  return data.missions;
}
