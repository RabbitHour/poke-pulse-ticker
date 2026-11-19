import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Poke-Pulse Ticker"

interface WeeklyPortfolioSummaryProps {
  displayName?: string
  totalValue?: string
  weeklyChange?: string
  weeklyChangePercent?: string
  isPositive?: boolean
  cardCount?: number
  topMover?: string
  topMoverChange?: string
}

const WeeklyPortfolioSummaryEmail = ({
  displayName,
  totalValue = "$0.00",
  weeklyChange = "$0.00",
  weeklyChangePercent = "0.00",
  isPositive = true,
  cardCount = 0,
  topMover,
  topMoverChange,
}: WeeklyPortfolioSummaryProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your weekly portfolio update from {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={headerBrand}>📊 {SITE_NAME}</Text>
          <Heading style={h1}>
            Weekly Portfolio Report
          </Heading>
        </Section>

        <Text style={greeting}>
          {displayName ? `Hey ${displayName},` : 'Hey there,'}
        </Text>
        <Text style={text}>
          Here's how your portfolio performed this week:
        </Text>

        <Section style={statsCard}>
          <Text style={statLabel}>TOTAL VALUE</Text>
          <Text style={statValue}>{totalValue}</Text>
          <Hr style={divider} />
          <Text style={statLabel}>WEEKLY CHANGE</Text>
          <Text style={{ ...statChange, color: isPositive ? '#00e676' : '#ff1744' }}>
            {isPositive ? '▲' : '▼'} {weeklyChange} ({weeklyChangePercent}%)
          </Text>
        </Section>

        <Section style={detailsSection}>
          <Text style={detailRow}>
            <span style={detailLabel}>Cards tracked:</span> {cardCount}
          </Text>
          {topMover && topMoverChange && <Text style={detailRow}>
            <span style={detailLabel}>Top mover:</span> {topMover} ({topMoverChange})
          </Text>}
        </Section>

        <Section style={ctaSection}>
          <Button style={ctaButton} href="https://poke-pulse-ticker.lovable.app/portfolio">
            View Full Portfolio →
          </Button>
        </Section>

        <Hr style={divider} />
        <Text style={footer}>
          You're receiving this because you have portfolio tracking enabled on {SITE_NAME}.
        </Text>
        <Text style={footer}>© {new Date().getFullYear()} PGVA Ventures, LLC</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WeeklyPortfolioSummaryEmail,
  subject: (data: Record<string, any>) =>
    `📊 Weekly Portfolio: ${data.isPositive !== false ? '▲' : '▼'} ${data.weeklyChangePercent || '0.00'}% this week`,
  displayName: 'Weekly portfolio summary',
  previewData: {
    displayName: 'Jane',
    totalValue: '$4,250.00',
    weeklyChange: '$125.50',
    weeklyChangePercent: '3.04',
    isPositive: true,
    cardCount: 42,
    topMover: 'Charizard VMAX',
    topMoverChange: '+12.5%',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Arial', 'Helvetica', sans-serif" }
const container = { padding: '0', maxWidth: '520px', margin: '0 auto' }
const headerSection = {
  backgroundColor: '#0a0f14',
  padding: '24px 25px 20px',
  borderRadius: '8px 8px 0 0',
}
const headerBrand = {
  fontFamily: "'Courier New', monospace",
  fontSize: '11px',
  letterSpacing: '2px',
  color: '#00e676',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  margin: '0',
}
const greeting = {
  fontSize: '15px',
  color: '#1a1a2e',
  margin: '24px 25px 4px',
  lineHeight: '1.5',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 25px 20px',
}
const statsCard = {
  backgroundColor: '#f4f7fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '0 25px 20px',
  border: '1px solid #e2e8f0',
}
const statLabel = {
  fontFamily: "'Courier New', monospace",
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#8b8fa3',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
}
const statValue = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#1a1a2e',
  margin: '0 0 12px',
  fontFamily: "'Courier New', monospace",
}
const statChange = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  margin: '4px 0 0',
  fontFamily: "'Courier New', monospace",
}
const divider = { borderColor: '#e2e8f0', margin: '12px 0' }
const detailsSection = { margin: '0 25px 20px' }
const detailRow = {
  fontSize: '13px',
  color: '#55575d',
  margin: '6px 0',
  fontFamily: "'Courier New', monospace",
}
const detailLabel = { color: '#8b8fa3' }
const ctaSection = { textAlign: 'center' as const, margin: '8px 25px 24px' }
const ctaButton = {
  backgroundColor: '#00e676',
  color: '#0a0f14',
  fontFamily: "'Courier New', monospace",
  fontSize: '13px',
  fontWeight: 'bold' as const,
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  letterSpacing: '0.5px',
}
const footer = {
  fontSize: '11px',
  color: '#999999',
  margin: '4px 25px',
  lineHeight: '1.4',
}
