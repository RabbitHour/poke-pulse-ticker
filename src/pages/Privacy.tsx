import TerminalHeader from "@/components/TerminalHeader";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";

const Privacy = () => (
  <>
    <TerminalHeader />
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-mono text-2xl font-bold text-foreground tracking-wider">Privacy Policy</h1>
      <p className="font-mono text-xs text-muted-foreground">Effective Date: March 31, 2026 · Last Updated: April 1, 2026</p>
      <p className="font-mono text-xs text-muted-foreground leading-relaxed italic">
        This Privacy Policy ("Policy") describes how PGVA Ventures, LLC ("Company," "we," "us"), a Delaware limited liability company, collects, uses, stores, and protects your personal information when you use the Poke-Pulse-Engine platform at poke-pulse-engine.com ("the Service").
      </p>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">1. Information We Collect</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Account Information:</strong> When you create an account, we collect your email address, authentication credentials (passwords, passkeys/WebAuthn), and optional display name and avatar.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Usage Data:</strong> We automatically collect pages visited, features used, session duration, click events, device type, browser type, IP address, operating system, referring URL, and timestamp data.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Portfolio & Trading Data:</strong> Card holdings, purchase prices, watchlists, price alerts, delta alerts, trade orders, SimTrader™ game activity, and prediction game entries you voluntarily create.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Payment Information:</strong> Subscription tier, billing cycle, and transaction history. Payment card details are processed directly by Stripe and are never stored on our servers.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Communication Data:</strong> Push notification subscriptions, email preferences, notification settings, and alert threshold configurations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">2. How We Use Your Information</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We use your information to: (a) provide, maintain, and improve the Service; (b) manage your account, portfolio, and subscription; (c) deliver personalized price alerts, delta alerts, and portfolio notifications; (d) send weekly portfolio summary emails and market updates; (e) process payments and manage subscriptions via Stripe; (f) ensure security, detect fraud, and enforce rate limits; (g) generate anonymized, aggregate analytics for platform improvement; (h) comply with legal obligations and respond to lawful requests.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">3. Data Storage & Security</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Your data is stored securely using industry-standard encryption (AES-256 at rest, TLS 1.3 in transit) on enterprise cloud infrastructure with SOC 2 Type II certification. Security measures include: Row-Level Security (RLS) policies ensuring users can only access their own data; IP-based rate limiting; request timestamp validation; input sanitization via Zod-based validation; 30-minute idle session timeout with automatic logout; WebAuthn/FIDO2 passkey support for biometric authentication; and Content Security Policy (CSP) headers for XSS prevention. While we employ industry-best security practices, no method of electronic storage or transmission is 100% secure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">4. Third-Party Services</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We integrate with the following third-party services, each governed by their own privacy policies:
        </p>
        <ul className="space-y-1 ml-4">
          <li className="font-mono text-xs text-muted-foreground">• <strong className="text-foreground">pokemontcg.io</strong> — Market data API for card pricing</li>
          <li className="font-mono text-xs text-muted-foreground">• <strong className="text-foreground">Stripe</strong> — Payment processing for subscriptions</li>
          <li className="font-mono text-xs text-muted-foreground">• <strong className="text-foreground">Web Push API</strong> — Browser push notifications (with your explicit consent)</li>
          <li className="font-mono text-xs text-muted-foreground">• <strong className="text-foreground">ElevenLabs</strong> — AI voice synthesis for promotional content</li>
        </ul>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We do not share your personal data with these services beyond what is necessary to provide the Service functionality.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">5. Cookies, Local Storage & Tracking</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We use browser localStorage and sessionStorage for: authentication tokens and session persistence; user preferences (theme, accessibility settings); onboarding state; prediction game data; coupon codes; and feature flags. We provide a Cookie Consent banner allowing you to accept or reject non-essential storage. We do not use third-party tracking cookies, advertising pixels, or behavioral retargeting. We do not participate in any ad network or data broker exchanges.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">6. Data Sharing & Disclosure</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We do NOT sell, trade, rent, or monetize your personal information. We may disclose information: (a) to comply with legal obligations, court orders, or lawful government requests; (b) to protect the rights, property, or safety of PGVA Ventures, LLC, or our users; (c) in connection with a merger, acquisition, or sale of assets (with advance notice); (d) in anonymized, aggregate form for analytical or research purposes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">7. Data Retention</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We retain your personal data for as long as your account is active or as needed to provide the Service. Portfolio snapshots and trading history are retained for your benefit. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., fraud prevention, legal compliance). Email suppression lists are maintained indefinitely to honor unsubscribe requests.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">8. Your Rights</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Depending on your jurisdiction, you may have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate or incomplete data; (c) request deletion of your account and associated data ("right to be forgotten"); (d) export your portfolio data in machine-readable format (data portability); (e) object to or restrict certain processing activities; (f) withdraw consent for optional data processing; (g) lodge a complaint with your local data protection authority. To exercise these rights, contact us at contact@poke-pulse-ticker.com.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">9. California Privacy Rights (CCPA/CPRA)</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          California residents have the right to: know what personal information is collected and how it is used; request deletion of personal information; opt out of the sale of personal information (we do not sell personal information); non-discrimination for exercising privacy rights. To submit a verifiable consumer request, contact us at contact@poke-pulse-ticker.com.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">10. Children's Privacy (COPPA)</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that we have collected personal information from a child under 13, we will promptly delete it. If you believe a child under 13 has provided us with personal information, please contact us immediately.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">11. International Data Transfers</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Your data may be processed in the United States. By using the Service, you consent to the transfer of your information to the United States and acknowledge that data protection laws in the US may differ from those in your jurisdiction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">12. Automated Data Processing & Market Intelligence</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We employ automated systems that continuously process publicly available market data, competitor platform information, and industry trends to improve our Service. This includes: automated price validation and anomaly detection; cross-source data reconciliation; predictive analytics using proprietary algorithms; and competitive benchmarking against industry standards. All automated processing is conducted on aggregate, non-personal data and does not involve profiling of individual users for automated decision-making that produces legal or similarly significant effects. Our market data engine operates with a target accuracy of 98–100% through multi-layer validation, redundant data sources, and automated error correction pipelines that refresh at minimum every 60 minutes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">13. Security Monitoring & Threat Detection</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          To protect the Service and your data, we monitor for: unauthorized access attempts and brute force attacks; API abuse and rate limit violations; automated scraping and data extraction; cross-site scripting (XSS) and injection attacks; session hijacking and token theft; and suspicious behavioral patterns. This monitoring generates server logs containing IP addresses, request patterns, user agent strings, and timing data. These logs are retained for security analysis and may be shared with law enforcement if required. We do not use this monitoring data for marketing or advertising purposes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">14. Changes to This Policy</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. Material changes will be posted on the Service with an updated effective date. Continued use after changes constitutes acceptance. We will notify registered users of significant changes via email.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">15. Contact & Data Protection Inquiries</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          For privacy-related inquiries, data access requests, or to exercise your rights, contact us at <a href="mailto:contact@poke-pulse-ticker.com" className="text-primary hover:underline">contact@poke-pulse-ticker.com</a>.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          PGVA Ventures, LLC · Delaware LLC · Managed by David Noyes
        </p>
      </section>
      <FinancialDisclaimer compact />
    </main>
  </>
);

export default Privacy;
