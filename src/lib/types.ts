import { z } from 'zod';

// Risk levels use universal color coding
export const RiskLevel = z.enum(['RED', 'YELLOW', 'GREEN']);
export type RiskLevel = z.infer<typeof RiskLevel>;

// Body regions that can be tapped on the body map
export const BodyRegion = z.enum([
  'head', 'chest', 'stomach', 'left-arm', 'right-arm',
  'left-leg', 'right-leg', 'back', 'full-body'
]);
export type BodyRegion = z.infer<typeof BodyRegion>;

// What we send to /api/check
export const HealthCheckRequestSchema = z.object({
  symptoms: z.string().min(1, 'Please describe the symptoms'),
  bodyRegions: z.array(z.string()).optional(),
  documentText: z.string().optional(),
  vitalSigns: z.object({
    temperature: z.number().optional(),
    heartRate: z.number().optional(),
    bloodPressure: z.string().optional(),
    oxygenLevel: z.number().optional(),
  }).optional(),
});
export type HealthCheckRequest = z.infer<typeof HealthCheckRequestSchema>;

// What we get back from /api/check
export const HealthCheckResponseSchema = z.object({
  level: RiskLevel,
  reasons: z.array(z.string()),
  guidance: z.string(),
  guidanceHindi: z.string(),
  nextSteps: z.array(z.string()),
  audioBase64: z.string(),
  source: z.enum(['danger_rules', 'ai_assessment']),
});
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// Voice transcription response
export const VoiceResponseSchema = z.object({
  transcriptHindi: z.string(),
  transcriptEnglish: z.string(),
  language: z.string(),
});
export type VoiceResponse = z.infer<typeof VoiceResponseSchema>;

// Document scan response  
export const ScanResponseSchema = z.object({
  extractedText: z.string(),
  jobId: z.string().optional(),
});
export type ScanResponse = z.infer<typeof ScanResponseSchema>;

export type UserMode = 'patient' | 'asha';
export type UILanguage = 'hi' | 'en' | 'bn' | 'te' | 'mr';

export interface VitalsState {
  temperature?: number;
  heartRate?: number;
  bloodPressure?: string;
  oxygenLevel?: number;
}

// App-level state for the wizard flow
export type AppStep = 'speak' | 'scan' | 'result';

export interface AppState {
  userMode: UserMode;
  uiLanguage: UILanguage;
  step: AppStep;
  isLoading: boolean;
  error: string | null;
  // ASHA mode beneficiary details
  patientName: string;
  patientAge: string;
  patientGender: string;
  vitals: VitalsState;
  // Voice input
  transcriptHindi: string;
  transcriptEnglish: string;
  // Body map selections
  selectedRegions: string[];
  // Document scan
  documentText: string;
  // Health check result
  result: HealthCheckResponse | null;
  // ASHA verified status
  isAshaVerified: boolean;
}
