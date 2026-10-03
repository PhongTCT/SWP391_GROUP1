import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useLocation,
} from 'react-router-dom';

interface VerifyOtpLocationState {
  target?: string;
}

const OTP_LENGTH = 6;
const OTP_EXPIRE_SECONDS = 5 * 60;

export function VerifyOtpPage() {
  const location = useLocation();

  const state =
    location.state as VerifyOtpLocationState | null;

  const target = state?.target;

  // Lưu 6 số OTP.
  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill(''),
  );

  // Thời gian còn lại của OTP.
  const [timeLeft, setTimeLeft] = useState(
    OTP_EXPIRE_SECONDS,
  );

  // Dùng ref để focus từng ô OTP.
  const inputRefs =
    useRef<Array<HTMLInputElement | null>>([]);

  const isExpired = timeLeft === 0;

  // Countdown mỗi 1 giây.
  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((currentTime) =>
        Math.max(currentTime - 1, 0),
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [timeLeft]);

  // Xử lý khi nhập một số OTP.
  const handleOtpChange = (
    index: number,
    value: string,
  ) => {
    const digit = value.replace(/\D/g, '');

    if (!digit) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1);

    setOtp(newOtp);

    // Nhập xong thì chuyển sang ô kế tiếp.
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Nếu bấm Backspace ở ô trống thì quay về ô trước.
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

  // Chuyển giây thành dạng 05:00, 04:59...
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainSeconds,
    ).padStart(2, '0')}`;
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
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isExpired}
              onChange={(event) =>
                handleOtpChange(
                  index,
                  event.target.value,
                )
              }
              onKeyDown={(event) =>
                handleKeyDown(index, event)
              }
              aria-label={`OTP digit ${index + 1}`}
              style={{
                width: '48px',
                height: '56px',
                border: '1px solid #D8D2CC',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#1A1614',
                background: isExpired
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

        <button
          type="button"
          disabled={!isExpired}
          style={{
            width: '100%',
            height: '48px',
            border: 'none',
            borderRadius: '6px',
            background: isExpired
              ? '#211C18'
              : '#D8D2CC',
            color: '#FFFFFF',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.82rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            cursor: isExpired
              ? 'pointer'
              : 'not-allowed',
            marginBottom: '24px',
          }}
        >
          GỬI LẠI MÃ
        </button>

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
      </section>
    </main>
  );
}