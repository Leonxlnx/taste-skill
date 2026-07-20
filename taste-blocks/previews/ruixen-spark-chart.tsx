"use client";

import { SparkChart } from "@/registry/sources/ruixen-ui/components/ruixen-spark-chart";

const values = [18, 24, 22, 31, 29, 38, 42, 39, 51, 56, 54, 63];

export default function RuixenSparkChartPreview() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950 shadow-sm">
      <SparkChart
        data={values}
        color="#2563eb"
        height={168}
        label="Weekly signups"
        formatValue={(value) => `${Math.round(value)} signups`}
      />
    </div>
  );
}
