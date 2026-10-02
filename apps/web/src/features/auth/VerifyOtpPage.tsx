import { Link, useLocation } from 'react-router-dom';

interface VerifyOtpLocationState {
  target?: string;
}

export function VerifyOtpPage() {
  const location = useLocation();

  const state =
    location.state as VerifyOtpLocationState | null;

  const target = state?.target;

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
            margin: '0 0 12px',
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

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.78rem',
            color: '#8C847C',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          Màn hình nhập và xác thực mã OTP sẽ được hoàn thiện
          trong US03.
        </p>

        <Link
          to="/login"
          style={{
            display: 'inline-block',
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