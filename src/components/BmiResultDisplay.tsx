"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BmiResultDisplayProps {
  result: {
    bmi: number;
    category: string;
  };
}

export function BmiResultDisplay({ result }: BmiResultDisplayProps) {
  const { bmi, category } = result;

  return (
    <div className="mt-8 animate-in fade-in-50 duration-500">
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
    </div>
  );
}
