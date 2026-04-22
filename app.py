import streamlit as st
from model import predict_quality
import pandas as pd

# -------------------------------
# Page Config
# -------------------------------
st.set_page_config(page_title="AI Software Quality Predictor", layout="centered")

st.title("🚀 AI Software Quality Predictor")
st.markdown("### Predict software risk using AI + Data")

# -------------------------------
# Inputs
# -------------------------------
col1, col2 = st.columns(2)

with col1:
    commits = st.number_input("Commits", 50, 1000, 200)
    bugs = st.number_input("Bugs", 0, 200, 50)
    developers = st.number_input("Developers", 1, 20, 5)

with col2:
    complexity = st.slider("Complexity", 1, 10, 5)
    coverage = st.slider("Test Coverage (%)", 0, 100, 70)

# -------------------------------
# Prediction Button
# -------------------------------
if st.button("🔍 Predict Quality"):

    risk, explanation, score = predict_quality(
        commits, bugs, complexity, developers, coverage
    )

    st.divider()

    # -------------------------------
    # Risk Display
    # -------------------------------
    if risk == "High":
        st.error(f"🚨 Risk Level: {risk}")
    elif risk == "Medium":
        st.warning(f"⚠️ Risk Level: {risk}")
    else:
        st.success(f"✅ Risk Level: {risk}")

    # -------------------------------
    # Score
    # -------------------------------
    st.metric("📊 Quality Score", f"{score}/100")

    # -------------------------------
    # Explanation
    # -------------------------------
    st.markdown("### 🧠 Why?")
    if explanation:
        for e in explanation:
            st.write(f"- {e}")
    else:
        st.write("✔️ System is healthy")

    # -------------------------------
    # Visualization
    # -------------------------------
    st.markdown("### 📊 Key Metrics")

    df = pd.DataFrame({
        "Metric": ["Bugs", "Coverage", "Complexity"],
        "Value": [bugs, coverage, complexity]
    })

    st.bar_chart(df.set_index("Metric"))

    # -------------------------------
    # Insights
    # -------------------------------
    st.markdown("### 💡 Recommendations")

    if coverage < 60:
        st.write("• Increase test coverage to reduce risk")
    if bugs > 50:
        st.write("• Reduce bugs before next release")
    if complexity > 7:
        st.write("• Refactor code to reduce complexity")

    st.divider()

    st.caption("🔬 AI-powered software quality intelligence system")
