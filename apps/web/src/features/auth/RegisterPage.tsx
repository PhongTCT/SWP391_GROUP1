import { Link } from 'react-router-dom';
import { LuxuryRegisterForm } from './LuxuryRegisterForm';
import { InfiniteMarquee } from '../landing/components/InfiniteMarquee';
import { LANDING_IMAGES } from '../landing/assets/images';

export function RegisterPage() {
  return (
    <div
      className="sol-page-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <header
        className="sol-fixed-navbar scrolled"
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(250, 248, 245, 0.96)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '0 56px',
        }}
      >
        <Link to="/" className="aura-brand-mark">
          SÖL WELLNESS SANCTUARY
        </Link>

        <nav
          className="aura-nav-links"
          aria-label="Portal Header Navigation"
        >
          <Link to="/#about" className="aura-nav-link">
            PHILOSOPHY
          </Link>

          <Link to="/#disciplines" className="aura-nav-link">
            DISCIPLINES
          </Link>

          <Link to="/#packages" className="aura-nav-link">
            MEMBERSHIP
          </Link>

          <Link to="/#contact" className="aura-nav-link">
            CONTACT
          </Link>
        </nav>

        <Link to="/" className="aura-portal-btn">
          ← VỀ TRANG CHỦ
        </Link>
      </header>

      {/* Registration Stage */}
      <main
        style={{
          padding: '80px 64px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 1fr',
            gap: '64px',
            alignItems: 'center',
          }}
        >
          {/* Left Column */}
          <div>
            <div className="editorial-category">
              MEMBERSHIP / NEW MEMBER REGISTRATION
            </div>

            <h1
              className="editorial-headline"
              style={{
                fontSize: 'clamp(2.6rem, 4.4vw, 4rem)',
                lineHeight: 1.05,
                marginBottom: '24px',
              }}
            >
              BEGIN YOUR{' '}
              <span
                className="editorial-flourish"
                style={{
                  fontStyle: 'italic',
                  fontWeight: 300,
                }}
              >
                Journey
              </span>
            </h1>

            <p
              className="editorial-body"
              style={{
                maxWidth: '480px',
                marginBottom: '32px',
              }}
            >
              Khởi tạo tài khoản hội viên để tiếp cận hệ sinh thái tập luyện,
              quản lý lịch lớp và các tiện ích tại SÖL Wellness Sanctuary.
            </p>

            <div
              className="image-card-wrapper"
              style={{
                height: '320px',
                borderRadius: '4px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)',
                marginBottom: '28px',
              }}
            >
              <img
                src={LANDING_IMAGES.aboutPrimary}
                alt="SÖL Wellness Membership"
                loading="lazy"
              />
            </div>

            <div
              style={{
                display: 'grid',
                gap: '12px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.84rem',
                color: '#6A635D',
              }}
            >
              <div>
                ✦ <strong>Hội viên:</strong> Quản lý thông tin cá nhân và hồ sơ
                thành viên.
              </div>

              <div>
                ✦ <strong>Lớp tập:</strong> Theo dõi lịch và đăng ký các lớp phù
                hợp.
              </div>

              <div>
                ✦ <strong>Membership:</strong> Quản lý gói tập và thời hạn sử
                dụng.
              </div>

              <div>
                ✦ <strong>Trải nghiệm:</strong> Tiếp cận hệ sinh thái dịch vụ
                của trung tâm.
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <LuxuryRegisterForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <div>
        <footer className="aura-footer-bar">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                letterSpacing: '0.2em',
                fontWeight: 600,
                marginBottom: '10px',
              }}
            >
              SÖL WELLNESS SANCTUARY
            </div>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                lineHeight: 1.65,
                color: 'var(--color-text-muted)',
                maxWidth: '280px',
                margin: 0,
              }}
            >
              Sports Center Management System (SCMS). Nền tảng quản lý trung
              tâm thể thao và trải nghiệm hội viên.
            </p>
          </div>

          <div>
            <div className="footer-col-title">KHÁM PHÁ</div>

            <ul className="footer-nav-list">
              <li className="footer-nav-item">
                <Link to="/#about">Về Chúng Tôi</Link>
              </li>

              <li className="footer-nav-item">
                <Link to="/#disciplines">Các Bộ Môn</Link>
              </li>

              <li className="footer-nav-item">
                <Link to="/#packages">Bảng Giá Gói Tập</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">TÀI KHOẢN</div>

            <ul className="footer-nav-list">
              <li className="footer-nav-item">
                <Link to="/login">Đăng Nhập Portal</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">LIÊN HỆ TRUNG TÂM</div>

            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.8,
              }}
            >
              <div>
                Tòa nhà Landmark Sports, 120 Hai Bà Trưng, Q.1, TP. Hồ Chí
                Minh
              </div>

              <div style={{ marginTop: '6px' }}>
                <strong>Hotline:</strong> 1900 6868
              </div>

              <div>
                <strong>Email:</strong> concierge@sol-wellness.vn
              </div>
            </div>
          </div>
        </footer>

        <InfiniteMarquee
          phrases={[
            'SÖL WELLNESS SANCTUARY',
            'MEMBER REGISTRATION',
            'ELEVATE YOUR STRENGTH',
            'MINDFUL MOVEMENT',
            'DISCIPLINE & MASTERY',
          ]}
        />
      </div>
    </div>
  );
}