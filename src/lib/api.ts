import type { HealthCheckRequest, HealthCheckResponse, VoiceResponse, ScanResponse } from './types';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed.error || parsed.message || parsed.detail || text;
    } catch {
      // not JSON, keep text
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

/** Send voice recording for transcription + translation */
export async function sendVoice(audioBlob: Blob): Promise<VoiceResponse> {
  const formData = new FormData();
  let ext = 'wav';
  if (audioBlob.type.includes('webm')) ext = 'webm';
  else if (audioBlob.type.includes('mp4')) ext = 'mp4';
  else if (audioBlob.type.includes('ogg')) ext = 'ogg';

  formData.append('audio', audioBlob, `recording.${ext}`);
  const res = await fetch(`${API_BASE}/voice`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<VoiceResponse>(res);
}

/** Send document image for text extraction */
export async function sendScan(imageFile: File): Promise<ScanResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<ScanResponse>(res);
}

/** Run health check (danger rules + AI assessment) */
export async function sendHealthCheck(request: HealthCheckRequest): Promise<HealthCheckResponse> {
  const res = await fetch(`${API_BASE}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<HealthCheckResponse>(res);
}
