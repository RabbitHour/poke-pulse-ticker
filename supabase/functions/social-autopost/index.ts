import { createClient } from 'npm:@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

const SITE = 'https://poke-pulse-ticker.lovable.app';
const CONTACT = 'contact@poke-pulse-ticker.com | pokegarageva@gmail.com';
const STORAGE_BASE = 'https://eikhrxplszgnmgzsktdl.supabase.co/storage/v1/object/public/investor-assets/videos';
const RIPZ_BASE = 'https://eikhrxplszgnmgzsktdl.supabase.co/storage/v1/object/public/investor-assets';
const LEGAL = '\n\n© 2026 PGVA Ventures, LLC. All rights reserved.\nProtected under U.S. Patent, Trademark & Copyright law.\n18 U.S.C. § 1832 — Trade Secret Protection Act';

const PROMOS = [
  {
    tier: 1,
    title: "🎯 PokéGarageVA™ — Tier 1 Franchise",
    body: `The original hybrid home-based franchise model est. 2022. Real-time Poké TCG price tracking, portfolio management, and market signals.\n\nStart for FREE → ${SITE}\n\n📩 ${CONTACT}\n\n#PokemonTCG #CardInvesting #PokéGarageVA #Pokemon #TradingCards #pokegarageva`,
    videoUrl: `${SITE}/videos#tier1`,
    videoFile: `${STORAGE_BASE}/PGVA_Tier1_PokeGarageVA_Promo_VO.mp4`,
  },
  {
    tier: 2,
    title: "📊 Poke-Pulse-Engine™ — Consumer Terminal",
    body: `Alpha signals, arbitrage finder, whale reports & AI insights. The most sophisticated data engine ever built for the Poké TCG ecosystem.\n\n${SITE}\n\n📩 ${CONTACT}\n\n#PokemonCards #CardMarket #PokePulseEngine #Investing #TCG #pokegarageva`,
    videoUrl: `${SITE}/videos#tier2`,
    videoFile: `${STORAGE_BASE}/PGVA_Tier2_PokePulseEngine_Promo_VO.mp4`,
  },
  {
    tier: 3,
    title: "🏗️ Personal Pulse Engine™ — Institutional Data",
    body: `Institutional-grade franchise data licensing across 12 multi-billion-dollar collectible verticals. White-label terminal deployments & data API.\n\n${SITE}\n\n📩 ${CONTACT}\n\n#PersonalPulseEngine #DataLicensing #Franchise #Collectibles #pokegarageva`,
    videoUrl: `${SITE}/videos#tier3`,
    videoFile: `${STORAGE_BASE}/PGVA_Tier3_PersonalPulseEngine_Promo_VO.mp4`,
  },
  {
    tier: 4,
    title: "🎬 PGTV Media Hub™ — Media Production",
    body: `Branded media production and streaming center. High-fidelity campaign assets, investor demos, and vertical-specific highlights.\n\n${SITE}\n\n📩 ${CONTACT}\n\n#PGTVMediaHub #MediaProduction #Streaming #Content #pokegarageva`,
    videoUrl: `${SITE}/videos#tier4`,
    videoFile: `${STORAGE_BASE}/PGVA_Tier4_PGTVMediaHub_Promo_VO.mp4`,
  },
  {
    tier: 5,
    title: "🏛️ Pulse Philanthropic Project™ — National Museum",
    body: `The National Museum of Trading Cards & Collectibles — Washington, D.C.\nFree to the public, forever. A Noyes Family Trust venture.\n\n${SITE}/donate\n\n📩 ${CONTACT}\n\n#Museum #TradingCards #Culture #Philanthropy #pokegarageva`,
    videoUrl: `${SITE}/videos#tier5`,
    videoFile: `${STORAGE_BASE}/PGVA_Tier5_PulsePhilanthropic_Promo_VO.mp4`,
  },
];

const RIPZ_EPISODES = [
  { ep: 1, host: "DJ Spark", set: "Evolving Skies", highlight: "Umbreon VMAX Alt Art $312", videoFile: `${RIPZ_BASE}/PokeRipz_EP1_Full.mp4` },
  { ep: 2, host: "Luna Blaze", set: "Prismatic Evolutions", highlight: "Eevee Full Art SIR $245", videoFile: `${RIPZ_BASE}/PokeRipz_EP2_Full.mp4` },
  { ep: 3, host: "Retro Rick", set: "151", highlight: "Charizard ex SAR $520", videoFile: `${RIPZ_BASE}/PokeRipz_EP3_Full.mp4` },
  { ep: 4, host: "Volt Viper", set: "Surging Sparks", highlight: "Pikachu ex SAR $480", videoFile: `${RIPZ_BASE}/PokeRipz_EP4_Full.mp4` },
  { ep: 5, host: "Nova Crystal", set: "Crown Zenith", highlight: "Giratina VSTAR Gold $275", videoFile: `${RIPZ_BASE}/PokeRipz_EP5_Full.mp4` },
  { ep: 6, host: "Blaze Runner", set: "Obsidian Flames", highlight: "Charizard ex SAR $385", videoFile: `${RIPZ_BASE}/PokeRipz_EP6_Full.mp4` },
  { ep: 7, host: "Pixel Sage", set: "Paldea Evolved", highlight: "Iono SAR $445", videoFile: `${RIPZ_BASE}/PokeRipz_EP7_Full.mp4` },
  { ep: 8, host: "Chrono Kai", set: "Temporal Forces", highlight: "Walking Wake ex $195", videoFile: `${RIPZ_BASE}/PokeRipz_EP8_Full.mp4` },
  { ep: 9, host: "Stella Vex", set: "Stellar Crown", highlight: "Terapagos ex SAR $350", videoFile: `${RIPZ_BASE}/PokeRipz_EP9_Full.mp4` },
  { ep: 10, host: "Neon Nash", set: "Brilliant Stars", highlight: "Charizard VSTAR $225", videoFile: `${RIPZ_BASE}/PokeRipz_EP10_Full.mp4` },
];

// Rotation: 5 tiers + 10 ripz episodes = 15 slots, cycling every 2 hours
function getCurrentContent() {
  const hoursSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60));
  const slotIndex = Math.floor(hoursSinceEpoch / 2) % 15;

  if (slotIndex < 5) {
    const promo = PROMOS[slotIndex];
    return {
      type: 'tier' as const,
      tier: promo.tier,
      title: promo.title,
      message: `<b>${promo.title}</b>\n\n${promo.body}\n\n🎬 Watch → ${promo.videoUrl}\n📥 Video → ${promo.videoFile}${LEGAL}`,
      caption: `${promo.title}\n\n${promo.body}\n\n🎬 ${promo.videoUrl}${LEGAL}`,
      videoFile: promo.videoFile,
      bufferText: `${promo.title}\n\n${promo.body}\n\n🎬 Watch → ${promo.videoUrl}${LEGAL}`,
    };
  }

  const ep = RIPZ_EPISODES[slotIndex - 5];
  const title = `🔥 Poké Ripz™ EP${ep.ep} — ${ep.set} w/ ${ep.host}`;
  const body = `Watch ${ep.host} rip ${ep.set}! Top pull: ${ep.highlight}.\n\nFull episode on PGTV → ${SITE}/videos\nPlay the game → ${SITE}/poke-ripz\n\n📩 ${CONTACT}\n\n#PokeRipz #PackRips #PokemonTCG #PGTV #pokegarageva #CardInvesting`;

  return {
    type: 'ripz' as const,
    tier: ep.ep,
    title,
    message: `<b>${title}</b>\n\n${body}${LEGAL}`,
    caption: `${title}\n\n${body}${LEGAL}`,
    videoFile: ep.videoFile,
    bufferText: `${title}\n\n${body}${LEGAL}`,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Require service-role authorization (cron / dashboard only).
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!token || token !== serviceKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
    if (!TELEGRAM_API_KEY) throw new Error('TELEGRAM_API_KEY is not configured');

    const content = getCurrentContent();
    const results: Record<string, any> = {};

    // --- TELEGRAM ---
    const TELEGRAM_CHANNEL = Deno.env.get('TELEGRAM_CHANNEL_ID') || '@pokepulseengine';

    // Try sending video with caption
    try {
      const tgVideoResponse = await fetch(`${TELEGRAM_GATEWAY_URL}/sendVideo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': TELEGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHANNEL,
          video: content.videoFile,
          caption: content.caption.substring(0, 1024), // Telegram caption limit
          parse_mode: 'HTML',
        }),
      });

      const tgData = await tgVideoResponse.json();

      if (!tgVideoResponse.ok) {
        console.error('Telegram video failed, trying text fallback:', JSON.stringify(tgData));
        // Fallback to text message
        const tgTextResponse = await fetch(`${TELEGRAM_GATEWAY_URL}/sendMessage`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': TELEGRAM_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHANNEL,
            text: content.message.substring(0, 4096),
            parse_mode: 'HTML',
          }),
        });
        const tgTextData = await tgTextResponse.json();
        results.telegram = {
          success: tgTextResponse.ok,
          type: 'text_fallback',
          message_id: tgTextData?.result?.message_id,
          error: tgTextResponse.ok ? null : tgTextData,
        };
      } else {
        results.telegram = {
          success: true,
          type: 'video',
          message_id: tgData?.result?.message_id,
        };
      }
    } catch (tgErr) {
      results.telegram = { success: false, error: String(tgErr) };
    }

    // --- BUFFER (YouTube, Instagram, TikTok) ---
    const BUFFER_API_KEY = Deno.env.get('BUFFER_API_KEY');
    if (BUFFER_API_KEY) {
      try {
        const profilesRes = await fetch('https://api.bufferapp.com/1/profiles.json', {
          headers: { 'Authorization': `Bearer ${BUFFER_API_KEY}` },
        });

        if (!profilesRes.ok) {
          const errText = await profilesRes.text();
          results.buffer = { success: false, error: `Buffer profiles fetch failed [${profilesRes.status}]: ${errText}` };
        } else {
          const profiles = await profilesRes.json();

          if (Array.isArray(profiles) && profiles.length > 0) {
            for (const profile of profiles) {
              try {
                const postRes = await fetch('https://api.bufferapp.com/1/updates/create.json', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${BUFFER_API_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: new URLSearchParams({
                    text: content.bufferText.substring(0, 2000),
                    profile_ids: profile.id,
                    now: 'true',
                    'media[video]': content.videoFile,
                    'media[thumbnail]': `${SITE}/icon-192.png`,
                  }),
                });
                const postData = await postRes.json();
                results[`buffer_${profile.service}_${profile.id}`] = {
                  success: postData.success ?? false,
                  profile: profile.service,
                  service_username: profile.service_username,
                  error: postData.success ? null : (postData.message || postData),
                };
              } catch (profileErr) {
                results[`buffer_${profile.service}_${profile.id}`] = { success: false, error: String(profileErr) };
              }
            }
          } else {
            results.buffer = { success: false, error: 'No Buffer profiles found. Connect YouTube/Instagram/TikTok in Buffer dashboard.' };
          }
        }
      } catch (bufferErr) {
        results.buffer = { success: false, error: String(bufferErr) };
      }
    } else {
      results.buffer = { skipped: true, reason: 'BUFFER_API_KEY not configured' };
    }

    return new Response(JSON.stringify({
      ok: true,
      content_type: content.type,
      tier: content.tier,
      title: content.title,
      posted_at: new Date().toISOString(),
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Social autopost error:', msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
