export function findMatches(currentUser, allUsers) {
  const currentSkillsWant = Array.isArray(currentUser.skillsWant)
    ? currentUser.skillsWant
    : [];

  return allUsers.filter((user) => {
    const skillsHave = Array.isArray(user.skillsHave) ? user.skillsHave : [];
    return skillsHave.some((skill) => currentSkillsWant.includes(skill));
  });
}
