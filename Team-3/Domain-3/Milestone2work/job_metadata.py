import pandas as pd

def get_job_metadata(job_id: str):
    df = pd.read_excel("job_metadata.xlsx", dtype={"job": str})
    df["job"] = df["job"].str.strip()

    match = df[df["job"] == str(job_id).strip()]
    if match.empty:
        return None

    return {
        "posted_days_ago": int(match.iloc[0]["posted_days_ago"]),
        "competition_level": str(match.iloc[0]["competition_level"]).strip()
    }