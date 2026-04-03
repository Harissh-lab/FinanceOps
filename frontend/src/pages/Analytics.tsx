import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../components/ui/card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { useCategories, useSummary, useTrends } from '../hooks/useDashboard';

function projectFutureValue(principal: number, annualRate: number, years: number): number {
  return principal * (1 + annualRate) ** years;
}

function projectSipFutureValue(monthlyContribution: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return monthlyContribution * months;
  }

  return monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate);
}

function adjustForInflation(nominalValue: number, inflationRate: number, years: number): number {
  return nominalValue / (1 + inflationRate) ** years;
}

type RiskProfile = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';

type RiskConfig = {
  plans: Array<{ name: string; rate: number }>;
  portfolio: { emergency: number; fd: number; stocks: number };
};

const riskConfigs: Record<RiskProfile, RiskConfig> = {
  CONSERVATIVE: {
    plans: [
      { name: 'FD (Conservative)', rate: 0.065 },
      { name: 'Balanced Fund', rate: 0.095 },
      { name: 'Stocks (Aggressive)', rate: 0.12 },
    ],
    portfolio: { emergency: 0.3, fd: 0.5, stocks: 0.2 },
  },
  BALANCED: {
    plans: [
      { name: 'FD (Conservative)', rate: 0.07 },
      { name: 'Balanced Fund', rate: 0.11 },
      { name: 'Stocks (Aggressive)', rate: 0.15 },
    ],
    portfolio: { emergency: 0.2, fd: 0.35, stocks: 0.45 },
  },
  AGGRESSIVE: {
    plans: [
      { name: 'FD (Conservative)', rate: 0.072 },
      { name: 'Balanced Fund', rate: 0.125 },
      { name: 'Stocks (Aggressive)', rate: 0.18 },
    ],
    portfolio: { emergency: 0.15, fd: 0.2, stocks: 0.65 },
  },
};

export default function AnalyticsPage() {
  const summary = useSummary();
  const trends = useTrends();
  const categories = useCategories();
  const [years, setYears] = useState(5);
  const [allocationPercent, setAllocationPercent] = useState(40);
  const [inflationRate, setInflationRate] = useState(5);
  const [monthlySipAmount, setMonthlySipAmount] = useState(300);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('BALANCED');

  if (summary.isLoading || trends.isLoading || categories.isLoading) {
    return <Skeleton className="h-64" />;
  }

  const netBalance = summary.data?.netBalance ?? 0;
  const usableBalance = Math.max(0, netBalance);
  const suggestedAllocation = (usableBalance * allocationPercent) / 100;
  const riskConfig = riskConfigs[riskProfile];

  useEffect(() => {
    if (usableBalance > 0 && monthlySipAmount === 300) {
      setMonthlySipAmount(Math.max(100, Math.round((usableBalance * 0.1) / 12)));
    }
  }, [usableBalance, monthlySipAmount]);

  const scenarios = useMemo(() => {
    const plans = riskConfig.plans;

    return plans.map((plan) => {
      const lumpFutureValue = projectFutureValue(suggestedAllocation, plan.rate, years);
      const sipFutureValue = projectSipFutureValue(monthlySipAmount, plan.rate, years);
      const sipInvested = monthlySipAmount * years * 12;
      const inflation = inflationRate / 100;

      return {
        ...plan,
        invested: suggestedAllocation,
        futureValue: lumpFutureValue,
        profit: lumpFutureValue - suggestedAllocation,
        sipInvested,
        sipFutureValue,
        sipProfit: sipFutureValue - sipInvested,
        realFutureValue: adjustForInflation(lumpFutureValue, inflation, years),
        realSipFutureValue: adjustForInflation(sipFutureValue, inflation, years),
      };
    });
  }, [suggestedAllocation, years, inflationRate, monthlySipAmount, riskConfig]);

  const suggestedPortfolio = useMemo(() => {
    const emergency = suggestedAllocation * riskConfig.portfolio.emergency;
    const fd = suggestedAllocation * riskConfig.portfolio.fd;
    const stocks = suggestedAllocation * riskConfig.portfolio.stocks;
    return [
      { name: 'Emergency/Liquid', value: emergency },
      { name: 'FD', value: fd },
      { name: 'Stocks', value: stocks },
    ];
  }, [suggestedAllocation, riskConfig]);

  const profitChart = scenarios.map((s) => ({
    scenario: s.name,
    lumpSumProfit: Number(s.profit.toFixed(2)),
    sipProfit: Number(s.sipProfit.toFixed(2)),
  }));

  const bestScenario = useMemo(() => {
    if (scenarios.length === 0) {
      return null;
    }
    return [...scenarios].sort((a, b) => b.realSipFutureValue - a.realSipFutureValue)[0];
  }, [scenarios]);

  if (usableBalance <= 0) {
    return (
      <EmptyState
        title="No Surplus Balance Yet"
        description="Add income and expense records first. Analytics will generate investment and portfolio recommendations from your net balance."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="font-semibold">Investment Projection Engine (Default Assumption Model)</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Based on your current net balance, this model estimates future value if a portion is invested.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-6">
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Current Net Balance</p>
            <p className="text-xl font-bold">${usableBalance.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Risk Profile</p>
            <select
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              value={riskProfile}
              onChange={(e) => setRiskProfile(e.target.value as RiskProfile)}
            >
              <option value="CONSERVATIVE">Conservative</option>
              <option value="BALANCED">Balanced</option>
              <option value="AGGRESSIVE">Aggressive</option>
            </select>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Allocation %</p>
            <Input
              type="number"
              min={5}
              max={100}
              value={allocationPercent}
              onChange={(e) => setAllocationPercent(Math.max(5, Math.min(100, Number(e.target.value) || 5)))}
            />
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Investment Horizon (years)</p>
            <Input
              type="number"
              min={1}
              max={30}
              value={years}
              onChange={(e) => setYears(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
            />
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Inflation % (annual)</p>
            <Input
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={inflationRate}
              onChange={(e) => setInflationRate(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
            />
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-xs text-muted-foreground">Monthly SIP Amount</p>
            <Input
              type="number"
              min={100}
              value={monthlySipAmount}
              onChange={(e) => setMonthlySipAmount(Math.max(100, Number(e.target.value) || 100))}
            />
          </div>
        </div>
        <p className="mt-3 text-sm">
          Suggested investable amount: <span className="font-semibold">${suggestedAllocation.toLocaleString()}</span>
        </p>
        {bestScenario && (
          <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-700 dark:bg-emerald-950/30">
            <p className="font-semibold">Recommendation</p>
            <p className="text-muted-foreground">
              Based on your current assumptions, <span className="font-semibold">{bestScenario.name}</span> gives the strongest inflation-adjusted SIP projection over {years} years.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card key={scenario.name}>
            <p className="font-semibold">{scenario.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">Assumed annual return: {(scenario.rate * 100).toFixed(1)}%</p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-semibold">Lump Sum Model</p>
              <p>Invested: ${scenario.invested.toLocaleString()}</p>
              <p>Projected Value: ${scenario.futureValue.toLocaleString()}</p>
              <p className="text-emerald-600">Profit: ${scenario.profit.toLocaleString()}</p>
              <p className="pt-2 font-semibold">SIP Model</p>
              <p>Total SIP Invested: ${scenario.sipInvested.toLocaleString()}</p>
              <p>Projected SIP Value: ${scenario.sipFutureValue.toLocaleString()}</p>
              <p className="text-emerald-600">SIP Profit: ${scenario.sipProfit.toLocaleString()}</p>
              <p className="pt-2 text-xs text-muted-foreground">
                Inflation-adjusted SIP value: ${scenario.realSipFutureValue.toLocaleString()}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="mb-3 font-semibold">Projected Profit Comparison</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="lumpSumProfit" fill="#2d6a4f" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sipProfit" fill="#1f7a8c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="mb-3 font-semibold">Suggested Portfolio Allocation</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={suggestedPortfolio} dataKey="value" nameKey="name" outerRadius={105} label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <p className="mb-3 font-semibold">Projection Table (Quick Compare)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Scenario</th>
                <th>Lump Sum Profit</th>
                <th>SIP Profit</th>
                <th>Real SIP Value</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => (
                <tr key={`${scenario.name}-table`} className="border-b border-border/50">
                  <td className="py-2">{scenario.name}</td>
                  <td>${scenario.profit.toLocaleString()}</td>
                  <td>${scenario.sipProfit.toLocaleString()}</td>
                  <td>${scenario.realSipFutureValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-semibold">Monthly Performance</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#2d6a4f" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#e63946" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <p className="mb-3 font-semibold">Category Totals</p>
        {(categories.data?.length ?? 0) === 0 ? (
          <EmptyState title="No Analytics Data" description="Add records to unlock category analytics." />
        ) : (
          <div className="space-y-2">
            {(categories.data ?? []).map((category) => (
              <div key={category.category} className="rounded-xl border border-border p-3">
                <p className="font-semibold">{category.category}</p>
                <p className="text-sm text-muted-foreground">Total: ${category.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Income: ${category.income.toLocaleString()} | Expense: ${category.expense.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}
