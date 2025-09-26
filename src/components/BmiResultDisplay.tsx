"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type VisualizeBmiResultWithContextualAdviceOutput } from "@/ai/flows/bmi-visualization-advice";

interface BmiResultDisplayProps {
  result: VisualizeBmiResultWithContextualAdviceOutput & {
    bmi: number;
    category: string;
  };
}

export function BmiResultDisplay({ result }: BmiResultDisplayProps) {
  const { bmi, category, graphDataUri, advice } = result;

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
        <CardContent className="space-y-6">
          {graphDataUri && (
            <div className="relative mx-auto w-full max-w-md aspect-[2/1]">
              <Image
                src={graphDataUri}
                alt="BMI categories graph"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold mb-2">Personalized Advice</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{advice}</p>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Disclaimer: This is not medical advice. Consult with a healthcare professional for personalized health guidance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
