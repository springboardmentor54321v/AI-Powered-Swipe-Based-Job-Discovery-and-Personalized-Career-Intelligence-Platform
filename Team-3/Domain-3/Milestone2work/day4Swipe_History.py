import pandas as pd

def get_swipe_history(user_name: str):
    df = pd.read_excel("pretend.xlsx")
    df.columns = df.columns.str.strip().str.lower()

    df["user"] = df["user"].astype(str).str.strip()
    df["job"] = df["job"].astype(str).str.strip()
    df["action"] = df["action"].astype(str).str.strip().str.lower()

    user_swipes = df[df["user"] == user_name.strip()]
    return user_swipes.to_dict("records")