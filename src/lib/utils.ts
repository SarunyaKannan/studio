import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi >= 18.5 && bmi <= 24.9) return "Normal weight";
  if (bmi >= 25 && bmi <= 29.9) return "Overweight";
  if (bmi >= 30 && bmi <= 34.9) return "Obesity Class I";
  if (bmi >= 35 && bmi <= 39.9) return "Obesity Class II";
  return "Obesity Class III";
}
