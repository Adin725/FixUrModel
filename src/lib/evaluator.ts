import { ClassLabel, NumericLabel, EvaluationSummary, ClassMetrics } from "@/types";

export const CLASSES: ClassLabel[] = ["Recyclable", "Electronic", "Organic"];

export function mapNumericToClassLabel(input: string | number): ClassLabel {
  const str = String(input)
    .replace(/[\r\n'"\s]/g, "")
    .trim()
    .toLowerCase();
  if (str === "1" || str === "electronic" || str.includes("elect")) return "Electronic";
  if (str === "2" || str === "organic" || str.includes("organ")) return "Organic";
  if (str === "0" || str === "recyclable" || str.includes("recyc")) return "Recyclable";
  const num = parseInt(str, 10);
  if (num === 1) return "Electronic";
  if (num === 2) return "Organic";
  return "Recyclable";
}

export function mapClassLabelToNumeric(label: ClassLabel): NumericLabel {
  if (label === "Recyclable") return 0;
  if (label === "Electronic") return 1;
  return 2;
}

export function evaluatePredictions(
  groundTruth: Record<number, ClassLabel>,
  predictions: Record<number, ClassLabel>
): EvaluationSummary {
  const confusionMatrix: Record<ClassLabel, Record<ClassLabel, number>> = {
    Recyclable: { Recyclable: 0, Electronic: 0, Organic: 0 },
    Electronic: { Recyclable: 0, Electronic: 0, Organic: 0 },
    Organic: { Recyclable: 0, Electronic: 0, Organic: 0 },
  };

  const itemIds = Object.keys(groundTruth).map(Number);
  let totalSamples = 0;
  let correctSamples = 0;

  for (const id of itemIds) {
    const actual = groundTruth[id];
    const predicted = predictions[id] || "Recyclable";
    confusionMatrix[actual][predicted] += 1;
    totalSamples += 1;
    if (actual === predicted) {
      correctSamples += 1;
    }
  }

  const accuracy = totalSamples > 0 ? correctSamples / totalSamples : 0;
  const perClassMetrics: ClassMetrics[] = [];

  let macroPrecisionSum = 0;
  let macroRecallSum = 0;
  let macroF1Sum = 0;
  let weightedF1Sum = 0;

  for (const cls of CLASSES) {
    const tp = confusionMatrix[cls][cls];
    let fp = 0;
    let fn = 0;

    for (const other of CLASSES) {
      if (other !== cls) {
        fp += confusionMatrix[other][cls];
        fn += confusionMatrix[cls][other];
      }
    }

    const support = CLASSES.reduce(
      (sum, col) => sum + confusionMatrix[cls][col],
      0
    );

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1Score =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;

    macroPrecisionSum += precision;
    macroRecallSum += recall;
    macroF1Sum += f1Score;
    weightedF1Sum += f1Score * support;

    perClassMetrics.push({
      className: cls,
      numericCode: mapClassLabelToNumeric(cls),
      precision,
      recall,
      f1Score,
      support,
    });
  }

  const classCount = CLASSES.length;
  const macroPrecision = macroPrecisionSum / classCount;
  const macroRecall = macroRecallSum / classCount;
  const macroF1 = macroF1Sum / classCount;
  const weightedF1 = totalSamples > 0 ? weightedF1Sum / totalSamples : 0;
  const microF1 = accuracy;

  return {
    accuracy,
    macroPrecision,
    macroRecall,
    macroF1,
    microF1,
    weightedF1,
    confusionMatrix,
    perClassMetrics,
  };
}

export function computeItemAgreement(
  itemId: number,
  groundTruthLabel: ClassLabel,
  predictionsList: Record<number, ClassLabel>[]
): number {
  if (predictionsList.length === 0) return 100;
  let matchCount = 0;
  for (const preds of predictionsList) {
    const p = preds[itemId] || "Recyclable";
    if (p === groundTruthLabel) {
      matchCount += 1;
    }
  }
  return Math.round((matchCount / predictionsList.length) * 100);
}

export function computeAutomaticTags(submissions: import("@/types").Submission[]): Record<string, string[]> {
  const tagsMap: Record<string, string[]> = {};
  if (submissions.length === 0) return tagsMap;

  let maxValF1 = -1;
  let maxTestF1 = -1;
  let minGap = 999;
  let maxImprovement = -999;
  let bestClass0 = -1;
  let bestClass1 = -1;
  let bestClass2 = -1;

  // find extremes
  submissions.forEach((s) => {
    if (s.validationMacroF1 > maxValF1) maxValF1 = s.validationMacroF1;
    if (s.testMacroF1 > maxTestF1) maxTestF1 = s.testMacroF1;
    if (Math.abs(s.generalizationGap) < minGap) minGap = Math.abs(s.generalizationGap);

    const f0 = s.evaluationSummary?.perClassMetrics?.find((m) => m.numericCode === 0)?.f1Score ?? 0;
    const f1 = s.evaluationSummary?.perClassMetrics?.find((m) => m.numericCode === 1)?.f1Score ?? 0;
    const f2 = s.evaluationSummary?.perClassMetrics?.find((m) => m.numericCode === 2)?.f1Score ?? 0;

    if (f0 > bestClass0) bestClass0 = f0;
    if (f1 > bestClass1) bestClass1 = f1;
    if (f2 > bestClass2) bestClass2 = f2;

    if (s.parentId) {
      const parent = submissions.find((p) => p.id === s.parentId);
      if (parent) {
        const imp = s.testMacroF1 - parent.testMacroF1;
        if (imp > maxImprovement) maxImprovement = imp;
      }
    }
  });

  submissions.forEach((s) => {
    const tags: string[] = [];
    if (!s.parentId) {
      tags.push("Baseline");
    } else {
      tags.push("Revision");
    }
    if (s.isOfficial) {
      tags.push("Official Submission");
    }
    if (Math.abs(s.validationMacroF1 - maxValF1) < 0.0001 && maxValF1 > 0) {
      tags.push("Best Validation");
    }
    if (Math.abs(s.testMacroF1 - maxTestF1) < 0.0001 && maxTestF1 > 0) {
      tags.push("Best Ground Truth Manual");
    }
    if (s.parentId) {
      const parent = submissions.find((p) => p.id === s.parentId);
      if (parent && s.testMacroF1 - parent.testMacroF1 === maxImprovement && maxImprovement > 0) {
        tags.push("Biggest Improvement");
      }
    }
    if (Math.abs(Math.abs(s.generalizationGap) - minGap) < 0.0001) {
      tags.push("Most Stable");
    }

    const f0 = s.evaluationSummary?.perClassMetrics?.find((m) => m.numericCode === 0)?.f1Score ?? 0;
    const f1 = s.evaluationSummary?.perClassMetrics?.find((m) => m.numericCode === 1)?.f1Score ?? 0;
    const f2 = s.evaluationSummary?.perClassMetrics?.find((m) => m.numericCode === 2)?.f1Score ?? 0;

    if (Math.abs(f0 - bestClass0) < 0.0001 && bestClass0 > 0) tags.push("Best Class 0");
    if (Math.abs(f1 - bestClass1) < 0.0001 && bestClass1 > 0) tags.push("Best Class 1");
    if (Math.abs(f2 - bestClass2) < 0.0001 && bestClass2 > 0) tags.push("Best Class 2");

    tagsMap[s.id] = Array.from(new Set(tags));
  });

  return tagsMap;
}

