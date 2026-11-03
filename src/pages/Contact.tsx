import { useState } from "react";
import FinancialDisclaimer from "@/components/FinancialDisclaimer";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle, Mail } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import TerminalHeader from "@/components/TerminalHeader";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const Contact = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    try {
      const body = 'From: '+form.name+' <'+form.email+'>\n\n'+form.message;
      window.location.assign('mailto:pokegarageva@gmail.com?subject='+encodeURIComponent(form.subject)+'&body='+encodeURIComponent(body));
      setSubmitted(true);
      toast.info("Review and send the draft in your email app.");
    } catch {
      toast.error("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <TerminalHeader />
        <main className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-14 h-14 text-terminal-green mx-auto" />
          </motion.div>
          <h1 className="font-mono text-xl font-bold text-foreground">Email draft opened</h1>
          <p className="font-mono text-sm text-muted-foreground">
            Review and send the draft in your email app. The website has not sent a message automatically.
          </p>
          <button
            onClick={() => navigate("/")}
            className="font-mono text-sm text-primary hover:underline"
          >
            ← Back to Terminal
          </button>
        </main>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full bg-muted border ${errors[field] ? "border-destructive" : "border-border"} rounded-md px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors`;

  return (
    <div className="min-h-screen bg-background">
      <TerminalHeader />

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Terminal
        </button>

        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary" />
          <h1 className="font-mono text-lg font-bold text-foreground">Contact Us</h1>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="terminal-card p-5 space-y-4"
        >
          <div>
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass("name")} />
            {errors.name && <p className="font-mono text-[10px] text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass("email")} />
            {errors.email && <p className="font-mono text-[10px] text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Subject</label>
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" className={inputClass("subject")} />
            {errors.subject && <p className="font-mono text-[10px] text-destructive mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what's on your mind…"
              rows={5}
              className={inputClass("message") + " resize-none"}
            />
            {errors.message && <p className="font-mono text-[10px] text-destructive mt-1">{errors.message}</p>}
            <p className="font-mono text-[9px] text-muted-foreground mt-1 text-right">{form.message.length}/2000</p>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 font-mono text-sm font-semibold bg-primary text-primary-foreground rounded-md py-2.5 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
            {sending ? "Opening draft…" : "Open email draft"}
          </button>
        </motion.form>

        <div className="font-mono text-[10px] text-muted-foreground text-center space-y-1">
          <p>
            Email us directly at{" "}
            <a href="mailto:contact@poke-pulse-ticker.com" className="text-primary hover:underline">
              contact@poke-pulse-ticker.com
            </a>
          </p>
          <p>
            Or{" "}
            <a href="mailto:pokegarageva@gmail.com" className="text-primary hover:underline">
              pokegarageva@gmail.com
            </a>
          </p>
        </div>
        <FinancialDisclaimer compact />
      </main>
    </div>
  );
};

export default Contact;
