import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { usePricingHealth } from "@/hooks/usePricingHealth";

const SystemStatusIndicator = () => {
  const { health } = usePricingHealth();
  const signal = health?.signalStrength ?? 0;
  const liveCount = health?.liveCount ?? 0;
  const totalSources = health?.totalSources ?? 0;
  const checkedAt = health?.checkedAt ? new Date(health.checkedAt) : new Date();
  const isHealthy = signal >= 67;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="terminal-card overflow-hidden"
    >
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-wide text-secondary uppercase flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" /> System Status
        </h3>
        <span className={`font-mono text-[10px] font-semibold flex items-center gap-1 ${isHealthy ? "text-terminal-green" : "text-terminal-amber"}`}>
          {isHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {isHealthy ? "PRIMARY SOURCES LIVE" : "DEGRADED SOURCE COVERAGE"}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
        {[
          { label: "Signal", value: `${signal}%`, color: isHealthy ? "text-terminal-green" : "text-terminal-amber" },
          { label: "Live Sources", value: totalSources ? `${liveCount}/${totalSources}` : "—", color: "text-primary" },
          { label: "Data Freshness", value: "5 min", color: "text-terminal-amber" },
          { label: "Status", value: isHealthy ? "Healthy" : "Degraded", color: isHealthy ? "text-terminal-green" : "text-terminal-amber" },
        ].map((item) => (
          <div key={item.label} className="px-4 py-3 text-center">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
            <p className={`font-mono text-sm font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-2 flex items-center gap-1.5">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="font-mono text-[9px] text-muted-foreground">
          Last checked: {checkedAt.toLocaleTimeString()} — Monitored 24/7 by PGVA Ventures, LLC
        </span>
      </div>
    </motion.div>
  );
};

export default SystemStatusIndicator;
