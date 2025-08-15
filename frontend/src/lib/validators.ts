import { z } from "zod";

export const step1Schema = z.object({
  aadhaarNumber: z.string().regex(/^[0-9]{12}$/, "Enter a valid 12-digit Aadhaar"),
  entrepreneurName: z.string().min(3, "Enter full name"),
  mobile: z.string().regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit mobile"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required")
});

export const step2Schema = z.object({
  panNumber: z.string().regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, "Invalid PAN format"),
  email: z.string().email("Enter a valid email")
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;

export const panRegex = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/;
