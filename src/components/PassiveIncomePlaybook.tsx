import { ExternalLink, Sparkles, ShieldAlert, TrendingUp, DollarSign } from "lucide-react";

type Step = { n: number; title: string; detail: string; link?: { label: string; href: string }; cost?: string; eta?: string };

const CIVILIAN: Step[] = [
  { n: 1, title: "List 3 sealed S/V ETBs on eBay tonight", detail: "Pick your 3 weakest-condition ETBs (keep the 16 best). Auction format, 7-day, free shipping baked in. Comp price: $45–$60 each → ~$135–$180 cash within 10 days. This is your seed.", link: { label: "Open eBay Seller Hub", href: "https://www.ebay.com/sh/lst/active" }, cost: "$0 (free first 250 listings/mo)", eta: "Day 0 — cash by Day 10" },
  { n: 2, title: "Open TCGPlayer Pro seller (raw bulk)", detail: "Bulk-list raws by set. Their Pro Seller fee is reasonable and traffic is buyer-intent. Use your thousands of raws as the long-tail engine.", link: { label: "TCGPlayer Sell", href: "https://sellers.tcgplayer.com/" }, cost: "$0 to start", eta: "Listings live in 48h" },
  { n: 3, title: "Apply to eBay Partner Network (EPN)", detail: "Once approved, every eBay link on poke-pulse-ticker.com pays you 1–4% of the buyer's purchase for 24h after click — even items they buy that aren't yours. Already wired into the ticker; just need your campaign ID in the EBAY_CAMPAIGN_ID secret.", link: { label: "Apply to EPN", href: "https://partnernetwork.ebay.com/" }, cost: "$0", eta: "Approval 1–3 days" },
  { n: 4, title: "Apply to TCGPlayer Affiliate", detail: "Same idea — your card-detail pages already have outbound TCG links. Affiliate ID earns ~6% of subsequent buys.", link: { label: "TCGPlayer Affiliate", href: "https://www.tcgplayer.com/affiliate" }, cost: "$0", eta: "Approval 3–7 days" },
  { n: 5, title: "Spend the $40 on PSA bulk submission credit", detail: "Pick your 4 best raw chase cards (Moonbreon-tier, alt-arts, full-arts in NM/M). PSA Bulk = $19.99/card at scale, but Value tier is ~$24.99 single. Better play: hold the $40, sell 1 graded card you already own to fund a 10-card bulk submission ($199 total) — net positive within 60 days when grades return.", link: { label: "PSA Submission Center", href: "https://www.psacard.com/services" }, cost: "$40 reserved as PSA float", eta: "Grades back in 45–65 days" },
  { n: 6, title: "Turn on Auto-Pilot Sales Engine", detail: "/dashboard already has the automated sales engine wired (Resend + dunning). Flip it on so every Pro signup compounds without you touching it.", link: { label: "Open Dashboard", href: "/dashboard" }, cost: "$0", eta: "Live today" },
  { n: 7, title: "Ship 1 SEO blog post/day (already automated)", detail: "Content engine cron runs at 07:00 UTC. Each evergreen post earns affiliate clicks for years. By Month 3 expect ~$5–$15/day passive from organic. By Month 12 with 365 posts indexed: $50–$200/day realistic.", link: { label: "Blog", href: "/blog" }, cost: "$0", eta: "Compounds Month 2 onward" },
  { n: 8, title: "Reinvest rule (write it down)", detail: "Every dollar from sales weeks 1–8 → PSA grading + 1 sealed ETB buyback at dip. Weeks 9–24 → 50% reinvest, 50% to operating. Month 6+ → 25% reinvest, 75% take-home. This is the compounding curve." },
];

const FEDERAL: Step[] = [
  { n: 1, title: "Get a SAM.gov UEI for PGVA Ventures, LLC", detail: "Free. Required for any federal contract or grant. Takes ~10 days.", link: { label: "Register on SAM.gov", href: "https://sam.gov/content/entity-registration" }, cost: "$0", eta: "10 business days" },
  { n: 2, title: "Apply for SBIR/STTR Phase I", detail: "DARPA, AFWERX, NSF, DoE all run open topics. Phase I is $50k–$275k non-dilutive. AFWERX Open Topic is the easiest entry — they fund AI/dual-use tooling that matches what we already build.", link: { label: "AFWERX Open Topics", href: "https://afwerxchallenge.com/" }, cost: "$0", eta: "Award 60–120 days from submission" },
  { n: 3, title: "List Empire Defense IP for licensing", detail: "Term-sheet skeletons + provisional patents → outreach to Anduril, Shield AI, Palantir. Royalty model = passive once inked.", cost: "$0", eta: "First LOI 90–180 days" },
  { n: 4, title: "OSINT subscription product (Delta Pod)", detail: "Stand up a $499/mo gov-buyer feed — threat indicators, supply-chain signals. CMMC Level 1 sufficient for FOUO.", cost: "Hosting only", eta: "MVP 30 days" },
  { n: 5, title: "GSA Schedule (year-2 play)", detail: "Once revenue + 2 years of past performance exist, GSA Schedule turns federal sales into a recurring catalog buy. Park this for 2027." },
];

const Card = ({ s }: { s: Step }) => (
  <div className="terminal-card p-3">
    <div className="flex items-start gap-2">
      <div className="h-6 w-6 rounded-full bg-primary/15 text-primary font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">{s.n}</div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[11px] font-bold text-foreground">{s.title}</p>
        <p className="font-mono text-[10px] text-muted-foreground mt-1 leading-relaxed">{s.detail}</p>
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          {s.cost && <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted border border-border">💰 {s.cost}</span>}
          {s.eta  && <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted border border-border">⏱ {s.eta}</span>}
          {s.link && (
            <a href={s.link.href} target="_blank" rel="noopener noreferrer"
               className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-primary-foreground bg-primary px-2 py-1 rounded hover:opacity-90">
              {s.link.label} <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function PassiveIncomePlaybook() {
  return (
    <div className="space-y-4">
      <div className="terminal-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-primary" />
          <h2 className="font-mono text-sm font-bold">Passive Income — Bootstrap Playbook</h2>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mb-3">
          Starting capital: <b>$40</b> + thousands of raws + 15 graded + 16–20 sealed S/V ETBs.
          Goal: convert dormant inventory → seed cash → compounding affiliate + grading + content engine.
        </p>
        <div className="grid sm:grid-cols-3 gap-2 mb-3">
          <div className="rounded border border-border bg-background/60 p-2">
            <p className="font-mono text-[9px] uppercase text-muted-foreground">Week 1–2 target</p>
            <p className="font-mono text-sm font-bold text-primary">$135 – $180</p>
            <p className="font-mono text-[9px] text-muted-foreground">3 ETB sales</p>
          </div>
          <div className="rounded border border-border bg-background/60 p-2">
            <p className="font-mono text-[9px] uppercase text-muted-foreground">Month 3 target</p>
            <p className="font-mono text-sm font-bold text-primary">$800 – $1,500/mo</p>
            <p className="font-mono text-[9px] text-muted-foreground">PSA returns + affiliate trickle + first Pro subs</p>
          </div>
          <div className="rounded border border-border bg-background/60 p-2">
            <p className="font-mono text-[9px] uppercase text-muted-foreground">Month 12 target</p>
            <p className="font-mono text-sm font-bold text-primary">$5k – $15k/mo</p>
            <p className="font-mono text-[9px] text-muted-foreground">365 SEO posts indexed + grading flywheel + subs compound</p>
          </div>
        </div>
      </div>

      <div className="terminal-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <h3 className="font-mono text-xs font-bold">Civilian — 8-Step Bootstrap</h3>
        </div>
        <div className="space-y-2">{CIVILIAN.map(s => <Card key={s.n} s={s} />)}</div>
      </div>

      <div className="terminal-card p-3 border-destructive/40">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
          <h3 className="font-mono text-xs font-bold">Federal — Passive Revenue Vehicles <span className="text-destructive">· OWNER ONLY</span></h3>
        </div>
        <p className="font-mono text-[9px] text-muted-foreground mb-2">
          Year-1 federal revenue = $0 expected. Treat this as planting trees: SAM registration + first SBIR submission this quarter, fruit in 6–18 months.
        </p>
        <div className="space-y-2">{FEDERAL.map(s => <Card key={s.n} s={s} />)}</div>
      </div>

      <div className="terminal-card p-3 bg-muted/30">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <h3 className="font-mono text-xs font-bold">Compounding Math</h3>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
          $40 → 3 ETB liquidation (~$160) → 10-card PSA bulk ($199, partly funded by 1 graded card sale) → ~$600–$1,200 graded resale at Day 75 →
          re-grade 25 cards + buy 5 sealed dips (~$300) → Day 150 portfolio ~$2.5k. Meanwhile affiliate + content stack accumulates silently.
          Discipline = reinvest rule in Step 8. The Poké inventory + SEO engine + affiliate stack is the moat — none of the three competitors have all three.
        </p>
      </div>
    </div>
  );
}
