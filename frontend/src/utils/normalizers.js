// Adapts real backend rows -> the shape the existing UI components expect.
// Anything marked TODO doesn't exist in the DB yet — left as a safe default
// so JobCard / badges / MatchScore etc. don't crash. Update these once the
// backend adds the corresponding column.

export function normalizeJob(job) {
  const skillsArray = job.skills
    ? job.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    id: job.id,
    recruiterId: job.recruiter_id,
    title: job.title,
    company: job.company,
    description: job.description,
    location: job.location,
    salary: job.salary || "Not disclosed",

    skills: skillsArray,
    requiredSkills: skillsArray,
    preferredSkills: [], // TODO: backend — no "nice to have" skills column

    // TODO: backend — none of these exist on the Job model yet.
    logo: null,
    companyType: "—",
    jobType: "Full Time",
    experience: "Not specified",
    experienceLevel: "Not specified",
    isFresherFriendly: false,
    isRemote: /remote/i.test(job.location || ""),   // best-effort guess from location text
    isInternship: /intern/i.test(job.title || ""),  // best-effort guess from title text
    isNewlyFounded: false,
    matchPercentage: null,   // TODO: backend — no scoring/matching engine yet
    competition: "Unknown",
    applicants: null,
    postedTime: "Recently",
    responsibilities: [],
    benefits: []
  };
}

export function normalizeUser(user = {}) {
  return {
    ...user,

    id: user.id,

    name: user.name || "",

    email: user.email || "",

    role: user.role || "JOB_SEEKER",

    phone: user.phone || "",

    location: user.location || "",

    desiredRole:
      user.desiredRole ??
      user.desired_role ??
      "",

    targetRole:
      user.targetRole ??
      user.desiredRole ??
      user.desired_role ??
      "",

    experience:
      user.experience || "",

    preferredSalary:
      user.preferredSalary ??
      user.preferred_salary ??
      "",

    bio:
      user.bio || "",

    skills:
      Array.isArray(user.skills)
        ? user.skills
        : [],

    profileCompletion:
      Number(
        user.profileCompletion ??
        user.profile_completion ??
        0
      ),

    authProvider:
      user.authProvider ??
      user.auth_provider ??
      "local",
  };
}