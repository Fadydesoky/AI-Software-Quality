# Software Quality Intelligence Platform

A modern AI-powered analytics tool that evaluates software quality, predicts risk levels, and provides actionable engineering insights.

## Overview

This platform helps engineering teams understand the health of their systems using key development metrics such as commits, bugs, complexity, team size, and test coverage.

It transforms raw inputs into:

* Quality score (0–100)
* Risk classification (Low / Medium / High)
* Confidence level
* Explainable insights and recommendations

## Live Demo

https://ai-software-quality-flax.vercel.app/

## Features

### Core Prediction Engine

* AI-based quality scoring system
* Risk classification (Low / Medium / High)
* Confidence indicator based on data stability

### Explainable AI

* Feature contribution breakdown
* Transparent scoring logic
* Metric impact visualization

### What-if Simulation

* Real-time scenario adjustments
* Instant feedback on score changes
* Optimization suggestions

### Insight Layer

* AI-generated system analysis
* Smart recommendations
* Weakness detection

### Analytics Dashboard

* Score distribution
* Historical tracking
* Trend indicators

### Export & Sharing

* Export results as CSV
* Generate shareable links
* PDF-ready reporting structure

## Tech Stack

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Recharts

## Project Structure

app/ – application routes and pages
components/ – reusable UI components
lib/ – prediction logic and utilities
public/ – static assets

## How It Works

The system calculates a quality score based on:

* Bug density (bugs / commits)
* Code complexity
* Test coverage
* Developer productivity

Each factor contributes differently to the final score, enabling explainable insights and optimization.

## Getting Started

```bash
npm install
npm run dev
```

Then open:
http://localhost:3000

## Use Cases

* Engineering health monitoring
* Code quality assessment
* Technical debt evaluation
* Pre-release risk analysis
* Team performance insights

## Future Improvements

* User authentication
* Team-based dashboards
* API integration with GitHub/GitLab
* Real-time CI/CD data ingestion
* Advanced ML models

## Author

Fady Desoky

---

This project demonstrates how AI can be applied to software engineering analytics to produce meaningful, actionable insights.
