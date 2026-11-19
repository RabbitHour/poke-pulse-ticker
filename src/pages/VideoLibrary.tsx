import { useState, useRef, useEffect } from "react";
import { Play, Lock, ShieldCheck, Eye, Calendar, Clock, Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface VideoEntry {
  id: string;
  title: string;
  description: string;
  file: string;
  thumbnail?: string;
  aspect: "16:9" | "9:16";
  duration: string;
  category: string;
  date: string;
  views: number;
}

const SOCIAL_HIGHLIGHT_DESC = `Poke Pulse helps English Pokémon collectors see what changed and inspect the evidence behind a quote.

Explore dated source prices for exact printings, compare available daily changes, save cards and personal price targets on this browser, and follow fixed-basket set indexes. Open marketplace searches to compare condition, shipping and recent sales yourself.

Price releases are daily, not second-by-second trades. Active listing prices are asking prices, and experimental forecasts are not guaranteed results. Data and image coverage vary. The installed web app uses the same site.`;

const STORAGE_BASE = 'https://eikhrxplszgnmgzsktdl.supabase.co/storage/v1/object/public/investor-assets/videos';
const RIPZ_BASE = 'https://eikhrxplszgnmgzsktdl.supabase.co/storage/v1/object/public/investor-assets';

const RIPZ_EPISODES: VideoEntry[] = [
  { id: "ripz-promo-45s", title: "🔥 Poké Ripz™ — Sizzle Reel (45s)", description: "45-second highlight reel featuring scenes from 5 different Poké Ripz episodes. © 2026 PGVA Ventures, LLC. 18 U.S.C. § 1832.", file: `${RIPZ_BASE}/PokeRipz_Promo_45s.mp4`, aspect: "16:9", duration: "0:45", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep1-full", title: "⚡ Poké Ripz EP1 — Evolving Skies w/ DJ Spark (Full)", description: "DJ Spark rips Evolving Skies ETBs & Booster Boxes. Umbreon VMAX Alt Art ($312, 1 in 432 odds), Rayquaza VMAX ($189). Print run: ~8.2M packs, ~5.1M in circulation. Total pull value: $716. Includes real pull rates, PSA pop data & live market values. © 2026 PGVA Ventures, LLC. Patent pending.", file: `${RIPZ_BASE}/PokeRipz_EP1_Full.mp4`, aspect: "16:9", duration: "3:08", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep2-full", title: "🔮 Poké Ripz EP2 — Prismatic Evolutions w/ Luna Blaze (Full)", description: "Luna Blaze opens Prismatic Evolutions. Eevee Full Art SIR ($245, 1 in 512), Umbreon EX SAR ($198). Print run: ~12M packs. Total: $718. © 2026 PGVA Ventures, LLC.", file: `${RIPZ_BASE}/PokeRipz_EP2_Full.mp4`, aspect: "16:9", duration: "3:14", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep3-full", title: "🕹️ Poké Ripz EP3 — 151 w/ Retro Rick (Full)", description: "Retro Rick chases the OG 151 set. Charizard ex SAR ($520, 1 in 720!), Mew ex SAR ($310), Erika's Invitation SAR ($285). Print run: ~15M packs. Total: $1,295! © 2026 PGVA Ventures, LLC.", file: `${RIPZ_BASE}/PokeRipz_EP3_Full.mp4`, aspect: "16:9", duration: "3:35", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep4-full", title: "🐍 Poké Ripz EP4 — Surging Sparks w/ Volt Viper (Full)", description: "Volt Viper electrifies with 3 Booster Boxes. Pikachu ex SAR ($480, 1 in 576), Miraidon ex ($165). Print run: ~10M packs. Total: $882. © 2026 PGVA Ventures, LLC.", file: `${RIPZ_BASE}/PokeRipz_EP4_Full.mp4`, aspect: "16:9", duration: "3:11", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep5-full", title: "💎 Poké Ripz EP5 — Crown Zenith w/ Nova Crystal (Full)", description: "Nova Crystal hunts Crown Zenith. Giratina VSTAR Gold ($275, 1 in 576), Radiant Charizard ($95). Print run: ~7.5M packs. Total: $661. © 2026 PGVA Ventures, LLC.", file: `${RIPZ_BASE}/PokeRipz_EP5_Full.mp4`, aspect: "16:9", duration: "2:51", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep6-full", title: "🔥 Poké Ripz EP6 — Obsidian Flames w/ Blaze Runner (Full)", description: "Blaze Runner rips Obsidian Flames. Charizard ex SAR ($385, 1 in 648). Print run: ~11M packs. Total: $625. © 2026 PGVA Ventures, LLC.", file: `${RIPZ_BASE}/PokeRipz_EP6_Full.mp4`, aspect: "16:9", duration: "2:56", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep7-full", title: "🧙 Poké Ripz EP7 — Paldea Evolved w/ Pixel Sage (Full)", description: "Pixel Sage chases Iono SAR ($445, 1 in 720!). Gardevoir ex SAR ($92). Print run: ~9.5M packs. Total: $698. © 2026 PGVA Ventures, LLC.", file: `${RIPZ_BASE}/PokeRipz_EP7_Full.mp4`, aspect: "16:9", duration: "2:54", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep8-full", title: "⏰ Poké Ripz EP8 — Temporal Forces w/ Chrono Kai (Full)", description: "Chrono Kai opens Temporal Forces. Walking Wake ex ($195), Bianca's Devotion SAR ($155). Print run: ~8.8M packs. Total: $592. © 2026 PGVA Ventures, LLC.", file: `${RIPZ_BASE}/PokeRipz_EP8_Full.mp4`, aspect: "16:9", duration: "2:55", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep9-full", title: "⭐ Poké Ripz EP9 — Stellar Crown w/ Stella Vex (Full)", description: "Stella Vex reaches for Terapagos ex SAR ($350, 1 in 648), Arceus VSTAR Gold ($145). Print run: ~10.2M packs. Total: $676. © 2026 PGVA Ventures, LLC.", file: `${RIPZ_BASE}/PokeRipz_EP9_Full.mp4`, aspect: "16:9", duration: "3:05", category: "Poké Ripz", date: "2026-04-06", views: 0 },
  { id: "ripz-ep10-full", title: "🌟 Poké Ripz EP10 — Brilliant Stars w/ Neon Nash (Full)", description: "Neon Nash opens Brilliant Stars. Charizard VSTAR ($225, 1 in 432), Arceus VSTAR ($165). Print run: ~13M packs. Total: $555. © 2026 PGVA Ventures, LLC.", file: `${RIPZ_BASE}/PokeRipz_EP10_Full.mp4`, aspect: "16:9", duration: "2:47", category: "Poké Ripz", date: "2026-04-06", views: 0 },
];

const videoLibrary: VideoEntry[] = [
  ...RIPZ_EPISODES,
  {
    id: "tier1-vo-promo",
    title: "🎯 Tier 1 — PokéGarageVA™ Promo (VO + Music)",
    description: "30-second promo for Tier 1: PokéGarageVA™ — the hybrid home-based franchise model est. 2022. Features professional AI voiceover with upbeat electronic background music and sidechain ducking. © 2026 PGVA Ventures, LLC. Protected under U.S. Patent, Trademark & Copyright law. 18 U.S.C. § 1832.",
    file: `${STORAGE_BASE}/PGVA_Tier1_PokeGarageVA_Promo_VO.mp4`,
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-06",
    views: 0,
  },
  {
    id: "tier2-vo-promo",
    title: "📊 Tier 2 — Poke-Pulse-Engine™ Promo (VO + Music)",
    description: "30-second promo for Tier 2: Poke-Pulse-Engine™ — 12 franchise engines, $103B+ TAM, 7 revenue streams, $1.89B valuation target. Professional AI voiceover with upbeat electronic music. © 2026 PGVA Ventures, LLC. 18 U.S.C. § 1832.",
    file: `${STORAGE_BASE}/PGVA_Tier2_PokePulseEngine_Promo_VO.mp4`,
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-06",
    views: 0,
  },
  {
    id: "tier3-vo-promo",
    title: "🏗️ Tier 3 — Personal Pulse Engine™ Promo (VO + Music)",
    description: "30-second promo for Tier 3: Personal Pulse Engine™ — enterprise-grade analytics, white-labeled for institutions. 12 verticals, $103B+ TAM, $38M IP portfolio. AI voiceover + music. © 2026 PGVA Ventures, LLC. 18 U.S.C. § 1832.",
    file: `${STORAGE_BASE}/PGVA_Tier3_PersonalPulseEngine_Promo_VO.mp4`,
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-06",
    views: 0,
  },
  {
    id: "tier4-vo-promo",
    title: "🎬 Tier 4 — PGTV Media Hub™ Promo (VO + Music)",
    description: "30-second promo for Tier 4: PGTV Media Hub™ — live streaming, VOD, interactive tournaments, community entertainment. AI voiceover + music. © 2026 PGVA Ventures, LLC. 18 U.S.C. § 1832.",
    file: `${STORAGE_BASE}/PGVA_Tier4_PGTVMediaHub_Promo_VO.mp4`,
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-06",
    views: 0,
  },
  {
    id: "tier5-vo-promo",
    title: "🏛️ Tier 5 — Pulse Philanthropic™ Promo (VO + Music)",
    description: "30-second promo for Tier 5: Pulse Philanthropic Project™ — STEM education, community access, scholarship funds, sustainability. AI voiceover + music. © 2026 PGVA Ventures, LLC. 18 U.S.C. § 1832.",
    file: `${STORAGE_BASE}/PGVA_Tier5_PulsePhilanthropic_Promo_VO.mp4`,
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-06",
    views: 0,
  },
  {
    id: "poke-ripz-promo-30s",
    title: "🃏 Poké Ripz™ — 30s Promo (VO + Music)",
    description: "30-second showcase of the Poké Ripz™ digital pack ripping experience. Features all 6 eras, 7 product types, fan voting system, digital portfolio tracking, coin economy, and PGTV show previews. AI voiceover + upbeat electronic music. © 2026 PGVA Ventures, LLC. Protected under 18 U.S.C. § 1832.",
    file: "/videos/PGVA_PokeRipz_Promo_30s.mp4",
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-06",
    views: 0,
  },
  {
    id: "5tier-deepdive-investor",
    title: "🏛️ 5-Tier Vertical Integration™ — Deep-Dive Investor Video (VO + Music)",
    description: "The definitive 5-minute deep-dive investor presentation covering all 5 tiers of the PGVA Ventures vertical integration system. Tier 1: PokéGarageVA™ hybrid home franchise (est. 2022). Tier 2: Poke-Pulse-Engine™ real-time analytics. Tier 3: Personal Pulse Engine™ institutional data across 12 verticals. Tier 4: PGTV Media Hub™ streaming & media. Tier 5: Pulse Philanthropic™ National Museum in D.C. Features revenue projections ($157.8M ARR), $1.89B valuation, and $103B+ TAM. Contact: contact@poke-pulse-ticker.com | pokegarageva@gmail.com. © 2026 PGVA Ventures, LLC.",
    file: "/videos/PGVA_5Tier_DeepDive_Investor_2026.mp4",
    aspect: "16:9",
    duration: "5:00",
    category: "Investor",
    date: "2026-04-05",
    views: 0,
  },
  {
    id: "5tier-promo-2026",
    title: "🏛️ 5-Tier Vertical Integration™ — Investor Promo (VO + Music)",
    description: "The complete 63-second investor showcase of PGVA Ventures' 5-Tier Vertical Integration system — from PokéGarageVA™ grassroots franchise to the Pulse Philanthropic™ National Museum in Washington, D.C. Features professional female AI voiceover, upbeat electronic background music with sidechain ducking, and high-production Remotion visuals covering all five tiers, revenue projections, and $1.89B valuation target. Contact: contact@poke-pulse-ticker.com | pokegarageva@gmail.com. © 2026 PGVA Ventures, LLC.",
    file: "/videos/PGVA_5Tier_Promo_2026.mp4",
    aspect: "16:9",
    duration: "1:03",
    category: "Campaign",
    date: "2026-04-05",
    views: 0,
  },
  {
    id: "tier1-pokegarageva-1min",
    title: "Tier 1 — PokéGarageVA™ Hybrid Franchise (1-Min)",
    description: "1-minute promo for Tier 1: PokéGarageVA™ — the hybrid home-based trading card vending, garage sale, and franchise model established in 2022. Features female AI voiceover and upbeat electronic music. © 2026 PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier1_PokéGarageVA_1min_2026.mp4",
    aspect: "16:9",
    duration: "1:00",
    category: "Campaign",
    date: "2026-04-05",
    views: 0,
  },
  {
    id: "tier2-pokepulse-1min",
    title: "Tier 2 — Poke-Pulse-Engine™ Analytics (1-Min)",
    description: "1-minute promo for Tier 2: Poke-Pulse-Engine™ — real-time market analytics for 500+ high-liquidity cards, SimTrader World™, Poké-Pulse Arena™, Alpha Signals, and 7-tier subscriptions. © 2026 PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier2_PokePulseEngine_1min_2026.mp4",
    aspect: "16:9",
    duration: "1:00",
    category: "Campaign",
    date: "2026-04-05",
    views: 0,
  },
  {
    id: "tier3-pulseengine-1min",
    title: "Tier 3 — Personal Pulse Engine™ Institutional Data (1-Min)",
    description: "1-minute promo for Tier 3: Personal Pulse Engine™ — institutional-grade data engine spanning 12 collectible verticals with $103B+ TAM, B2B licensing, and franchise blueprint. © 2026 PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier3_PulseEngine_1min_2026.mp4",
    aspect: "16:9",
    duration: "1:00",
    category: "Campaign",
    date: "2026-04-05",
    views: 0,
  },
  {
    id: "tier4-pgtv-1min",
    title: "Tier 4 — PGTV Media Hub™ (1-Min)",
    description: "1-minute promo for Tier 4: PGTV Media Hub™ — branded streaming, creator tools, ad revenue sharing, exclusive content, and community features. © 2026 PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier4_PGTVMediaHub_1min_2026.mp4",
    aspect: "16:9",
    duration: "1:00",
    category: "Campaign",
    date: "2026-04-05",
    views: 0,
  },
  {
    id: "tier5-philanthropic-1min",
    title: "Tier 5 — Pulse Philanthropic™ National Museum (1-Min)",
    description: "1-minute promo for Tier 5: Pulse Philanthropic™ — the pinnacle project establishing the first National Museum of Trading Cards & Collectibles in Washington, D.C. Free admission forever. © 2026 PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier5_Philanthropic_1min_2026.mp4",
    aspect: "16:9",
    duration: "1:00",
    category: "Campaign",
    date: "2026-04-05",
    views: 0,
  },
  {
    id: "engine-promo-2026",
    title: "🔥 Poké Pulse Market Engine — 60s Promo (VO + Music)",
    description: "The definitive 60-second showcase of the Poké Pulse Market Engine — the world's first institutional-grade Poké TCG market analytics platform. Features professional female AI voiceover, upbeat electronic background music with sidechain ducking, and cinematic Remotion visuals covering live indexes, SimTrader World™, Poké-Pulse Arena™, Grading ROI Calculator, AI Alpha Signals, and the full pro tool suite. Engineered for social media, investor presentations, and PGTV broadcast. © 2026 PGVA Ventures, LLC. All rights reserved. Protected under U.S. Patent, Trademark & Copyright law.",
    file: "/videos/PGVA_Engine_Promo_2026_v3.mp4",
    aspect: "16:9",
    duration: "1:00",
    category: "Engine",
    date: "2026-04-05",
    views: 0,
  },
  {
    id: "combined-gl-sh",
    title: "Grand Launch × Social Highlight — Full 3-Minute Experience",
    description: "The definitive 3-minute cinematic presentation combining the Grand Launch and Social Highlight promos. Features VO-synced transitions, sidechain-ducked audio, and transition SFX. The complete story of Poke-Pulse-Engine in one video.",
    file: "/videos/combined-gl-sh-3min.mp4",
    aspect: "16:9",
    duration: "3:28",
    category: "Launch",
    date: "2026-04-01",
    views: 0,
  },
  {
    id: "grand-launch-yt-synced",
    title: "Grand Launch — VO-Synced YouTube Edition",
    description: "90-second grand launch promo with VO-aligned scene transitions, sidechain-ducked audio mix, and cinematic transition SFX. Optimized for YouTube and desktop.",
    file: "/videos/grand-launch-yt-synced.mp4",
    aspect: "16:9",
    duration: "1:30",
    category: "Launch",
    date: "2026-04-01",
    views: 0,
  },
  {
    id: "social-highlight-yt-synced",
    title: "Social Highlight — VO-Synced YouTube Edition",
    description: SOCIAL_HIGHLIGHT_DESC,
    file: "/videos/social-highlight-yt-synced.mp4",
    aspect: "16:9",
    duration: "2:00",
    category: "Launch",
    date: "2026-04-01",
    views: 0,
  },
  {
    id: "social-highlight-yt",
    title: "Social Highlight — Official Platform Overview (YouTube)",
    description: SOCIAL_HIGHLIGHT_DESC,
    file: "/videos/social-highlight-youtube-90s.mp4",
    aspect: "16:9",
    duration: "1:30",
    category: "Launch",
    date: "2026-04-01",
    views: 0,
  },
  {
    id: "social-highlight-vertical",
    title: "Social Highlight — Official Platform Overview (Vertical)",
    description: SOCIAL_HIGHLIGHT_DESC,
    file: "/videos/social-highlight-90s.mp4",
    aspect: "9:16",
    duration: "1:30",
    category: "Launch",
    date: "2026-04-01",
    views: 0,
  },
  {
    id: "grand-launch-social",
    title: "Grand Launch — Official Mega Final Launch Sale (Vertical)",
    description: "90-second grand launch promo with 20 cinematic scenes, Laura AI voiceover & electronic music. Covers all 7 tiers, Alpha Signals, SimTrader World™, Arena, and more.",
    file: "/videos/grand-launch-social-final.mp4",
    aspect: "9:16",
    duration: "1:30",
    category: "Launch",
    date: "2026-04-01",
    views: 0,
  },
  {
    id: "grand-launch-youtube",
    title: "Grand Launch — Official Mega Final Launch Sale (YouTube)",
    description: "90-second horizontal grand launch promo with 20 scenes, Laura voiceover & background music. Optimized for YouTube, Facebook, and desktop viewing.",
    file: "/videos/grand-launch-youtube-final.mp4",
    aspect: "16:9",
    duration: "1:30",
    category: "Launch",
    date: "2026-04-01",
    views: 0,
  },
  {
    id: "feature-showcase-v5",
    title: "Feature Showcase v5 — Full Platform Tour",
    description: "84-second cinematic deep dive with Laura voiceover & electronic music. 15 scenes covering Market Pulse, SimTrader World™, Arena, AI Signals, and Pro Tools.",
    file: "/videos/feature-showcase-2026.mp4",
    aspect: "16:9",
    duration: "1:24",
    category: "Feature Tour",
    date: "2026-03-31",
    views: 0,
  },
  {
    id: "investor-pitch",
    title: "Investor Pitch — Why Poke Pulse Ticker",
    description: "45-second investor-focused pitch covering audit scores, subscription tiers, competitive advantages, and market metrics.",
    file: "/videos/investor-pitch-horizontal.mp4",
    aspect: "16:9",
    duration: "0:45",
    category: "Investor",
    date: "2026-03-31",
    views: 0,
  },
  {
    id: "social-pitch-vertical",
    title: "Social Pitch — Vertical",
    description: "45-second vertical investor/social pitch optimized for TikTok, Instagram Reels, and YouTube Shorts.",
    file: "/videos/social-pitch-vertical.mp4",
    aspect: "9:16",
    duration: "0:45",
    category: "Investor",
    date: "2026-03-31",
    views: 0,
  },
  {
    id: "simtrader-promo-yt",
    title: "SimTrader™ Promo — YouTube",
    description: "30-second horizontal promo with voiceover and techno background music. Optimized for YouTube, Facebook, and desktop.",
    file: "/videos/simtrader-promo-youtube-16x9.mp4",
    aspect: "16:9",
    duration: "0:30",
    category: "Promo",
    date: "2026-03-30",
    views: 0,
  },
  {
    id: "simtrader-promo-vertical",
    title: "SimTrader™ Promo — Vertical",
    description: "30-second vertical promo for mobile-first platforms. Same voiceover and cinematic music mix.",
    file: "/videos/simtrader-promo-vertical-9x16.mp4",
    aspect: "9:16",
    duration: "0:30",
    category: "Promo",
    date: "2026-03-30",
    views: 0,
  },
  {
    id: "franchise-umbrella",
    title: "Personal Pulse Engine™ — 12-Vertical Franchise Pitch",
    description: "27-second investor pitch showcasing the Personal Pulse Engine expansion across 12 collectible and sports card verticals — Poké, MLB, NFL, NBA, NHL, FIFA, MTG, Yu-Gi-Oh!, Dragon Ball Z, Lorcana, and Star Wars. $103B+ combined TAM under PGVA Ventures, LLC.",
    file: "/videos/franchise-pitch-2026.mp4",
    aspect: "16:9",
    duration: "0:27",
    category: "Franchise",
    date: "2026-04-02",
    views: 0,
  },
  {
    id: "investor-pitch-59s",
    title: "Investor Pitch — 59s Extended Franchise Overview",
    description: "59-second cinematic investor pitch covering audit scores, 7 subscription tiers, market performance, SimTrader World™, competitive advantages, franchise verticals ($103B+ TAM), 5-year revenue projections ($157.8M ARR), top 10 strategic investors, and final call to action. © PGVA Ventures, LLC.",
    file: "/videos/investor-pitch-59s-2026.mp4",
    aspect: "16:9",
    duration: "0:59",
    category: "Investor",
    date: "2026-04-02",
    views: 0,
  },
  {
    id: "investor-12-engines",
    title: "12 Revenue Engines — Investor Social Pitch",
    description: "59-second polished investor pitch highlighting all 12 revenue-generating market engines: Live Indexes, Growth Charts, SimTrader World™, Poké-Pulse Arena™, Poké Adventure Land, Alpha Signals, Grading Arbitrage, Portfolio Tracking, Whale Reports, Data API, Franchise Blueprint, and Subscription Tiers. Female voiceover, upbeat background music, large-frame imagery. Optimized for social media. Contact: contact@poke-pulse-ticker.com. © PGVA Ventures, LLC. All rights reserved. Protected under U.S. Patent, Trademark & Copyright law.",
    file: "/videos/PGVA_Investor_Pitch_59s_2026.mp4",
    aspect: "16:9",
    duration: "0:59",
    category: "Investor",
    date: "2026-04-02",
    views: 0,
  },
  {
    id: "tier1-poke-pulse-av",
    title: "Tier 1 — Poke-Pulse-Engine (VO + Music)",
    description: "30-second aggressive social promo with Laura AI voiceover and upbeat electronic music. Highlights live pricing for 500+ cards, SimTrader World™, Poké-Pulse Arena™, Alpha Signals, grading arbitrage, and 7-tier subscriptions. © PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier1_PokePulse_Promo_2026_AV.mp4",
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-03",
    views: 0,
  },
  {
    id: "tier2-pulse-market-av",
    title: "Tier 2 — Personal Pulse Engine Franchise (VO + Music)",
    description: "30-second investor-focused promo with Laura AI voiceover and cinematic orchestral music. Covers $103B+ TAM, $157.8M ARR projections, 12 revenue engines, and $1.89B valuation. © PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier2_PulseMarket_Promo_2026_AV.mp4",
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-03",
    views: 0,
  },
  {
    id: "tier3-pgtv-av",
    title: "Tier 3 — PGTV Media Hub (VO + Music)",
    description: "30-second promo with Laura AI voiceover and upbeat music. Highlights live streaming, creator tools, ad revenue sharing, exclusive content, and community features for collectors, investors, and streamers. © PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier3_PGTV_Promo_2026_AV.mp4",
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-03",
    views: 0,
  },
  {
    id: "poke-race-promo",
    title: "Poké Race™ — Game Promo (Music)",
    description: "30-second promo for Poké Race™, the live card racing game. Features 5-minute sprint races, 1000 free coins, and competitive betting across Raw, Graded, and Sealed products. © PGVA Ventures, LLC.",
    file: "/videos/PGVA_PokeRace_Promo_2026_AV.mp4",
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-03",
    views: 0,
  },
  {
    id: "combined-3tier-demo-av",
    title: "3-Tier Vertical Integration — Full Demo (VO + Music)",
    description: "Nearly 2-minute cinematic demo with Laura AI voiceover and epic orchestral-electronic soundtrack. Complete walkthrough of all three vertical tiers: Poké Pulse (Data), Personal Pulse Engine (Franchise), and PGTV Media Hub (Media). © PGVA Ventures, LLC.",
    file: "/videos/PGVA_3Tier_Combined_Demo_2026_AV.mp4",
    aspect: "16:9",
    duration: "1:53",
    category: "Campaign",
    date: "2026-04-03",
    views: 0,
  },
  {
    id: "tier1-poke-pulse",
    title: "Tier 1 — Poke-Pulse-Engine Promo (Silent)",
    description: "30-second aggressive social promo for the Poke-Pulse-Engine — the consumer-facing data engine. Silent version. © PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier1_PokePulse_Promo_2026.mp4",
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-03",
    views: 0,
  },
  {
    id: "tier2-pulse-market",
    title: "Tier 2 — Personal Pulse Engine Franchise Promo (Silent)",
    description: "30-second investor-focused promo. Silent version. © PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier2_PulseMarket_Promo_2026.mp4",
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-03",
    views: 0,
  },
  {
    id: "tier3-pgtv",
    title: "Tier 3 — PGTV Media Hub Promo (Silent)",
    description: "30-second promo for PGTV Media Hub. Silent version. © PGVA Ventures, LLC.",
    file: "/videos/PGVA_Tier3_PGTV_Promo_2026.mp4",
    aspect: "16:9",
    duration: "0:30",
    category: "Campaign",
    date: "2026-04-03",
    views: 0,
  },
  {
    id: "combined-3tier-demo",
    title: "3-Tier Vertical Integration — Full Demo (Silent)",
    description: "Nearly 2-minute cinematic demo. Silent version. © PGVA Ventures, LLC.",
    file: "/videos/PGVA_3Tier_Combined_Demo_2026.mp4",
    aspect: "16:9",
    duration: "1:53",
    category: "Campaign",
    date: "2026-04-03",
    views: 0,
  },
];

const categories = ["All", ...Array.from(new Set(videoLibrary.map(v => v.category)))];

const VideoLibrary = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const navigate = useNavigate();

  const filtered = videoLibrary.filter(v => {
    const matchCat = activeCategory === "All" || v.category === activeCategory;
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Block right-click and keyboard shortcuts on this page
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ['s','u','p'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i','j'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
      }
    };
    const blockDrag = (e: DragEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'VIDEO') e.preventDefault();
    };
    document.addEventListener('contextmenu', block);
    document.addEventListener('keydown', blockKeys);
    document.addEventListener('dragstart', blockDrag);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('keydown', blockKeys);
      document.removeEventListener('dragstart', blockDrag);
    };
  }, []);

  const handlePlay = (id: string) => {
    // Pause other videos
    videoRefs.current.forEach((el, key) => {
      if (key !== id) el.pause();
    });
    setPlayingId(id);
    const el = videoRefs.current.get(id);
    if (el) el.play();
  };

  return (
    <div
      className="min-h-screen bg-background select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* PGTV Hero — Auto-playing newest video */}
      <div className="bg-black relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <video
            src={videoLibrary[0]?.file}
            autoPlay
            muted
            loop
            playsInline
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            className="w-full aspect-video object-contain"
            onContextMenu={e => e.preventDefault()}
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
            <Badge className="bg-primary/90 text-primary-foreground text-[10px] mb-2">
              🔴 NOW PLAYING
            </Badge>
            <h2 className="text-white text-lg sm:text-xl font-bold">{videoLibrary[0]?.title}</h2>
            <p className="text-white/60 text-xs mt-1 line-clamp-2 max-w-2xl">{videoLibrary[0]?.description}</p>
          </div>
          <div className="absolute top-2 right-2 text-[8px] font-mono text-white/15 pointer-events-none select-none">
            © PGVA Ventures LLC
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">PGTV Media Hub — Video Library</h1>
            <Badge variant="outline" className="ml-2 text-[10px] border-primary/30 text-primary">
              <Lock className="h-3 w-3 mr-1" /> Protected
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Watch the platform evolve. All content is © PGVA Ventures, LLC — streaming only, downloads prohibited.
          </p>

          {/* Search + Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="text-xs whitespace-nowrap"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No videos match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map(video => (
              <Card
                key={video.id}
                className="overflow-hidden border-border/40 bg-card group hover:border-primary/30 transition-colors"
              >
                {/* Video Player */}
                <div
                  className="relative bg-black cursor-pointer"
                  onClick={() => handlePlay(video.id)}
                  onContextMenu={e => e.preventDefault()}
                >
                  <video
                    ref={el => { if (el) videoRefs.current.set(video.id, el); }}
                    src={video.file}
                    controls={playingId === video.id}
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture
                    playsInline
                    preload="metadata"
                    className={`w-full ${video.aspect === "16:9" ? "aspect-video" : "aspect-[9/16] max-h-[320px] mx-auto"} object-contain`}
                    onContextMenu={e => e.preventDefault()}
                    onEnded={() => setPlayingId(null)}
                  />
                  {/* Play overlay */}
                  {playingId !== video.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                  {/* Duration badge */}
                  <Badge className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-white border-0">
                    <Clock className="h-3 w-3 mr-1" />
                    {video.duration}
                  </Badge>
                  {/* Watermark */}
                  <div className="absolute bottom-1 left-2 text-[8px] font-mono text-white/15 pointer-events-none select-none">
                    © PGVA Ventures LLC
                  </div>
                </div>

                {/* Info */}
                <CardContent className="p-3 sm:p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">{video.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{video.category}</Badge>
                    <Badge variant="outline" className="text-[10px]">{video.aspect}</Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                      <Calendar className="h-3 w-3" />
                      {new Date(video.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* IP Footer */}
        <div className="mt-8 border-t border-border/40 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span>All content © {new Date().getFullYear()} PGVA Ventures, LLC. DMCA protected.</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/promo")}>
            Authorized Downloads →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoLibrary;
