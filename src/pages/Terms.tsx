import TerminalHeader from "@/components/TerminalHeader";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";

const Terms = () => (
  <>
    <TerminalHeader />
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-mono text-2xl font-bold text-foreground tracking-wider">Terms of Service</h1>
      <p className="font-mono text-xs text-muted-foreground">Effective Date: March 31, 2026 · Last Updated: April 1, 2026</p>
      <p className="font-mono text-xs text-muted-foreground leading-relaxed italic">
        These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you") and PGVA Ventures, LLC ("Company," "we," "us"), a Delaware limited liability company.
      </p>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">1. Acceptance of Terms</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          By accessing, browsing, or using Poke-Pulse-Engine at poke-pulse-engine.com ("the Service"), including all associated sub-domains, APIs, mobile applications, and affiliated digital properties, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and all applicable laws and regulations. If you do not agree, you must immediately discontinue use of the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">2. Description of Service</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Poke-Pulse-Engine is a proprietary digital platform providing live Poké TCG market data, proprietary market indexes, portfolio tracking, simulated trading games, price alert systems, AI-powered market analytics, and related financial technology tools. The Service is operated exclusively by PGVA Ventures, LLC. Data is sourced from third-party APIs and proprietary algorithms and is provided "as-is" for informational and entertainment purposes only.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">3. Not Financial Advice</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          ALL market data, price information, indexes, signals, buy/sell/hold indicators, AI-generated reports, RSI readings, alpha signals, delta alerts, arbitrage opportunities, and any other analytics displayed on the Service are for INFORMATIONAL AND ENTERTAINMENT PURPOSES ONLY and do not constitute financial, investment, tax, or trading advice. PGVA Ventures, LLC is not a registered broker-dealer, investment advisor, CPA, or licensed financial professional. You acknowledge that you use any information from the Service at your own risk and should consult qualified professionals before making financial decisions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">4. User Accounts & Security</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          You are solely responsible for maintaining the confidentiality and security of your account credentials, including passwords and passkeys. You agree to: (a) provide accurate and current information during registration; (b) not share your account or enable unauthorized access; (c) immediately notify us of any unauthorized use; (d) accept full responsibility for all activity under your account. We reserve the right to suspend or terminate accounts suspected of unauthorized access, sharing, or any violation of these Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">5. Intellectual Property — General</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          All content, design, source code, object code, algorithms, databases, user interfaces, visual elements, branding, logos, trade dress, and documentation on Poke-Pulse-Engine are the exclusive intellectual property of PGVA Ventures, LLC, protected under United States and international copyright, trademark, trade secret, and patent laws. You may not copy, reproduce, modify, distribute, transmit, display, perform, publish, license, create derivative works from, or exploit any content without prior express written permission from PGVA Ventures, LLC.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">6. Proprietary Data, Indexes & Anti-Redistribution</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          The following are proprietary intellectual property of PGVA Ventures, LLC and are protected by applicable trade secret and intellectual property law: the RAW 500 INDEX™, GRADED 1000 INDEX™, SEALED 1000 INDEX™, Alpha Signals™, Delta Alerts™, Consensus Pricing Engine™, Grading Arbitrage Scanner™, Grade Ratio Arbitrage Bot™, Era Index methodology, Market Intelligence algorithms, and all derived analytics including but not limited to Buy/Sell/Hold signal badges, RSI indicators, predictive algorithms, AI-generated market reports, and weekly portfolio summaries.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Commercial redistribution, resale, syndication, data mining, automated scraping, systematic extraction, screen-scraping, web harvesting, API abuse, or any unauthorized collection of proprietary data, indexes, signals, or analytics from the Service is STRICTLY PROHIBITED. Violation constitutes willful infringement and may result in immediate account termination, permanent IP ban, and civil and criminal legal action seeking injunctive relief, actual damages, statutory damages (up to $150,000 per infringed work under 17 U.S.C. § 504), and attorneys' fees.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">6A. SimTrader™ / SimTrader World™ Proprietary Game System</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          SimTrader™ and SimTrader World™ (collectively, "SimTrader"), the Poké Stock Market Simulator, including but not limited to its concept, design, user interface, game mechanics, virtual trading engine, order types (market, limit, stop-loss), contest systems, leaderboard algorithms, portfolio simulation logic, AI bot opponents, token economy, FloatingOrbs visual effects, glassmorphism UI design, Bot Activity Feed, and all associated source code, artwork, audio, video assets, and documentation, is the exclusive proprietary intellectual property of PGVA Ventures, LLC, a company managed by David Noyes.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          The name "SimTrader World™" is a branded extension of the original SimTrader™ trademark. All rights are reserved under United States and international copyright, trade secret, patent, and intellectual property law. The SimTrader™ brand, including all associated marks, logos, and trade dress, constitutes protectable intellectual property with first use in commerce established as of the date of initial public deployment.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          No individual, entity, corporation, partnership, LLC, trust, nonprofit, government agency, or organization may copy, reproduce, reverse-engineer, decompile, disassemble, emulate, clone, create derivative works from, or otherwise replicate any aspect of SimTrader™, SimTrader World™, or the Poke-Pulse-Engine platform without prior express written consent from PGVA Ventures, LLC. This prohibition extends to but is not limited to: the simulated stock market concept as applied to trading card games; the virtual currency and token trading mechanics; the daily contest and tournament systems; the integration of live market data into simulated trading; all proprietary algorithms governing price simulation, order matching, and portfolio valuation; and the Daily Price Predictions game system.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Unauthorized reproduction or distribution of SimTrader™, SimTrader World™, or any component thereof constitutes willful infringement and will be prosecuted to the fullest extent of applicable law, including but not limited to claims under the Digital Millennium Copyright Act (DMCA, 17 U.S.C. § 512), the Computer Fraud and Abuse Act (CFAA, 18 U.S.C. § 1030), the Defend Trade Secrets Act (DTSA, 18 U.S.C. § 1836), the Lanham Act (15 U.S.C. § 1125), and applicable state trade secret statutes. PGVA Ventures, LLC reserves the right to seek temporary restraining orders, preliminary and permanent injunctive relief, actual damages, statutory damages, treble damages, disgorgement of profits, attorneys' fees, and any other remedies available at law or in equity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">6B. Ownership Chain & Legal Entity Structure</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          All intellectual property rights in and to Poke-Pulse-Engine (poke-pulse-engine.com), SimTrader™, SimTrader World™, Pokegarageva, Poke Pulse Market Ticker, the Daily Price Predictions game, the Card of the Day system, the Live Market Pulse feed, and all associated trademarks, trade names, service marks, copyrights, trade secrets, patents (pending and granted), domain names, social media accounts, and proprietary technology are owned exclusively by PGVA Ventures, LLC.
        </p>

        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Any dispute regarding ownership, licensing, use, or infringement of said intellectual property shall be governed by the laws of the State in which PGVA Ventures, LLC is organized, without regard to conflict of law principles. The parties consent to exclusive jurisdiction and venue in the state and federal courts located in said State.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">7. Prohibited Conduct</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          You agree not to: (a) scrape, harvest, crawl, spider, or systematically extract data from the Service using automated tools, bots, scripts, or manual systematic collection; (b) reverse-engineer, decompile, disassemble, or attempt to derive the source code of the Service or its algorithms; (c) redistribute, resell, sublicense, or commercially exploit any proprietary data, indexes, signals, or analytics; (d) use automated tools (bots, crawlers, scripts, headless browsers) to access the Service; (e) circumvent, disable, or interfere with security features, DRM protections, watermarks, or copy protection mechanisms; (f) use the Service for any unlawful purpose or in violation of any applicable law; (g) interfere with, disrupt, or attempt to gain unauthorized access to the Service, its servers, or connected networks; (h) share account credentials or enable unauthorized multi-user access beyond your licensed seats; (i) create competing products or services using data, concepts, or designs derived from the Service; (j) embed, iframe, or frame any portion of the Service without written authorization.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">8. Digital Rights Management & Content Protection</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          The Service employs technological protection measures including but not limited to: digital watermarking, copy protection, anti-screenshot measures, right-click prevention, developer tool detection, clipboard hijacking, print blocking, frame-busting, session monitoring, and behavioral analysis. Circumventing, removing, or disabling these measures violates the Digital Millennium Copyright Act (17 U.S.C. § 1201) anti-circumvention provisions and may subject you to civil liability (up to $2,500 per violation) and criminal penalties (up to $500,000 fine and 5 years imprisonment for first offense).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">9. Subscription & Payment Terms</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Paid subscriptions (Arena $0.99/mo, Starter $1.99/mo, Pro $4.99/mo, Premium $9.99/mo, Team $19.99/mo, and Whale $49.99/mo) are billed monthly or annually through our payment processor, Stripe. Annual billing provides a discount. All payments are non-refundable except as required by applicable law. Free trials automatically convert to paid subscriptions unless canceled before the trial period ends. Team plans include the specified number of seats; additional seats require an upgrade. We reserve the right to modify pricing with 30 days' notice to existing subscribers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">10. Fair Use & Trademark Notice</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Poké, Poké TCG, and all related trademarks, logos, and card images are the property of Nintendo, Creatures Inc., GAME FREAK inc., and The Poké Company International. Poke-Pulse-Engine is not affiliated with, sponsored by, or endorsed by The Poké Company, Nintendo, or any official entity. All Poké card images are used under fair use for informational, educational, and commentary purposes pursuant to 17 U.S.C. § 107. Market data is sourced from public third-party APIs including pokemontcg.io.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">11. Limitation of Liability</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS-IS" AND "AS-AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. PGVA VENTURES, LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO DATA INACCURACIES, SERVICE INTERRUPTIONS, FINANCIAL LOSSES, OR RELIANCE ON MARKET ANALYTICS. IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT PAID BY YOU FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">12. Indemnification</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          You agree to indemnify, defend, and hold harmless PGVA Ventures, LLC, David Noyes, and their respective officers, directors, employees, agents, and successors from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to your use of the Service, violation of these Terms, or infringement of any intellectual property or other rights of any person or entity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">13. Dispute Resolution & Arbitration</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          Any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall first be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. Arbitration shall take place in the State in which PGVA Ventures, LLC is organized. You waive any right to a jury trial and to participate in class action lawsuits.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">14. DMCA & Takedown Procedures</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          If you believe your copyrighted work has been infringed on the Service, send a written DMCA notice to our designated agent at contact@poke-pulse-ticker.com with: (a) identification of the copyrighted work; (b) identification of the infringing material; (c) your contact information; (d) a good-faith statement; (e) a statement of accuracy under penalty of perjury; (f) your physical or electronic signature.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">15. Termination</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service ceases immediately. Sections 5, 6, 6A, 6B, 7, 8, 11, 12, and 13 survive termination.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">16. Changes to Terms</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          We reserve the right to modify these Terms at any time. Material changes will be posted on the Service with an updated effective date. Continued use of the Service after changes constitutes acceptance of the updated Terms.
        </p>
      </section>



      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">18. Competitive Intelligence & Market Monitoring</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          PGVA Ventures, LLC employs continuous automated and manual competitive intelligence monitoring to track market developments, competitor product launches, feature releases, pricing changes, and emerging technologies across the collectible trading card market ecosystem. This monitoring includes but is not limited to: analysis of competitor platforms, APIs, data feeds, public filings, patent applications, trademark registrations, social media activity, and industry publications.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          When a competitor introduces a new feature, data source, algorithm, or service improvement that PGVA Ventures, LLC determines to be material, the Company will: (a) analyze the competitive impact within 48 hours; (b) evaluate whether implementation or adaptation is warranted; (c) if warranted, develop and deploy a superior proprietary implementation within a commercially reasonable timeframe; and (d) document the competitive analysis for internal strategic planning purposes. All competitive intelligence activities are conducted in compliance with applicable laws and regulations, including the Economic Espionage Act (18 U.S.C. § 1831), the Computer Fraud and Abuse Act, and applicable state trade secret laws. PGVA Ventures, LLC does not engage in unauthorized access, reverse engineering, or misappropriation of competitor trade secrets.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          The Company's proprietary market data engine is designed to provide 98–100% factual accuracy for live market pricing data sourced from third-party APIs, with automated validation, error correction, and fallback systems operating continuously. Data freshness is maintained through automated refresh cycles no less frequent than every 60 minutes, with higher-frequency updates for real-time features. The Company invests in redundant data pipelines, circuit-breaker patterns, stale-while-revalidate caching, and offline fallback systems to ensure maximum uptime and data reliability.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">19. Cybersecurity & Data Integrity</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          The Service implements enterprise-grade cybersecurity measures including but not limited to: IP-based rate limiting with configurable thresholds; request timestamp integrity validation (rejecting requests older than 5 minutes); Content Security Policy (CSP) headers for XSS prevention; Zod-based input sanitization with HTML stripping; 30-minute idle session timeout with automatic logout; WebAuthn/FIDO2 passkey support; forensic watermarking of proprietary content; clipboard copy-hijack with legal notice injection; anti-iframe frame-busting with production allowlist; developer tool detection and blocking; print event interception; and continuous security auditing with automated scoring. PGVA Ventures, LLC maintains a target security posture of 95/100 as measured by internal security auditing tools and reserves the right to implement additional security measures at any time without notice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">20. Personal Pulse Engine Wallet™ — Automated Trading Disclaimer</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          The Personal Pulse Engine Wallet™ ("Engine Wallet") is a proprietary automated market analysis and simulated trading system developed by PGVA Ventures, LLC. The Engine Wallet utilizes the Radar Pulse Technique™ to scan live market data and generate buy/sell/hold signals for collectible trading cards. ALL Engine Wallet activity during BETA mode is SIMULATED. No real financial transactions, purchases, or sales of physical or digital trading cards are executed. PokéCoin balances are virtual, non-redeemable digital tokens used exclusively within the Poke-Pulse-Engine™ ecosystem. Users acknowledge that: (a) past simulated performance does not guarantee future results; (b) the Engine Wallet is not a registered investment vehicle, fund, or financial instrument; (c) "dividends," "returns," and "P&L" referenced within the Engine Wallet interface refer exclusively to simulated virtual currency outcomes; (d) PGVA Ventures, LLC bears no liability for decisions made based on Engine Wallet signals; (e) transitioning from BETA simulation to live trading mode requires explicit user consent and may be subject to additional regulatory compliance requirements. The Engine Wallet, its algorithms, signal generation methodology, Radar Pulse Technique™, and all associated intellectual property are trade secrets of PGVA Ventures, LLC, protected under 18 U.S.C. § 1832. Unauthorized reverse-engineering, scraping, or redistribution of Engine Wallet signals shall be subject to liquidated damages of $500,000 per incident plus injunctive relief.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">21. Severability</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          If any provision of these Terms is held invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable. The liability limitations, indemnification obligations, intellectual property protections, family/trust liability shield, and dispute resolution provisions shall survive any termination.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-wider">19. Contact</h2>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          For questions about these Terms, contact us at <a href="mailto:contact@poke-pulse-ticker.com" className="text-primary hover:underline">contact@poke-pulse-ticker.com</a>.
        </p>
        <p className="font-mono text-xs text-muted-foreground leading-relaxed">
          PGVA Ventures, LLC · Managed by David Noyes · Delaware LLC · Patent Pending
        </p>
      </section>
      <FinancialDisclaimer compact />
    </main>
  </>
);

export default Terms;
