// Shared OTP storage for phone verification
export const OTP_STORAGE = new Map<string, { code: string; expires: number }>()
