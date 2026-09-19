import { IEvaluationService } from "./types";
import { HeuristicEvaluationService } from "./heuristic-evaluator";
import { AIEvaluationService } from "./ai-evaluator";

export function getEvaluationService(): IEvaluationService {
  if (process.env.OMNIROUTE_API_KEY) {
    return new AIEvaluationService();
  }

  console.warn(
    "OMNIROUTE_API_KEY is not configured. Falling back to heuristic evaluation."
  );

  return new HeuristicEvaluationService();
}