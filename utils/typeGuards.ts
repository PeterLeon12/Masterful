// Type guards for better type safety

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isUserRole(value: unknown): value is 'CLIENT' | 'PROFESSIONAL' | 'ADMIN' {
  return isString(value) && ['CLIENT', 'PROFESSIONAL', 'ADMIN'].includes(value);
}

export function isJobStatus(value: unknown): value is 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PAUSED' {
  return isString(value) && ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PAUSED'].includes(value);
}

export function isPriority(value: unknown): value is 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' {
  return isString(value) && ['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(value);
}

export function isApplicationStatus(value: unknown): value is 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' {
  return isString(value) && ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(value);
}

export function isMessageType(value: unknown): value is 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' {
  return isString(value) && ['TEXT', 'IMAGE', 'FILE', 'SYSTEM'].includes(value);
}

export function isPaymentStatus(value: unknown): value is 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' {
  return isString(value) && ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(value);
}

export function isSubscriptionStatus(value: unknown): value is 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING' {
  return isString(value) && ['ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'].includes(value);
}

export function isNotificationType(value: unknown): value is 'JOB_APPLICATION' | 'MESSAGE' | 'PAYMENT' | 'SYSTEM' {
  return isString(value) && ['JOB_APPLICATION', 'MESSAGE', 'PAYMENT', 'SYSTEM'].includes(value);
}

// Utility function to safely parse JSON
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch {
    return fallback;
  }
}

// Utility function to safely stringify JSON
export function safeJsonStringify(obj: unknown, fallback: string = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return fallback;
  }
}

// Utility function to check if a value is a valid email
export function isValidEmail(email: unknown): email is string {
  if (!isString(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to check if a value is a valid phone number
export function isValidPhone(phone: unknown): phone is string {
  if (!isString(phone)) return false;
  const phoneRegex = /^(\+40|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Utility function to check if a value is a valid password
export function isValidPassword(password: unknown): password is string {
  if (!isString(password)) return false;
  return password.length >= 8 && 
         /(?=.*[a-z])/.test(password) && 
         /(?=.*[A-Z])/.test(password) && 
         /(?=.*\d)/.test(password);
}
