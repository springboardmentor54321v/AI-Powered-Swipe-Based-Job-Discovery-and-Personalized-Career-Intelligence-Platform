# Resume and ATS data dictionary

| Table / field | Meaning | Used by |
| --- | --- | --- |
| `resumes` | Stable metadata record for an uploaded resume file. | Gateway and file API |
| `resumes.storage_key` | Object key or local relative path; never expose it as a public URL. | Storage adapter |
| `resume_versions` | A parseable/scorable version of a resume. | ATS, profile UI |
| `resume_versions.is_default` | The one version shown and scored by default for a resume. | Gateway, profile UI |
| `skills.normalized_name` | Lowercase canonical skill string used for matching. | Extraction, ATS |
| `resume_version_skills` | Many-to-many extracted/manual skills for a specific version. | Extraction, ATS |
| `jobs.required_skills` | JSON array of must-have normalized skills. | ATS scorer |
| `jobs.keywords` | JSON array of supplementary matching terms. | ATS scorer and search |

## Integrity rules

- A resume version belongs to one resume; deleting the resume deletes versions and version skills.
- At most one version per resume has `is_default = 1`.
- A skill may appear only once on each resume version.
- `required_skills` and `keywords` must always contain valid JSON arrays.
