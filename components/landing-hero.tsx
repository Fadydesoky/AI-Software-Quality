"use client"

import { ArrowRight, Code2, Gauge, LineChart, Sparkles, Users, Building2, Rocket, CheckCircle2, Zap, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LandingHeroProps {
  onGetStarted: () => void
}

export function LandingHero({ onGetStarted }: LandingHeroProps) {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Analytics
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
              AI-powered Software{" "}
              <span className="relative">
                <span className="relative z-10 text-primary">Quality Intelligence</span>
                <span className="absolute -inset-1 -z-10 block -skew-y-2 bg-primary/10 rounded-lg" />
              </span>
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-muted-foreground text-balance sm:text-xl">
              Analyze, predict, and improve your code quality in seconds. 
              Get actionable insights powered by machine learning, not guesswork.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="h-12 px-8 text-base gap-2 shadow-lg shadow-primary/20"
              >
                Analyze My Project
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 px-8 text-base"
                onClick={onGetStarted}
              >
                See How It Works
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>No setup required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Instant results</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Explainable AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to better code quality
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From raw metrics to actionable intelligence in seconds.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                icon: Code2,
                title: "Input Your Metrics",
                description: "Enter key data points: commits, bugs, complexity, team size, and test coverage."
              },
              {
                step: "02",
                icon: Gauge,
                title: "Get AI Analysis",
                description: "Our model calculates a quality score, risk level, and confidence rating instantly."
              },
              {
                step: "03",
                icon: LineChart,
                title: "Act on Insights",
                description: "Receive prioritized recommendations and simulate improvements with what-if scenarios."
              }
            ].map((item, index) => (
              <Card 
                key={item.step} 
                className={cn(
                  "relative overflow-hidden group hover:shadow-lg transition-all duration-300",
                  "border-border/50 bg-gradient-to-br from-card to-card/80"
                )}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-4xl font-bold text-muted-foreground/20 group-hover:text-primary/20 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is This For Section */}
      <section className="py-20 sm:py-28 border-b border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Who Is This For</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for teams who ship
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you are shipping solo or scaling a team, gain clarity on code health.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Developers",
                description: "Understand how your commits impact quality. Catch issues before they become tech debt.",
                features: ["Personal quality tracking", "Code impact analysis", "Optimization tips"]
              },
              {
                icon: Building2,
                title: "Engineering Teams",
                description: "Align on quality standards across the codebase. Make data-driven engineering decisions.",
                features: ["Team benchmarks", "Historical trends", "Risk forecasting"]
              },
              {
                icon: Rocket,
                title: "Startups",
                description: "Move fast without breaking things. Balance speed with sustainable code quality.",
                features: ["Pre-release checks", "Technical debt alerts", "Growth-ready insights"]
              }
            ].map((item) => (
              <Card 
                key={item.title}
                className="border-border/50 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <ul className="space-y-2">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Real-World Example Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4">Real-World Example</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              See it in action
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              How a growing engineering team used quality intelligence to improve their release cycle.
            </p>
          </div>

          <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Scenario Description */}
                <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0">
                    Case Study
                  </Badge>
                  <h3 className="text-2xl font-bold mb-4">
                    FinFlow: From 40% test coverage to release confidence
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    A 12-person fintech startup was shipping fast but accumulating technical debt. 
                    Bug reports were increasing with each release, and the team had no visibility 
                    into which areas of the codebase were at highest risk.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Initial Analysis</p>
                        <p className="text-sm text-muted-foreground">Score: 52 (High Risk) - Bug density at 0.35, coverage at 40%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">What-If Simulation</p>
                        <p className="text-sm text-muted-foreground">Used simulator to identify: +20% coverage would yield +18 score points</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Result After 6 Weeks</p>
                        <p className="text-sm text-muted-foreground">Score: 78 (Low Risk) - Coverage at 65%, bugs reduced by 45%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Visualization */}
                <div className="bg-muted/50 p-8 sm:p-10 lg:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border/40">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        Quality Score
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">78</span>
                        <span className="text-sm text-emerald-500 font-medium">+26</span>
                      </div>
                      <p className="text-xs text-muted-foreground">from 52</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        Risk Level
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-emerald-500">Low</span>
                      </div>
                      <p className="text-xs text-muted-foreground">from High</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Zap className="h-4 w-4 text-primary" />
                        Test Coverage
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">65%</span>
                        <span className="text-sm text-emerald-500 font-medium">+25%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">from 40%</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Bug Reduction
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">45%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">fewer bugs per release</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border/40">
                    <p className="text-sm text-muted-foreground italic">
                      &quot;We finally had visibility into our technical debt. The what-if simulator 
                      helped us prioritize the right improvements.&quot;
                    </p>
                    <p className="text-sm font-medium mt-2">- Engineering Lead, FinFlow</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="h-12 px-8 text-base gap-2 shadow-lg shadow-primary/20"
            >
              Start Your Analysis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
