import { findMatches } from "./matching";
import { calculateCompatibility } from "./compatibility";

export function runMatchingUtils(currentUser, otherUsers) {
  const potentialMatches = findMatches(currentUser, otherUsers);

  const finalMatches = potentialMatches.map((user) => {
    const result = calculateCompatibility(currentUser, user);

    // Risk: only High if 2+ SIGNIFICANT warnings (skill + work style both bad)
    // Single minor warning → Moderate. Zero → Low.
    const riskLevel =
      result.warnings.length >= 2 ? "High Conflict Risk" :
      result.warnings.length === 1 ? "Moderate Risk" :
      "Low Risk";

    const category =
      result.score >= 75 ? "Highly Compatible" :
      result.score >= 45 ? "Moderate Match" :
      "Risky Match";

    // Rich explanation using positives + warnings
    let explanation = "";
    if (result.positives.length > 0 && result.warnings.length === 0) {
      explanation = `Great match! ${result.positives.join(" · ")}.`;
    } else if (result.positives.length > 0 && result.warnings.length > 0) {
      explanation = `${result.positives.join(" · ")} — but watch out for: ${result.warnings.join(", ")}.`;
    } else if (result.warnings.length > 0) {
      explanation = `Potential conflicts: ${result.warnings.join(", ")}.`;
    } else {
      explanation = "Decent overlap in skills and preferences.";
    }

    return {
      id: user.id,
      name: user.name,
      score: result.score,
      category,
      explanation,
      riskLevel,
      warnings: result.warnings,
      positives: result.positives,
      details: result.details,
      // Pass full profile so card can show their info
      profile: {
        role: user.role ?? "",
        workStyle: user.workStyle ?? "",
        sleep: user.sleep ?? "",
        skillsHave: user.skillsHave ?? [],
        skillsWant: user.skillsWant ?? [],
      },
    };
  });

  if (finalMatches.length === 0) {
    return [{
      id: "none",
      name: "No Matches Found",
      score: 0,
      category: "No Compatible Users",
      explanation: "No users matched your required skill set.",
      riskLevel: "N/A",
      warnings: [],
      positives: [],
    }];
  }

  return finalMatches.sort((a, b) => b.score - a.score);
}