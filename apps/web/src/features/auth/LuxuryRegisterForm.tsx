import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function LuxuryRegisterForm() {
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formError, setFormError] = useState('');

  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Vui lòng nhập họ và tên.');
      return;
    }

    if (!identifier.trim()) {
      setFormError('Vui lòng nhập Email hoặc Số điện thoại.');
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

    // SCRUM-37 / F01 chỉ xử lý giao diện và validation frontend.
    // Register API sẽ được tích hợp ở task tương ứng khi contract sẵn sàng.
  };

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
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
          }}
        >
          ⚠️ {formError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="portal-form-group">
          <label className="portal-label">Họ Và Tên</label>
          <input
            type="text"
            className="portal-input"
            placeholder="Nhập họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="portal-form-group">
          <label className="portal-label">Email Hoặc Số Điện Thoại</label>
          <input
            type="text"
            className="portal-input"
            placeholder="example@email.com hoặc 0908123456"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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
            <label className="portal-label" style={{ margin: 0 }}>
              Mật Khẩu
            </label>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.72rem',
                color: '#8C847C',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            </button>
          </div>

          <input
            type={showPassword ? 'text' : 'password'}
            className="portal-input"
            placeholder="Tối thiểu 8 ký tự, có chữ và số"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div
          style={{
            background: '#FAF8F5',
            border: '1px solid rgba(33, 28, 24, 0.08)',
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
          <div>{hasMinLength ? '✓' : '○'} Tối thiểu 8 ký tự</div>
          <div>{hasLetter ? '✓' : '○'} Có ít nhất một chữ cái</div>
          <div>{hasNumber ? '✓' : '○'} Có ít nhất một chữ số</div>
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
            <label className="portal-label" style={{ margin: 0 }}>
              Xác Nhận Mật Khẩu
            </label>

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.72rem',
                color: '#8C847C',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            </button>
          </div>

          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="portal-input"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {confirmPassword && (
            <div
              style={{
                marginTop: '7px',
                fontSize: '0.76rem',
                color: passwordsMatch ? '#166534' : '#B91C1C',
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
        >
          <span>TẠO TÀI KHOẢN HỘI VIÊN</span>
          <span className="submit-arrow" aria-hidden="true">
            →
          </span>
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