# Software Quality Intelligence Platform

**AI-powered code quality analytics for engineering teams.**

Analyze, predict, and improve your software quality in seconds. Get actionable insights powered by machine learning, not guesswork.

[Live Demo](https://ai-software-quality-flax.vercel.app/) | [Get Started](#getting-started)

---

## Why This Matters

Every engineering team ships code under pressure. But without visibility into code health, small issues compound into costly technical debt, unpredictable releases, and burnt-out teams.

This platform gives you **clarity**. Input your metrics, get an instant quality score, understand the risk, and know exactly what to improve first.

No black boxes. No vague reports. Just explainable AI that tells you what matters.

---

## Features

### Quality Scoring Engine
AI-based quality scoring (0-100) with risk classification and confidence indicators. Know your code health at a glance.

### Explainable AI
See exactly how each metric contributes to your score. Transparent logic, not magic numbers.

### What-If Simulator
Adjust inputs in real-time and see how changes impact your score. Find the highest-leverage improvements before writing code.

### Smart Recommendations
Prioritized, actionable suggestions based on your specific metrics. Not generic advice.

### Analytics Dashboard
Track score distribution, historical trends, and compare runs side-by-side.

### Export & Share
Export results as CSV, generate shareable links, and create PDF-ready reports.

---

## How It Works

The platform calculates a quality score based on four core factors:

| Factor | What It Measures |
|--------|------------------|
| **Bug Density** | Bugs per commit - lower is better |
| **Code Complexity** | Cyclomatic complexity - manageable is ideal |
| **Test Coverage** | Percentage of code covered by tests |
| **Developer Productivity** | Commits per developer - balanced is healthy |

Each factor is weighted based on empirical research. The model produces:

- **Quality Score** (0-100): Overall code health
- **Risk Level** (Low / Medium / High): Release readiness indicator
- **Confidence Level**: How reliable the prediction is given your data
- **Recommendations**: Specific actions to improve your score

The scoring logic is fully visible. Toggle Advanced Mode to see the exact formulas.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Charts | Recharts |

---

## Project Structure

```
app/           → Routes and pages
components/    → UI components
lib/           → Prediction engine and utilities
public/        → Static assets
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start analyzing.

---

## Use Cases

- **Pre-release risk checks** — Know if you're ready to ship
- **Technical debt tracking** — Quantify and prioritize what to fix
- **Team health monitoring** — Spot trends before they become problems
- **Code review decisions** — Data-backed quality conversations
- **Sprint planning** — Factor quality into velocity

---

## Roadmap

- [ ] GitHub/GitLab integration for automated metrics
- [ ] Team dashboards with role-based views
- [ ] Real-time CI/CD data ingestion
- [ ] Historical trend alerts
- [ ] API access for custom integrations

---

## Author

Built by **Fady Desoky**

---

<p align="center">
  <em>Ship better code, faster.</em>
</p>
