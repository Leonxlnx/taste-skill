"use client"

"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/registry/sources/shadcn-ui/components/radix-nova/chart"

const data = [{ month: "Jan", visits: 186 }, { month: "Feb", visits: 305 }, { month: "Mar", visits: 237 }]
export default function Preview() { return <ChartContainer className="h-64 w-full" config={{ visits: { label: "Visits", color: "var(--chart-1)" } }}><BarChart data={data}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="visits" fill="var(--color-visits)" radius={4} /></BarChart></ChartContainer> }
