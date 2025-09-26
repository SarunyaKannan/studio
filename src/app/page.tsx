import { BmiCalculator } from '@/components/BmiCalculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline font-bold text-primary">
              BMI Insights
            </CardTitle>
            <CardDescription className="text-lg">
              Calculate your BMI and get a visual interpretation of your result.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BmiCalculator />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
