"""Helpers to read, validate and store the candidate / recruiter profile on the User row."""

MAX_SKILLS = 60

# request key -> User column (both snake_case and the camelCase names the frontend uses)
_TEXT_FIELDS = {
    "phone": "phone",
    "location": "location",
    "preferred_location": "location",
    "preferredLocation": "location",
    "desired_role": "desired_role",
    "desiredRole": "desired_role",
    "targetRole": "desired_role",
    "experience": "experience",
    "preferred_salary": "preferred_salary",
    "preferredSalary": "preferred_salary",
    "bio": "bio",
    "designation": "designation",
    "company_name": "company_name",
    "companyName": "company_name",
    "website": "website",
    "industry": "industry",
    "company_size": "company_size",
    "companySize": "company_size",
    "company_description": "company_description",
    "companyDescription": "company_description",
}

_LIMITS = {
    "phone": 30, "location": 150, "desired_role": 150, "experience": 50, "preferred_salary": 100,
    "designation": 100, "company_name": 150, "website": 255, "industry": 100, "company_size": 50,
}


def normalize_skills(value):
    """['Python', ' sql '] / 'Python, SQL; AWS' -> ['Python', 'sql', 'AWS'] (deduplicated, trimmed)."""
    if value is None:
        return []
    if isinstance(value, str):
        import re
        items = re.split(r"[,;\n|]", value)
    elif isinstance(value, (list, tuple, set)):
        items = list(value)
    else:
        return []
    seen, out = set(), []
    for item in items:
        s = str(item).strip().strip("'\"")
        if s and s.lower() not in seen:
            seen.add(s.lower())
            out.append(s[:60])
        if len(out) >= MAX_SKILLS:
            break
    return out


def apply_profile_fields(user, data):
    """Copy any profile fields present in `data` onto `user`. Returns the list of fields that changed."""
    changed = []
    for key, column in _TEXT_FIELDS.items():
        if key not in data:
            continue
        raw = data.get(key)
        value = None if raw is None else str(raw).strip()
        if value == "":
            value = None
        if value is not None and column in _LIMITS:
            value = value[:_LIMITS[column]]
        if getattr(user, column) != value:
            setattr(user, column, value)
            changed.append(column)
    if "skills" in data:
        skills = normalize_skills(data.get("skills"))
        if (user.skills or []) != skills:
            user.skills = skills
            changed.append("skills")
    return changed


def compute_profile_completion(user):
    """0-100 completion score shown on the profile page."""
    if user.role == "RECRUITER":
        checks = [user.name, user.email, user.company_name, user.designation, user.industry,
                  user.company_size, user.website, user.company_description, user.phone]
    else:
        checks = [user.name, user.email, user.phone, user.location, user.desired_role, user.experience,
                  user.preferred_salary, user.bio, user.skills]
    filled = sum(1 for c in checks if c)
    return int(round(100 * filled / len(checks)))
