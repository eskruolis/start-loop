"use client"

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatMonth } from "@/lib/format"
import { formatMoney } from "@/lib/money"
import type { SalesStats } from "../stats"

/**
 * The charts that replace the Google Sheets pie and column charts. Colours come from the theme's
 * --chart-1…5 tokens, so they follow light and dark mode.
 */
const money = (v: unknown) => (typeof v === "number" ? formatMoney(v) : String(v))
const compact = (cents: number) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(
    cents / 100
  )

export function RevenueByMonthChart({ data }: { data: SalesStats["byMonth"] }) {
  const config = {
    amountCents: { label: "Revenue", color: "var(--chart-1)" },
  } satisfies ChartConfig
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by month</CardTitle>
        <CardDescription>Sent and paid sales, last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <BarChart data={data} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickFormatter={(m: string) => formatMonth(m).split(" ")[0] ?? m}
            />
            <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={compact} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(m) => formatMonth(String(m))}
                  formatter={(v) => money(v)}
                />
              }
            />
            <Bar dataKey="amountCents" fill="var(--color-amountCents)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function RevenueByCategoryChart({ data }: { data: SalesStats["byCategory"] }) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.category, { label: d.category, color: `var(--chart-${(i % 5) + 1})` }])
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by category</CardTitle>
        <CardDescription>Sent and paid sales, all time</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <ChartContainer config={config} className="mx-auto aspect-square h-64">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent nameKey="category" formatter={(v) => money(v)} hideLabel />
                }
              />
              <Pie
                data={data}
                dataKey="amountCents"
                nameKey="category"
                innerRadius={55}
                strokeWidth={2}
              >
                {data.map((d, i) => (
                  <Cell key={d.category} fill={`var(--chart-${(i % 5) + 1})`} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="category" />}
                className="flex-wrap"
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No revenue yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
