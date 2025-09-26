"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BmiResult } from "./BmiCalculator";

export function BmiResultDisplay({ result }: { result: BmiResult }) {
  const { bmi, category, chartData } = result;

  return (
    <div className="mt-8 animate-in fade-in-50 duration-500 space-y-8">
      <Card className="bg-muted/50">
        <CardHeader>
          <CardDescription className="text-center text-lg">Your Result</CardDescription>
          <CardTitle className="text-center text-4xl font-bold text-primary">
            {bmi.toFixed(2)}
          </CardTitle>
          <p className="text-center text-xl text-foreground">
            {category}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">BMI Context</CardTitle>
          <CardDescription>How your BMI compares to the standard ranges.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64">
            <ResponsiveContainer>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="bmi" fill="hsl(var(--primary))" name="Your BMI" />
                    <Bar dataKey="range" fill="hsl(var(--accent))" name="Healthy Range" />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
