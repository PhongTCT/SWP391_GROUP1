import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  ApiClientError,
  sendOtpApi,
  verifyOtpApi,
} from '../../shared/api/client';

interface VerifyOtpLocationState {
  target?: string;
}

const OTP_LENGTH = 6;

// OTP có hiệu lực 5 phút.
const OTP_EXPIRE_SECONDS = 5 * 60;

// Chỉ được gửi lại OTP sau mỗi 60 giây.
const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state =
    location.state as VerifyOtpLocationState | null;

  const target = state?.target;

  // Lưu 6 số OTP.
  // Ví dụ: ['1', '2', '3', '4', '5', '6']
  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill(''),
  );

  // Thời gian OTP còn hiệu lực.
  const [timeLeft, setTimeLeft] = useState(
    OTP_EXPIRE_SECONDS,
  );

  // Thời gian phải chờ trước khi resend.
  const [resendCooldown, setResendCooldown] =
    useState(RESEND_COOLDOWN_SECONDS);

  // Trạng thái khi đang gọi API verify.
  const [isVerifying, setIsVerifying] =
    useState(false);

  // Trạng thái khi đang gọi API resend.
  const [isResending, setIsResending] =
    useState(false);

  // Xác thực thành công hay chưa.
  const [isVerified, setIsVerified] =
    useState(false);

  // Thông báo lỗi.
  const [errorMessage, setErrorMessage] =
    useState('');

  // Thông báo thành công.
  const [successMessage, setSuccessMessage] =
    useState('');

  // Lưu reference của 6 ô input
  // để có thể tự động focus.
  const inputRefs =
    useRef<Array<HTMLInputElement | null>>([]);

  const isExpired = timeLeft === 0;

  // Ghép 6 ô thành một chuỗi.
  // Ví dụ: ['1','2','3','4','5','6']
  // thành "123456".
  const otpCode = otp.join('');

  const isOtpComplete =
    otpCode.length === OTP_LENGTH;

  // ============================================================
  // OTP COUNTDOWN - 5 PHÚT
  // ============================================================

  useEffect(() => {
    if (
      timeLeft <= 0 ||
      isVerified
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((currentTime) =>
        Math.max(currentTime - 1, 0),
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [timeLeft, isVerified]);

  // ============================================================
  // RESEND COOLDOWN - 60 GIÂY
  // ============================================================

  useEffect(() => {
    if (
      resendCooldown <= 0 ||
      isVerified
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldown((currentTime) =>
        Math.max(currentTime - 1, 0),
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [resendCooldown, isVerified]);

  // ============================================================
  // NHẬP OTP
  // ============================================================

  const handleOtpChange = (
    index: number,
    value: string,
  ) => {
    // Chỉ cho phép nhập số.
    const digit = value.replace(/\D/g, '');

    // Nếu xóa số.
    if (!digit) {
      const newOtp = [...otp];

      newOtp[index] = '';

      setOtp(newOtp);

      return;
    }

    const newOtp = [...otp];

    // Chỉ lấy một số cuối cùng.
    newOtp[index] = digit.slice(-1);

    setOtp(newOtp);

    // Nhập xong thì tự động sang ô kế tiếp.
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Nếu bấm Backspace ở ô trống,
  // quay về ô phía trước.
  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === 'Backspace' &&
      otp[index] === '' &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const handleVerifyOtp = async () => {
    if (!target) {
      setErrorMessage(
        'Không tìm thấy email cần xác thực.',
      );
      return;
    }

    if (!isOtpComplete) {
      setErrorMessage(
        'Vui lòng nhập đủ 6 số OTP.',
      );
      return;
    }

    if (isExpired) {
      setErrorMessage(
        'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.',
      );
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsVerifying(true);

    try {
      const response = await verifyOtpApi(
        target,
        otpCode,
      );

      if (response.isVerified) {
        setIsVerified(true);

        setSuccessMessage(
          response.message ||
            'Xác thực thành công. Tài khoản đã được kích hoạt.',
        );
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);

        // Nếu backend báo OTP hết hạn hoặc đã nhập sai
        // quá số lần cho phép thì coi OTP hiện tại
        // không còn sử dụng được nữa.
        if (
          error.code === 'OTP_EXPIRED' ||
          error.code === 'MAX_ATTEMPTS'
        ) {
          setTimeLeft(0);
        }
      } else {
        setErrorMessage(
          'Không thể xác thực OTP. Vui lòng thử lại.',
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResendOtp = async () => {
    if (!target) {
      setErrorMessage(
        'Không tìm thấy email cần gửi OTP.',
      );
      return;
    }

    // Chưa đủ 60 giây thì không được resend.
    if (resendCooldown > 0) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      await sendOtpApi(target);

      // Xóa mã đang nhập trên giao diện.
      setOtp(
        Array(OTP_LENGTH).fill(''),
      );

      // OTP mới có hiệu lực lại 5 phút.
      setTimeLeft(
        OTP_EXPIRE_SECONDS,
      );

      // Resend xong phải chờ tiếp 60 giây.
      setResendCooldown(
        RESEND_COOLDOWN_SECONDS,
      );

      setSuccessMessage(
        'Mã OTP mới đã được gửi.',
      );

      // Chờ giao diện render lại rồi
      // focus về ô OTP đầu tiên.
      window.setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Không thể gửi lại OTP. Vui lòng thử lại.',
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  // ============================================================
  // FORMAT THỜI GIAN
  // ============================================================

  const formatTime = (seconds: number) => {
    const minutes =
      Math.floor(seconds / 60);

    const remainSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      '0',
    )}:${String(remainSeconds).padStart(
      2,
      '0',
    )}`;
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F8F5F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        boxSizing: 'border-box',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#FFFFFF',
          borderRadius: '8px',
          padding: '48px 40px',
          boxShadow:
            '0 20px 50px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(33, 28, 24, 0.06)',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            color: '#8C847C',
            marginBottom: '12px',
            fontWeight: 600,
          }}
        >
          XÁC THỰC TÀI KHOẢN
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontWeight: 600,
            color: '#1A1614',
            margin: '0 0 16px',
          }}
        >
          Kiểm Tra Email
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            color: '#7E7771',
            lineHeight: 1.7,
            margin: '0 0 8px',
          }}
        >
          Mã OTP đã được gửi đến
        </p>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            color: '#1A1614',
            margin: '0 0 28px',
            wordBreak: 'break-word',
          }}
        >
          {target ?? 'email đăng ký của bạn'}
        </p>

        {errorMessage && (
          <div
            style={{
              padding: '12px',
              marginBottom: '18px',
              borderRadius: '6px',
              background: '#FFF1F0',
              color: '#B42318',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: '12px',
              marginBottom: '18px',
              borderRadius: '6px',
              background: '#F0F9F4',
              color: '#157347',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {successMessage}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] =
                  element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={
                isExpired ||
                isVerifying ||
                isVerified
              }
              onChange={(event) =>
                handleOtpChange(
                  index,
                  event.target.value,
                )
              }
              onKeyDown={(event) =>
                handleKeyDown(
                  index,
                  event,
                )
              }
              aria-label={`OTP digit ${index + 1}`}
              style={{
                width: '48px',
                height: '56px',
                border:
                  '1px solid #D8D2CC',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#1A1614',
                background:
                  isExpired ||
                  isVerified
                    ? '#F3F0EC'
                    : '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          ))}
        </div>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            margin: '0 0 20px',
            color: isExpired
              ? '#B42318'
              : '#7E7771',
          }}
        >
          {isExpired
            ? 'Mã OTP đã hết hạn.'
            : `Mã OTP hết hạn sau ${formatTime(
                timeLeft,
              )}`}
        </p>

        {!isVerified && (
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={
              !isOtpComplete ||
              isExpired ||
              isVerifying ||
              isResending ||
              !target
            }
            style={{
              width: '100%',
              height: '48px',
              border: 'none',
              borderRadius: '6px',
              background:
                isOtpComplete &&
                !isExpired &&
                !isVerifying &&
                !isResending &&
                target
                  ? '#211C18'
                  : '#D8D2CC',
              color: '#FFFFFF',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor:
                isOtpComplete &&
                !isExpired &&
                !isVerifying &&
                !isResending &&
                target
                  ? 'pointer'
                  : 'not-allowed',
              marginBottom: '12px',
            }}
          >
            {isVerifying
              ? 'ĐANG XÁC THỰC...'
              : 'XÁC THỰC OTP'}
          </button>
        )}

        {!isVerified && (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={
              resendCooldown > 0 ||
              isResending ||
              isVerifying ||
              !target
            }
            style={{
              width: '100%',
              height: '48px',
              border: 'none',
              borderRadius: '6px',
              background:
                resendCooldown === 0 &&
                !isResending &&
                !isVerifying &&
                target
                  ? '#211C18'
                  : '#D8D2CC',
              color: '#FFFFFF',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor:
                resendCooldown === 0 &&
                !isResending &&
                !isVerifying &&
                target
                  ? 'pointer'
                  : 'not-allowed',
              marginBottom: '24px',
            }}
          >
            {isResending
              ? 'ĐANG GỬI...'
              : resendCooldown > 0
                ? `GỬI LẠI MÃ (${resendCooldown}s)`
                : 'GỬI LẠI MÃ'}
          </button>
        )}

        {isVerified ? (
          <button
            type="button"
            onClick={() =>
              navigate('/login')
            }
            style={{
              width: '100%',
              height: '48px',
              border: 'none',
              borderRadius: '6px',
              background: '#211C18',
              color: '#FFFFFF',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ĐẾN TRANG ĐĂNG NHẬP
          </button>
        ) : (
          <Link
            to="/login"
            style={{
              color: '#1A1614',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ← Quay lại đăng nhập
          </Link>
        )}
      </section>
    </main>
  );
}