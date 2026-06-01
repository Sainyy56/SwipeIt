const WEIGHTS = {
  mutualSkillMatch: 0.6,
  workStyleMatch:   0.25,
  sleepStyleMatch:  0.15,
};

export function calculateCompatibility(userA, userB) {
  const skillsHaveA = Array.isArray(userA.skillsHave) ? userA.skillsHave : [];
  const skillsWantA = Array.isArray(userA.skillsWant) ? userA.skillsWant : [];
  const skillsHaveB = Array.isArray(userB.skillsHave) ? userB.skillsHave : [];
  const skillsWantB = Array.isArray(userB.skillsWant) ? userB.skillsWant : [];

  let score = 0;
  const warnings = [];
  const positives = [];

  // ── Skill exchange ──────────────────────────
  const aHelpsB = skillsWantB.filter(s => skillsHaveA.includes(s));
  const bHelpsA = skillsWantA.filter(s => skillsHaveB.includes(s));

  const aHelpsBScore = skillsWantB.length > 0 ? (aHelpsB.length / skillsWantB.length) * 100 : 50;
  const bHelpsAScore = skillsWantA.length > 0 ? (bHelpsA.length / skillsWantA.length) * 100 : 50;
  const mutualSkillScore = (aHelpsBScore + bHelpsAScore) / 2;

  score += mutualSkillScore * WEIGHTS.mutualSkillMatch;

  // Only warn if skill exchange is genuinely poor (< 25%)
  if (mutualSkillScore < 25) {
    warnings.push("Weak mutual skill exchange");
  } else if (mutualSkillScore >= 75) {
    positives.push("Strong skill exchange");
  }

  // ── Work style ──────────────────────────────
  if (userA.workStyle && userB.workStyle) {
    if (userA.workStyle === userB.workStyle) {
      score += 100 * WEIGHTS.workStyleMatch;
      positives.push("Same work style");
    } else {
      // Partial credit for compatible styles instead of 0
      score += 30 * WEIGHTS.workStyleMatch;
      warnings.push("Different work styles");
    }
  } else {
    // No data → give neutral partial credit, no warning
    score += 50 * WEIGHTS.workStyleMatch;
  }

  // ── Sleep style ─────────────────────────────
  if (userA.sleep && userB.sleep) {
    if (userA.sleep === userB.sleep) {
      score += 100 * WEIGHTS.sleepStyleMatch;
      positives.push("Same schedule");
    } else {
      // Sleep mismatch is minor — give partial credit, no warning unless already 2+ issues
      score += 40 * WEIGHTS.sleepStyleMatch;
      // Only add warning if work style also mismatched (stacking minor issues)
      if (warnings.includes("Different work styles")) {
        warnings.push("Different sleep schedules");
      }
    }
  } else {
    score += 50 * WEIGHTS.sleepStyleMatch;
  }

  return {
    score: Math.round(score),
    warnings,
    positives,
    details: {
      aHelpsB,
      bHelpsA,
      mutualSkillScore: Math.round(mutualSkillScore),
      workStyleMatch: userA.workStyle === userB.workStyle,
      sleepMatch: userA.sleep === userB.sleep,
    },
  };
}