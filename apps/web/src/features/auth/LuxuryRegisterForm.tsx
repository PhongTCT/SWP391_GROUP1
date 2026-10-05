import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  ApiClientError,
  registerApi,
  sendOtpApi,
} from '../../shared/api/client';

export function LuxuryRegisterForm() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Nếu register thành công nhưng gửi OTP lỗi,
   * lưu email lại để lần submit sau chỉ gửi lại OTP,
   * tránh gọi register lần nữa và gặp EMAIL_EXISTS.
   */
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(
    null,
  );

  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiClientError) {
      return error.message;
    }

    if (error instanceof TypeError) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend và thử lại.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setFormError('');

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    /*
     * Nếu tài khoản chưa được tạo thì validate đầy đủ.
     * Nếu đã register thành công nhưng OTP lỗi,
     * lần sau chỉ retry sendOtpApi().
     */
    if (!registeredEmail) {
      if (!cleanUsername) {
        setFormError('Vui lòng nhập tên đăng nhập.');
        return;
      }

      if (cleanUsername.length < 3) {
        setFormError('Tên đăng nhập phải có tối thiểu 3 ký tự.');
        return;
      }

      if (!cleanEmail) {
        setFormError('Vui lòng nhập Email.');
        return;
      }

      if (!isValidEmail(cleanEmail)) {
        setFormError('Email không hợp lệ.');
        return;
      }

      if (!password) {
        setFormError('Vui lòng nhập mật khẩu.');
        return;
      }

      if (!hasMinLength || !hasLetter || !hasNumber) {
        setFormError(
          'Mật khẩu phải có tối thiểu 8 ký tự, bao gồm chữ và số.',
        );
        return;
      }

      if (!confirmPassword) {
        setFormError('Vui lòng xác nhận mật khẩu.');
        return;
      }

      if (password !== confirmPassword) {
        setFormError('Mật khẩu xác nhận không khớp.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let otpEmail = registeredEmail;

      /*
       * Chỉ gọi register khi tài khoản chưa được tạo.
       */
      if (!otpEmail) {
        await registerApi({
          username: cleanUsername,
          email: cleanEmail,
          password,
          role: 'MEMBER',
        });

        /*
         * Register đã thành công.
         * Lưu lại trước khi gọi OTP để nếu OTP fail
         * thì không đăng ký lại tài khoản.
         */
        otpEmail = cleanEmail;
        setRegisteredEmail(cleanEmail);
      }

      /*
       * SCRUM-40:
       * đăng ký thành công -> gửi OTP.
       */
      await sendOtpApi(otpEmail);

      /*
       * Chuyển sang màn xác thực OTP.
       * Mang theo email để US03 biết OTP thuộc tài khoản nào.
       */
      navigate('/verify-otp', {
        state: {
          target: otpEmail,
        },
      });
    } catch (error: unknown) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const registrationAlreadyCreated = registeredEmail !== null;

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '8px',
        padding: '44px 40px',
        boxShadow:
          '0 20px 50px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(33, 28, 24, 0.06)',
        maxWidth: '520px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '8px',
            fontWeight: 600,
          }}
        >
          ĐĂNG KÝ HỘI VIÊN
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontWeight: 600,
            margin: '0 0 10px 0',
            color: '#1A1614',
            letterSpacing: '0.02em',
          }}
        >
          Tạo Tài Khoản
        </h3>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            color: '#7E7771',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Đăng ký tài khoản hội viên để sử dụng các dịch vụ của trung tâm.
        </p>
      </div>

      {formError && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            fontSize: '0.82rem',
            padding: '10px 14px',
            borderRadius: '4px',
            marginBottom: '18px',
            lineHeight: 1.5,
          }}
        >
          ⚠️ {formError}
        </div>
      )}

      {registrationAlreadyCreated && formError && (
        <div
          style={{
            background: '#FAF8F5',
            border: '1px solid rgba(33, 28, 24, 0.08)',
            color: '#6A635D',
            fontSize: '0.76rem',
            padding: '10px 14px',
            borderRadius: '4px',
            marginBottom: '18px',
            lineHeight: 1.6,
          }}
        >
          Tài khoản đã được tạo. Bạn có thể thử gửi lại mã OTP mà
          không cần đăng ký lại.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="portal-form-group">
          <label className="portal-label">
            Tên Đăng Nhập
          </label>

          <input
            type="text"
            className="portal-input"
            placeholder="Nhập tên đăng nhập"
            value={username}
            disabled={registrationAlreadyCreated || isSubmitting}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="portal-form-group">
          <label className="portal-label">
            Email
          </label>

          <input
            type="email"
            className="portal-input"
            placeholder="example@email.com"
            value={email}
            disabled={registrationAlreadyCreated || isSubmitting}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="portal-form-group">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <label
              className="portal-label"
              style={{ margin: 0 }}
            >
              Mật Khẩu
            </label>

            <button
              type="button"
              disabled={
                registrationAlreadyCreated ||
                isSubmitting
              }
              onClick={() =>
                setShowPassword(
                  (current) => !current,
                )
              }
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.72rem',
                color: '#8C847C',
                cursor:
                  registrationAlreadyCreated ||
                  isSubmitting
                    ? 'default'
                    : 'pointer',
                padding: 0,
              }}
            >
              {showPassword
                ? 'Ẩn mật khẩu'
                : 'Hiện mật khẩu'}
            </button>
          </div>

          <input
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            className="portal-input"
            placeholder="Tối thiểu 8 ký tự, có chữ và số"
            value={password}
            disabled={
              registrationAlreadyCreated ||
              isSubmitting
            }
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="new-password"
          />
        </div>

        <div
          style={{
            background: '#FAF8F5',
            border:
              '1px solid rgba(33, 28, 24, 0.08)',
            borderRadius: '6px',
            padding: '12px 14px',
            marginTop: '-8px',
            marginBottom: '20px',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.76rem',
            lineHeight: 1.8,
            color: '#6A635D',
          }}
        >
          <div>
            {hasMinLength ? '✓' : '○'} Tối thiểu
            8 ký tự
          </div>

          <div>
            {hasLetter ? '✓' : '○'} Có ít nhất
            một chữ cái
          </div>

          <div>
            {hasNumber ? '✓' : '○'} Có ít nhất
            một chữ số
          </div>
        </div>

        <div className="portal-form-group">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <label
              className="portal-label"
              style={{ margin: 0 }}
            >
              Xác Nhận Mật Khẩu
            </label>

            <button
              type="button"
              disabled={
                registrationAlreadyCreated ||
                isSubmitting
              }
              onClick={() =>
                setShowConfirmPassword(
                  (current) => !current,
                )
              }
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.72rem',
                color: '#8C847C',
                cursor:
                  registrationAlreadyCreated ||
                  isSubmitting
                    ? 'default'
                    : 'pointer',
                padding: 0,
              }}
            >
              {showConfirmPassword
                ? 'Ẩn mật khẩu'
                : 'Hiện mật khẩu'}
            </button>
          </div>

          <input
            type={
              showConfirmPassword
                ? 'text'
                : 'password'
            }
            className="portal-input"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            disabled={
              registrationAlreadyCreated ||
              isSubmitting
            }
            onChange={(e) =>
              setConfirmPassword(
                e.target.value,
              )
            }
            autoComplete="new-password"
          />

          {confirmPassword && (
            <div
              style={{
                marginTop: '7px',
                fontSize: '0.76rem',
                color: passwordsMatch
                  ? '#166534'
                  : '#B91C1C',
              }}
            >
              {passwordsMatch
                ? '✓ Mật khẩu xác nhận khớp.'
                : 'Mật khẩu xác nhận chưa khớp.'}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="luxury-login-submit-btn"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting
              ? 'wait'
              : 'pointer',
          }}
        >
          <span>
            {isSubmitting
              ? registrationAlreadyCreated
                ? 'ĐANG GỬI OTP...'
                : 'ĐANG TẠO TÀI KHOẢN...'
              : registrationAlreadyCreated
                ? 'GỬI LẠI MÃ OTP'
                : 'TẠO TÀI KHOẢN HỘI VIÊN'}
          </span>

          {!isSubmitting && (
            <span
              className="submit-arrow"
              aria-hidden="true"
            >
              →
            </span>
          )}
        </button>
      </form>

      <div
        style={{
          textAlign: 'center',
          marginTop: '22px',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.82rem',
          color: '#7E7771',
        }}
      >
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          style={{
            color: '#1A1614',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}