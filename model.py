import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

np.random.seed(42)
n = 500

data = pd.DataFrame({
    "commits": np.random.randint(50, 500, n),
    "bugs": np.random.randint(5, 150, n),
    "complexity": np.random.randint(1, 10, n),
    "developers": np.random.randint(1, 10, n),
    "coverage": np.random.randint(30, 100, n)
})

data["bugs"] = (data["complexity"] * np.random.randint(5, 15, n)) + np.random.randint(0, 20, n)
data["coverage"] = 100 - (data["complexity"] * np.random.randint(3, 8, n)) + np.random.randint(-5, 5, n)
data["coverage"] = data["coverage"].clip(10, 100)

data["bug_density"] = data["bugs"] / data["commits"]
data["productivity"] = data["commits"] / data["developers"]

data["risk_score"] = (
    data["bug_density"] * 0.5 +
    data["complexity"] * 0.3 -
    data["coverage"] * 0.2
)

def classify_risk(score):
    if score < -5:
        return "Low"
    elif score < 0:
        return "Medium"
    return "High"

data["risk"] = data["risk_score"].apply(classify_risk)

X = data.drop(["risk", "risk_score"], axis=1)
y = data["risk"]

le = LabelEncoder()
y_enc = le.fit_transform(y)

model = RandomForestClassifier(n_estimators=120, random_state=42)
model.fit(X, y_enc)

def predict_quality(commits, bugs, complexity, developers, coverage):
    bug_density = bugs / max(commits, 1)
    productivity = commits / max(developers, 1)

    row = pd.DataFrame([{
        "commits": commits,
        "bugs": bugs,
        "complexity": complexity,
        "developers": developers,
        "coverage": coverage,
        "bug_density": bug_density,
        "productivity": productivity
    }])

    pred = model.predict(row)
    model_risk = le.inverse_transform(pred)[0]

    if coverage < 50 and bug_density > 0.3:
        final_risk = "High"
    elif coverage < 60:
        final_risk = "Medium"
    else:
        final_risk = model_risk

    score = int(
        max(0, min(100, 100 - (bug_density * 100 + complexity * 5 - coverage * 0.7)))
    )

    reasons = []
    if coverage < 50:
        reasons.append("Low test coverage")
    if bug_density > 0.3:
        reasons.append("High bug density")
    if complexity > 7:
        reasons.append("High code complexity")
    if productivity < 20:
        reasons.append("Low developer productivity")

    return {
        "risk": final_risk,
        "score": score,
        "reasons": reasons,
        "metrics": {
            "bugs": bugs,
            "coverage": coverage,
            "complexity": complexity
        }
    }
