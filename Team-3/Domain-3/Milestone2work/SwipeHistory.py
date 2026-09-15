import pandas as pd

def get_swipe_history(user_name: str):
    """
    Reads pretend.xlsx and returns all swipes for one user.
    Later, this function will be replaced by a real API call —
    nothing else in your code needs to change.
    """
    df = pd.read_excel("pretend.xlsx")
    df.columns = df.columns.str.strip().str.lower()

    df["user"] = df["user"].astype(str).str.strip()
    df["job"] = df["job"].astype(str).str.strip()
    df["action"] = df["action"].astype(str).str.strip().str.lower()

    user_swipes = df[df["user"] == user_name.strip()]
    return user_swipes.to_dict("records")


if __name__ == "__main__":
    print("Columns found:", pd.read_excel("pretend.xlsx").columns.tolist())
    swipes = get_swipe_history("Nandhini")
    print("Swipes for Nandhini:", swipes)