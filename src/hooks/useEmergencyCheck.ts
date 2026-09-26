import { useMemo } from 'react';
import { checkDangerSigns, type DangerCheckResult } from '@/lib/rules';

export function useEmergencyCheck(text: string): DangerCheckResult {
  return useMemo(() => checkDangerSigns(text), [text]);
}
