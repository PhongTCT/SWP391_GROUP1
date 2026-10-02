export interface UserSession {
  id: string;
  name: string;
  identifier: string;
  role: 'MEMBER' | 'STAFF' | 'COACH' | 'MANAGER';
}

export interface LoginResponse {
  token: string;
  user: UserSession;
}

// ============================================================
// REGISTER / OTP CONTRACTS
// ============================================================

export interface RegistrationResponse {
  message: string;
  userId: number;
  username: string;
}

export interface RegisterRequestPayload {
  username: string;
  password: string;
  email: string;
  role?: string;
}

export interface SendOtpResponse {
  message: string;
  destination: string;
  expiresInMinutes: number;
  debugOtp?: string;
}

// ============================================================
// API ERROR
// ============================================================

interface ApiErrorBody {
  message?: string;
  error?: string;
  code?: string;
  errors?: string[] | Record<string, string>;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(
    status: number,
    message: string,
    code?: string,
  ) {
    super(message);

    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

// ============================================================
// CONFIG
// ============================================================

export const AUTH_STORAGE_KEY = 'fitcenter_auth_session';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:8080/api/v1';

/**
 * Tạo URL API thống nhất.
 */
function buildApiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, '');

  const cleanPath = path.startsWith('/')
    ? path
    : `/${path}`;

  return `${base}${cleanPath}`;
}

// ============================================================
// COMMON API HELPERS
// ============================================================

/**
 * Đọc lỗi từ backend và chuyển thành ApiClientError.
 */
async function throwApiError(
  response: Response,
): Promise<never> {
  let body: ApiErrorBody | null;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = null;
  }

  let message =
    body?.message ??
    body?.error;

  if (!message && Array.isArray(body?.errors)) {
    message = body.errors.join(', ');
  }

  if (
    !message &&
    body?.errors &&
    !Array.isArray(body.errors)
  ) {
    const validationMessages =
      Object.values(body.errors);

    if (validationMessages.length > 0) {
      message = validationMessages.join(', ');
    }
  }

  if (!message) {
    switch (response.status) {
      case 400:
        message = 'Thông tin gửi lên không hợp lệ.';
        break;

      case 401:
        message = 'Bạn chưa được xác thực.';
        break;

      case 403:
        message =
          'Bạn không có quyền thực hiện thao tác này.';
        break;

      case 404:
        message =
          'Không tìm thấy dữ liệu yêu cầu.';
        break;

      case 409:
        message =
          'Thông tin tài khoản đã tồn tại.';
        break;

      case 429:
        message =
          'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.';
        break;

      default:
        message =
          'Không thể kết nối với hệ thống. Vui lòng thử lại.';
        break;
    }
  }

  throw new ApiClientError(
    response.status,
    message,
    body?.code,
  );
}

/**
 * Helper dùng chung cho POST JSON.
 */
async function postJson<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(
    buildApiUrl(path),
    {
      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    return throwApiError(response);
  }

  return (await response.json()) as T;
}

// ============================================================
// AUTH SESSION
// ============================================================

export function getCurrentUser(): UserSession | null {
  try {
    const raw =
      localStorage.getItem(AUTH_STORAGE_KEY);

    return raw
      ? (JSON.parse(raw) as UserSession)
      : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(
  user: UserSession,
): void {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(user),
  );
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('fitcenter_token');
}

// ============================================================
// US01 - LOGIN
// ============================================================

/**
 * Mock API Contract cho US01.
 *
 * Tạm giữ nguyên để không ảnh hưởng
 * luồng login hiện tại của project.
 */
export async function loginApi(
  identifier: string,
  password: string,
): Promise<LoginResponse> {
  // Giả lập độ trễ mạng
  await new Promise((resolve) =>
    setTimeout(resolve, 600),
  );

  const cleanId =
    identifier.trim().toLowerCase();

  // Validate nghiệp vụ mẫu
  if (password === 'wrongpass') {
    const error = new Error(
      'Tài khoản hoặc mật khẩu không chính xác.',
    ) as Error & {
      status?: number;
    };

    error.status = 401;

    throw error;
  }

  // Tự động phân vai trò để test luồng US01
  let role: UserSession['role'];
  let name: string;

  if (
    cleanId.includes('admin') ||
    cleanId.includes('manager') ||
    cleanId.includes('tuananh')
  ) {
    role = 'MANAGER';
    name =
      'Trần Công Tuấn Anh (Manager)';
  } else if (
    cleanId.includes('coach') ||
    cleanId.includes('elena') ||
    cleanId.includes('hung')
  ) {
    role = 'COACH';
    name =
      'Master Elena Vũ (Coach)';
  } else if (
    cleanId.includes('staff') ||
    cleanId.includes('letan') ||
    cleanId.includes('thinh')
  ) {
    role = 'STAFF';
    name =
      'Lễ Tân Thịnh (Receptionist)';
  } else {
    role = 'MEMBER';
    name =
      'Nguyễn Văn An (Member)';
  }

  const responseData: LoginResponse = {
    token: `mock_jwt_token_${Date.now()}`,

    user: {
      id: 'USR_001',
      name,
      identifier: cleanId,
      role,
    },
  };

  localStorage.setItem(
    'fitcenter_token',
    responseData.token,
  );

  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(responseData.user),
  );

  return responseData;
}

// ============================================================
// US02 / SCRUM-40 - REGISTER
// ============================================================

/**
 * Backend:
 *
 * POST /api/v1/auth/register
 *
 * Request:
 * {
 *   username,
 *   password,
 *   email,
 *   role
 * }
 */
export async function registerApi(
  payload: RegisterRequestPayload,
): Promise<RegistrationResponse> {
  return postJson<RegistrationResponse>(
    '/auth/register',
    {
      username:
        payload.username.trim(),

      password:
        payload.password,

      email:
        payload.email
          .trim()
          .toLowerCase(),

      role:
        payload.role ?? 'MEMBER',
    },
  );
}

// ============================================================
// US02 / SCRUM-40 - SEND OTP
// ============================================================

/**
 * Backend hiện tại:
 *
 * POST /api/v1/auth/send-otp
 *
 * OtpRequest:
 * {
 *   email,
 *   phoneNumber
 * }
 *
 * Registration hiện tại dùng email,
 * nên SCRUM-40 gửi OTP qua email.
 */
export async function sendOtpApi(
  email: string,
): Promise<SendOtpResponse> {
  return postJson<SendOtpResponse>(
    '/auth/send-otp',
    {
      email:
        email.trim().toLowerCase(),

      phoneNumber: null,
    },
  );
}