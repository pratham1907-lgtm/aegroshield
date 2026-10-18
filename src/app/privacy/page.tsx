import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — AegroShield',
  description:
    'How AegroShield collects, uses, and protects your personal data in compliance with Indian privacy law.',
};

export default function PrivacyPage() {
  const lastUpdated = '18 October 2026';

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-badge">🔒 Legal</div>
          <h1>Privacy Policy</h1>
          <p>
            Last updated: <strong>{lastUpdated}</strong> · Effective immediately upon publication.
          </p>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,129.58,114.6,188.4,96.5,233.15,82.8,278.4,70.5,321.39,56.44Z"
              fill="#E8F3EC"
            />
          </svg>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="container" style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Table of Contents */}
        <nav
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '20px 28px',
            marginBottom: 48,
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: 10, color: '#166534' }}>📋 Contents</p>
          <ol style={{ margin: 0, paddingLeft: 20, color: '#15803d', lineHeight: 2 }}>
            {[
              'Who We Are',
              'Information We Collect',
              'How We Use Your Information',
              'Data Sharing & Disclosure',
              'Data Retention',
              'Your Rights',
              'Cookies & Local Storage',
              'Security',
              'Children\'s Privacy',
              'Changes to This Policy',
              'Grievance Redressal',
            ].map((title, i) => (
              <li key={i}>
                <a href={`#section-${i + 1}`} style={{ color: '#15803d' }}>
                  {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Section id="section-1" title="1. Who We Are">
          <p>
            AegroShield ("<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>") is an
            agri-tech platform operated by AegroShield Technologies Pvt. Ltd., providing smart farming
            advisory, a marketplace for agricultural inputs, and labour/machinery booking services
            to farmers and agri-businesses across India.
          </p>
          <p style={{ marginTop: 12 }}>
            This Privacy Policy explains how we handle personal information collected through our
            website (<strong>aegroshield.app</strong>) and related mobile and API services (collectively,
            the "<strong>Platform</strong>"). It is governed by the Information Technology Act, 2000 and
            the Information Technology (Reasonable Security Practices and Procedures and Sensitive
            Personal Data or Information) Rules, 2011.
          </p>
        </Section>

        <Section id="section-2" title="2. Information We Collect">
          <SubHeading>2.1 Information You Provide Directly</SubHeading>
          <ul>
            <li><strong>Account data:</strong> name, mobile number, email address, Firebase UID.</li>
            <li><strong>Seller/vendor profile:</strong> store name, owner name, district, category, GSTIN (optional).</li>
            <li>
              <strong>Order & transaction data:</strong> shipping address, phone number, items purchased,
              order amounts. <em>We never store raw payment card details.</em>
            </li>
            <li><strong>Machinery/labour bookings:</strong> task description, location, dates, and wage details.</li>
            <li><strong>Advisory inputs:</strong> crop type, district, field area, pest/disease symptoms submitted to our AI engine.</li>
          </ul>

          <SubHeading>2.2 Information Collected Automatically</SubHeading>
          <ul>
            <li>Device type, operating system, browser user-agent, and IP address.</li>
            <li>Pages visited, time spent, and clickstream data (via server-side logs only — we do not load third-party analytics trackers).</li>
            <li>Mandi rate queries (commodity, district, date) — not linked to your identity unless you are signed in.</li>
          </ul>

          <SubHeading>2.3 Information from Third Parties</SubHeading>
          <ul>
            <li>Firebase Authentication provides a secure identity token when you sign in with phone OTP or email/password. We do not receive your raw OTP.</li>
            <li>Government mandi rate data is sourced from the Agmarknet/data.gov.in API — no personal data is involved.</li>
          </ul>
        </Section>

        <Section id="section-3" title="3. How We Use Your Information">
          <p>We use collected data to:</p>
          <ul>
            <li>Authenticate your identity and maintain your session securely.</li>
            <li>Process and fulfil marketplace orders and bookings.</li>
            <li>Generate personalised crop advisory, dose calculations, and mandi price insights.</li>
            <li>Communicate order confirmations, status updates, and support responses via SMS or email.</li>
            <li>Detect fraud, misuse, and security threats (e.g., bot-driven order manipulation).</li>
            <li>Comply with legal obligations including tax regulations, court orders, and law-enforcement requests.</li>
            <li>Improve our platform through aggregate, anonymised usage analytics.</li>
          </ul>
          <Callout type="info">
            We do <strong>not</strong> sell your personal data to third parties. We do not use your data
            for targeted advertising on external networks.
          </Callout>
        </Section>

        <Section id="section-4" title="4. Data Sharing & Disclosure">
          <p>We share your information only in the following limited circumstances:</p>
          <ul>
            <li>
              <strong>Sellers / Service providers:</strong> When you place an order, your shipping address
              and phone number are shared with the relevant seller to fulfil delivery. Sellers are
              contractually prohibited from using your data for any other purpose.
            </li>
            <li>
              <strong>Infrastructure sub-processors:</strong> Supabase (database hosting, EU/US
              region), Firebase/Google (authentication), Vercel (hosting). Each sub-processor is bound
              by data processing agreements.
            </li>
            <li>
              <strong>Legal compliance:</strong> We may disclose data when required by Indian law,
              court order, or to protect the rights and safety of our users or the public.
            </li>
          </ul>
        </Section>

        <Section id="section-5" title="5. Data Retention">
          <ul>
            <li><strong>Account data</strong> is retained for as long as your account is active, plus 90 days after deletion request to allow dispute resolution.</li>
            <li><strong>Order records</strong> are retained for 7 years to comply with the Companies Act, 2013 and GST regulations.</li>
            <li><strong>Advisory & mandi query logs</strong> are purged after 12 months in aggregate form.</li>
            <li><strong>Server access logs</strong> are automatically deleted after 30 days.</li>
          </ul>
        </Section>

        <Section id="section-6" title="6. Your Rights">
          <p>
            Under Indian law and our own policies, you have the right to:
          </p>
          <ul>
            <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
            <li><strong>Correction</strong> — ask us to correct inaccurate or incomplete data.</li>
            <li><strong>Deletion</strong> — request deletion of your account and associated personal data, subject to legal retention obligations.</li>
            <li><strong>Portability</strong> — receive your order and profile data in a structured, machine-readable format (JSON).</li>
            <li><strong>Withdraw consent</strong> — you may withdraw consent for non-essential communications at any time.</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            To exercise these rights, email us at{' '}
            <a href="mailto:support@aegroshield.app" style={{ color: '#15803d', fontWeight: 600 }}>
              support@aegroshield.app
            </a>{' '}
            from the email address linked to your account. We will respond within <strong>30 days</strong>.
          </p>
        </Section>

        <Section id="section-7" title="7. Cookies & Local Storage">
          <p>
            We use <strong>browser localStorage</strong> (not tracking cookies) for:
          </p>
          <ul>
            <li>
              <strong>Cart drafts</strong> (<code>aegroshield_cart</code>) — your shopping cart items, stored locally until checkout.
            </li>
            <li>
              <strong>Language preference</strong> (<code>aegroshield_lang</code>) — English or Hindi display preference.
            </li>
            <li>
              <strong>Firebase Auth session</strong> — a secure, HttpOnly session token managed by Firebase, not readable by JavaScript.
            </li>
          </ul>
          <p style={{ marginTop: 12 }}>
            We do not use third-party advertising cookies, tracking pixels, or cross-site fingerprinting.
          </p>
        </Section>

        <Section id="section-8" title="8. Security">
          <p>
            We implement industry-standard safeguards including:
          </p>
          <ul>
            <li>TLS 1.3 encryption in transit for all API and web traffic.</li>
            <li>AES-256 encryption at rest via Supabase-managed PostgreSQL.</li>
            <li>Row-level isolation ensuring users can only read their own order and profile data.</li>
            <li>Firebase Custom Claims-based role verification for admin and seller access.</li>
            <li>CRON endpoint and admin routes protected by server-side bearer token validation.</li>
          </ul>
          <Callout type="warning">
            Despite our safeguards, no system is 100% secure. If you discover a security
            vulnerability, please report it responsibly to{' '}
            <a href="mailto:support@aegroshield.app">support@aegroshield.app</a>.
          </Callout>
        </Section>

        <Section id="section-9" title="9. Children's Privacy">
          <p>
            AegroShield is intended for users aged <strong>18 and above</strong>. We do not knowingly
            collect personal data from minors. If you believe a minor has registered on our platform,
            please contact us immediately at{' '}
            <a href="mailto:support@aegroshield.app" style={{ color: '#15803d' }}>
              support@aegroshield.app
            </a>{' '}
            and we will promptly delete the account.
          </p>
        </Section>

        <Section id="section-10" title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. Material changes will be communicated via
            an in-app notification or email at least <strong>14 days</strong> before they take effect.
            Continued use of the Platform after the effective date constitutes acceptance of the revised
            policy. All historical versions are archived and available on request.
          </p>
        </Section>

        <Section id="section-11" title="11. Grievance Redressal">
          <p>
            In accordance with the Information Technology Act, 2000, a Grievance Officer has been
            designated to address privacy concerns:
          </p>
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10,
              padding: '20px 24px',
              marginTop: 16,
              lineHeight: 1.9,
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Grievance Officer:</strong> AegroShield Privacy Team<br />
              <strong>Email:</strong>{' '}
              <a href="mailto:support@aegroshield.app" style={{ color: '#15803d', fontWeight: 600 }}>
                support@aegroshield.app
              </a>
              <br />
              <strong>Response time:</strong> Within 30 days of receipt<br />
              <strong>Address:</strong> AegroShield Technologies Pvt. Ltd., India
            </p>
          </div>
        </Section>

        {/* Footer links */}
        <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
          <p>
            Also read our{' '}
            <Link href="/terms" style={{ color: '#15803d', fontWeight: 600 }}>
              Terms of Use
            </Link>
            . Questions?{' '}
            <a href="mailto:support@aegroshield.app" style={{ color: '#15803d', fontWeight: 600 }}>
              Contact us
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

/* ── Small reusable layout components ─────────────────────────────── */

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        marginBottom: 48,
        paddingBottom: 32,
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <h2
        style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: 16,
          paddingTop: 8,
        }}
      >
        {title}
      </h2>
      <div style={{ color: '#334155', lineHeight: 1.85 }}>{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: '1rem',
        fontWeight: 700,
        color: '#0f172a',
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      {children}
    </h3>
  );
}

function Callout({
  type,
  children,
}: {
  type: 'info' | 'warning';
  children: React.ReactNode;
}) {
  const styles =
    type === 'info'
      ? { background: '#eff6ff', border: '1px solid #bfdbfe', icon: 'ℹ️' }
      : { background: '#fff7ed', border: '1px solid #fed7aa', icon: '⚠️' };

  return (
    <div
      style={{
        ...styles,
        borderRadius: 10,
        padding: '14px 18px',
        marginTop: 16,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        fontSize: '0.93rem',
        color: '#1e293b',
        lineHeight: 1.75,
      }}
    >
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{styles.icon}</span>
      <div>{children}</div>
    </div>
  );
}
