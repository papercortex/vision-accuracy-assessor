import { logger } from "../logger";
import { Metrics } from "../models/metric.interface";

export function calculateAdjustedMetrics(
  TP: number,
  FP: number,
  FN: number,
  noDataValue = 0
): Metrics {
  // Initialize metrics as null to represent cases where calculation isn't applicable
  let precision = null;
  let recall = null;
  let f1Score = null;

  // Handle cases where no predictions are made (FP = 0) and no expectations exist (FN = 0)
  if (TP === 0 && FP === 0 && FN === 0) {
    // Scenario with no data: could be interpreted as perfect (1) or undefined (null)
    // Depending on use case, might choose to return 1 or keep as null
    precision = recall = f1Score = noDataValue; // or 1, based on interpretational preference
  } else {
    // Calculate precision and recall with checks to avoid division by zero
    precision = TP + FP === 0 ? 0 : TP / (TP + FP); // Adjusted to 0 to reflect no correct predictions when no attempts made
    recall = TP + FN === 0 ? 0 : TP / (TP + FN); // Reflects failure to detect any positives when expected

    // Calculate F1 score only if precision and recall are both defined
    if (precision !== null && recall !== null) {
      if (precision + recall > 0) {
        f1Score = (2 * (precision * recall)) / (precision + recall);
      } else {
        f1Score = 0;
      }
    }
  }

  if (precision === null || recall === null || f1Score === null) {
    logger.debug(
      {
        precision,
        recall,
        f1Score,
        TP,
        FP,
        FN,
      },
      "Null metric values detected."
    );
    throw new Error("Null metric values detected.");
  }

  return { precision, recall, f1Score };
}
