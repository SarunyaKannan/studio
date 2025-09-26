"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Weight, Ruler, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getBmiCategory } from "@/lib/utils";
import { BmiResultDisplay } from "./BmiResultDisplay";
import { getBmiAdvice, type BmiAdviceResponse } from "@/ai/flows/bmi-visualization-advice";

type UnitSystem = "metric" | "imperial";

const metricSchema = z.object({
  weight: z.coerce.number({ invalid_type_error: "Must be a number" }).positive("Weight must be positive"),
  height: z.coerce.number({ invalid_type_error: "Must be a number" }).positive("Height must be positive"),
});

const imperialSchema = z.object({
  weight: z.coerce.number({ invalid_type_error: "Must be a number" }).positive("Weight must be positive"),
  feet: z.coerce.number({ invalid_type_error: "Must be a number" }).int().nonnegative("Feet must be a non-negative"),
  inches: z.coerce.number({ invalid_type_error: "Must be a number" }).int().nonnegative("Inches must be non-negative").max(11, "Inches must be < 12"),
}).refine(data => (data.feet * 12 + data.inches) > 0, {
  message: "Total height must be positive",
  path: ["feet"],
});

export type BmiResult = {
  bmi: number;
  category: string;
  advice: BmiAdviceResponse;
};

export function BmiCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BmiResult | null>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(unitSystem === 'metric' ? metricSchema : imperialSchema),
    defaultValues: { weight: 70, height: 1.75, feet: 5, inches: 9 },
    mode: "onChange",
  });
  
  React.useEffect(() => {
    form.trigger();
  }, [unitSystem, form]);

  const handleUnitChange = (value: string) => {
    const newUnit = value as UnitSystem;
    setUnitSystem(newUnit);
    form.reset({
      weight: newUnit === 'metric' ? 70 : 150,
      height: 1.75,
      feet: 5,
      inches: 9
    });
    setResult(null);
  };

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    setResult(null);

    try {
      let bmi: number;
      let weight: number;
      let height: number;

      if (unitSystem === 'metric') {
        weight = values.weight;
        height = values.height;
        bmi = weight / (height * height);
      } else {
        weight = values.weight;
        const totalInches = values.feet * 12 + values.inches;
        height = totalInches * 0.0254; // convert to meters
        bmi = (weight / (totalInches * totalInches)) * 703;
      }

      if (isNaN(bmi) || !isFinite(bmi) || bmi <= 0) {
        toast({
          variant: "destructive",
          title: "Invalid Calculation",
          description: "Please check your inputs. The calculated BMI is invalid.",
        });
        return;
      }
      
      const category = getBmiCategory(bmi);

      const advice = await getBmiAdvice({
        bmi,
        category,
        unit: unitSystem,
        weight: values.weight,
        height: unitSystem === 'metric' ? values.height : values.feet * 12 + values.inches,
      });
      
      setResult({
        bmi,
        category,
        advice,
      });

    } catch (e: any) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "An unexpected error occurred",
          description: e.message || "Could not get BMI advice. Please try again later.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleClear = () => {
    form.reset();
    setResult(null);
  };
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={unitSystem} onValueChange={handleUnitChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metric">Metric (kg, m)</TabsTrigger>
              <TabsTrigger value="imperial">Imperial (lbs, ft/in)</TabsTrigger>
            </TabsList>
            <TabsContent value="metric" className="space-y-6 pt-6 m-0">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="number" step="0.1" placeholder="e.g., 70" {...field} className="pl-10"/>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (m)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="number" step="0.01" placeholder="e.g., 1.75" {...field} className="pl-10"/>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="imperial" className="space-y-6 pt-6 m-0">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (lbs)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="number" step="0.1" placeholder="e.g., 150" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Height</FormLabel>
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="feet"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="number" placeholder="feet" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inches"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="number" placeholder="inches" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormItem>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" disabled={isLoading || !form.formState.isValid} className="w-full sm:w-auto flex-grow bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading ? <Loader2 className="animate-spin" /> : "Calculate BMI"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClear} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </form>
      </Form>
      {result && <BmiResultDisplay result={result} />}
    </>
  );
}
