import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Brain,
  Check,
  ChevronDown,
  Copy,
  Crown,
  Eye,
  EyeOff,
  Gem,
  Layers,
  Lock,
  LogOut,
  Plus,
  Send,
  Server,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mode } from "./backend";
import { useActor } from "./hooks/useActor";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string;
  role: "user" | "model";
  content: string;
};

type AppMode = Mode;
type Screen = "landing" | "signin" | "welcome" | "mode-select" | "chat";

// ─── Auth ─────────────────────────────────────────────────────────────────────

const VALID_USERNAMES = [
  "aahrone",
  "vihaan",
  "ethan",
  "coen",
  "emily",
  "bruno",
  "ori",
  "jay",
];
const VALID_PASSWORD = "6767";

function validateCredentials(username: string, password: string): boolean {
  return (
    VALID_USERNAMES.includes(username.trim().toLowerCase()) &&
    password.trim() === VALID_PASSWORD
  );
}

// ─── Mode Config ──────────────────────────────────────────────────────────────

const MODE_CONFIG = {
  [Mode.fast]: {
    label: "Fast",
    tagline: "Quick, sharp answers",
    description:
      "Instant responses with minimal processing time. Best for quick lookups, short questions, and rapid back-and-forth.",
    icon: Zap,
    colorVar: "var(--fast-color)",
    colorRaw: "0.78 0.20 190",
    colorClass: "text-[oklch(0.78_0.20_190)]",
    bgClass: "bg-[oklch(0.78_0.20_190/0.1)]",
    borderClass: "border-[oklch(0.78_0.20_190/0.4)]",
    badgeStyle: {
      background: "oklch(0.78 0.20 190 / 0.15)",
      color: "oklch(0.78 0.20 190)",
      border: "1px solid oklch(0.78 0.20 190 / 0.3)",
    },
    glowStyle: {
      boxShadow:
        "0 0 32px oklch(0.78 0.20 190 / 0.3), 0 0 0 1px oklch(0.78 0.20 190 / 0.3)",
    },
  },
  [Mode.thinking]: {
    label: "Thinking",
    tagline: "Balanced reasoning",
    description:
      "Extended reasoning for nuanced questions. Takes a moment longer to consider multiple angles before responding.",
    icon: Brain,
    colorVar: "var(--thinking-color)",
    colorRaw: "0.72 0.18 270",
    colorClass: "text-[oklch(0.72_0.18_270)]",
    bgClass: "bg-[oklch(0.72_0.18_270/0.1)]",
    borderClass: "border-[oklch(0.72_0.18_270/0.4)]",
    badgeStyle: {
      background: "oklch(0.72 0.18 270 / 0.15)",
      color: "oklch(0.72 0.18 270)",
      border: "1px solid oklch(0.72 0.18 270 / 0.3)",
    },
    glowStyle: {
      boxShadow:
        "0 0 32px oklch(0.72 0.18 270 / 0.3), 0 0 0 1px oklch(0.72 0.18 270 / 0.3)",
    },
  },
  [Mode.pro]: {
    label: "Pro",
    tagline: "Deep, thorough analysis",
    description:
      "Advanced multi-step reasoning with maximum depth. Ideal for complex problems, research, and detailed explanations.",
    icon: Gem,
    colorVar: "var(--pro-color)",
    colorRaw: "0.80 0.18 55",
    colorClass: "text-[oklch(0.80_0.18_55)]",
    bgClass: "bg-[oklch(0.80_0.18_55/0.1)]",
    borderClass: "border-[oklch(0.80_0.18_55/0.4)]",
    badgeStyle: {
      background: "oklch(0.80 0.18 55 / 0.15)",
      color: "oklch(0.80 0.18 55)",
      border: "1px solid oklch(0.80 0.18 55 / 0.3)",
    },
    glowStyle: {
      boxShadow:
        "0 0 32px oklch(0.80 0.18 55 / 0.3), 0 0 0 1px oklch(0.80 0.18 55 / 0.3)",
    },
  },
  [Mode.ultra]: {
    label: "Ultra",
    tagline: "Maximum intelligence",
    description:
      "The pinnacle of Innovexa reasoning. Unrestricted depth and compute time for the absolute hardest challenges. Team access only.",
    icon: Crown,
    colorVar: "var(--ultra-color)",
    colorRaw: "0.72 0.22 10",
    colorClass: "text-[oklch(0.72_0.22_10)]",
    bgClass: "bg-[oklch(0.72_0.22_10/0.1)]",
    borderClass: "border-[oklch(0.72_0.22_10/0.4)]",
    badgeStyle: {
      background: "oklch(0.72 0.22 10 / 0.15)",
      color: "oklch(0.72 0.22 10)",
      border: "1px solid oklch(0.72 0.22 10 / 0.3)",
    },
    glowStyle: {
      boxShadow:
        "0 0 32px oklch(0.72 0.22 10 / 0.3), 0 0 0 1px oklch(0.72 0.22 10 / 0.3)",
    },
  },
} as const;

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Instant answers with zero wait time. Optimized responses delivered in milliseconds so you never lose your flow.",
    color: "0.78 0.20 190",
  },
  {
    icon: Brain,
    title: "Deep Reasoning",
    description:
      "Structured thinking for complex problems. Innovexa works through multi-step logic to surface the right answer.",
    color: "0.72 0.18 270",
  },
  {
    icon: Gem,
    title: "Pro-Grade Analysis",
    description:
      "Research-level depth and precision. Get comprehensive breakdowns, citations, and expert-quality insights.",
    color: "0.80 0.18 55",
  },
  {
    icon: Sparkles,
    title: "Context Aware",
    description:
      "Remembers your full conversation thread. Builds on prior turns to give coherent, continuous assistance.",
    color: "0.72 0.18 220",
  },
  {
    icon: Crown,
    title: "Ultra Intelligence",
    description:
      "The most powerful tier in Innovexa. Unrestricted reasoning depth and maximum compute for the hardest challenges.",
    color: "0.72 0.22 10",
  },
];

const STATS = [
  { icon: Activity, value: "10M+", label: "Queries" },
  { icon: Shield, value: "99.9%", label: "Uptime" },
  { icon: Layers, value: "4", label: "AI Tiers" },
  { icon: Server, value: "Enterprise", label: "Ready" },
];

// ─── Sign-In Page ─────────────────────────────────────────────────────────────

function SignInPage({
  onSignIn,
  onBack,
}: {
  onSignIn: (username: string) => void;
  onBack: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      if (!username.trim() || !password) {
        setError("Please enter your username and password.");
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        if (validateCredentials(username, password)) {
          const displayName =
            username.trim().charAt(0).toUpperCase() +
            username.trim().slice(1).toLowerCase();
          onSignIn(displayName);
        } else {
          setError("Invalid username or password.");
          setIsSubmitting(false);
        }
      }, 800);
    },
    [username, password, onSignIn],
  );

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "oklch(0.10 0.006 260)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.72 0.22 10 / 0.10) 0%, transparent 65%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.22 10 / 0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.14 0.01 260)",
              border: "1px solid oklch(0.72 0.18 220 / 0.35)",
              boxShadow: "0 0 20px oklch(0.72 0.18 220 / 0.15)",
            }}
          >
            <img
              src="/assets/generated/innovexa-logo-mark-transparent.dim_80x80.png"
              alt="Innovexa AI"
              className="w-5 h-5 object-contain"
            />
          </div>
          <span className="font-display font-bold text-base text-foreground tracking-tight">
            Innovexa <span style={{ color: "oklch(0.72 0.18 220)" }}>AI</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <ArrowLeft
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
            strokeWidth={2}
          />
          <span>Back</span>
        </button>
      </nav>

      {/* Sign-in card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "oklch(0.13 0.008 260 / 0.9)",
              border: "1px solid oklch(0.72 0.22 10 / 0.3)",
              boxShadow:
                "0 0 60px oklch(0.72 0.22 10 / 0.10), 0 32px 64px oklch(0 0 0 / 0.4)",
            }}
          >
            {/* Crown icon */}
            <div className="flex justify-center mb-6">
              <div
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center ultra-pulse"
                style={{
                  background: "oklch(0.72 0.22 10 / 0.12)",
                  border: "1px solid oklch(0.72 0.22 10 / 0.35)",
                }}
              >
                <Crown
                  className="w-8 h-8 crown-float"
                  style={{ color: "oklch(0.72 0.22 10)" }}
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1
                className="font-display text-2xl font-bold tracking-tight mb-2"
                style={{
                  color: "oklch(0.94 0.008 240)",
                }}
              >
                Innovexa{" "}
                <span style={{ color: "oklch(0.72 0.22 10)" }}>Ultra</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Exclusive access for team members
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="signin-username"
                  className="text-xs font-semibold tracking-wide uppercase"
                  style={{ color: "oklch(0.58 0.016 240)" }}
                >
                  Username
                </label>
                <Input
                  id="signin-username"
                  data-ocid="signin.username.input"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="off"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-transparent border-border/60 focus-visible:border-[oklch(0.72_0.22_10/0.6)] focus-visible:ring-[oklch(0.72_0.22_10/0.2)] text-foreground placeholder:text-muted-foreground/50 rounded-xl h-11"
                  style={{
                    background: "oklch(0.11 0.007 260)",
                    color: "oklch(0.95 0.01 260)",
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="signin-password"
                  className="text-xs font-semibold tracking-wide uppercase"
                  style={{ color: "oklch(0.58 0.016 240)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    data-ocid="signin.password.input"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-transparent border-border/60 focus-visible:border-[oklch(0.72_0.22_10/0.6)] focus-visible:ring-[oklch(0.72_0.22_10/0.2)] placeholder:text-muted-foreground/50 rounded-xl h-11 pr-10"
                    style={{
                      background: "oklch(0.11 0.007 260)",
                      color: "oklch(0.95 0.01 260)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    data-ocid="signin.error_state"
                    className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
                    style={{
                      background: "oklch(0.62 0.22 25 / 0.1)",
                      border: "1px solid oklch(0.62 0.22 25 / 0.3)",
                      color: "oklch(0.85 0.08 25)",
                    }}
                    initial={{ opacity: 0, scale: 0.97, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                data-ocid="signin.submit_button"
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-sm font-bold rounded-xl transition-all duration-300 relative overflow-hidden"
                style={{
                  background: isSubmitting
                    ? "oklch(0.60 0.18 10)"
                    : "oklch(0.72 0.22 10)",
                  color: "oklch(0.97 0.005 30)",
                  boxShadow: isSubmitting
                    ? "none"
                    : "0 0 24px oklch(0.72 0.22 10 / 0.4), 0 4px 12px oklch(0 0 0 / 0.3)",
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Crown className="w-4 h-4" />
                    Sign In to Ultra
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground/40 mt-6">
              Access restricted to authorized team members only
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({
  username,
  onEnter,
}: {
  username: string;
  onEnter: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnter();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onEnter]);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "oklch(0.10 0.006 260)" }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.72 0.22 10 / 0.12) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${i * 200}px`,
              height: `${i * 200}px`,
              border: `1px solid oklch(0.72 0.22 10 / ${0.15 - i * 0.04})`,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Crown */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center ultra-pulse"
            style={{
              background: "oklch(0.72 0.22 10 / 0.15)",
              border: "1px solid oklch(0.72 0.22 10 / 0.4)",
            }}
          >
            <Crown
              className="w-12 h-12"
              style={{ color: "oklch(0.72 0.22 10)" }}
              strokeWidth={1.5}
            />
          </div>
        </motion.div>

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <p
            className="text-sm font-semibold tracking-widest uppercase mb-3"
            style={{ color: "oklch(0.72 0.22 10 / 0.8)" }}
          >
            Access Granted
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-4">
            Welcome back,{" "}
            <span
              style={{
                color: "oklch(0.72 0.22 10)",
                textShadow: "0 0 40px oklch(0.72 0.22 10 / 0.5)",
              }}
            >
              {username}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            You now have access to{" "}
            <span
              className="font-semibold"
              style={{ color: "oklch(0.72 0.22 10)" }}
            >
              Innovexa Ultra
            </span>
          </p>
        </motion.div>

        {/* Enter button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <Button
            data-ocid="welcome.enter_button"
            onClick={onEnter}
            size="lg"
            className="px-10 py-5 text-base font-bold rounded-xl transition-all duration-300"
            style={{
              background: "oklch(0.72 0.22 10)",
              color: "oklch(0.97 0.005 30)",
              boxShadow:
                "0 0 32px oklch(0.72 0.22 10 / 0.5), 0 8px 24px oklch(0 0 0 / 0.4)",
            }}
          >
            <span className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Enter Ultra
            </span>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({
  onTryInnovexa,
  onUltraClick,
  signedInUser,
}: {
  onTryInnovexa: () => void;
  onUltraClick: () => void;
  signedInUser: string | null;
}) {
  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "oklch(0.10 0.006 260)" }}
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.72 0.18 220 / 0.08) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.18 270 / 0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.22 10 / 0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.14 0.01 260)",
              border: "1px solid oklch(0.72 0.18 220 / 0.35)",
              boxShadow: "0 0 20px oklch(0.72 0.18 220 / 0.15)",
            }}
          >
            <img
              src="/assets/generated/innovexa-logo-mark-transparent.dim_80x80.png"
              alt="Innovexa AI"
              className="w-5 h-5 object-contain"
            />
          </div>
          <span className="font-display font-bold text-base text-foreground tracking-tight">
            Innovexa{" "}
            <span
              className="text-glow"
              style={{ color: "oklch(0.72 0.18 220)" }}
            >
              AI
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ultra button */}
          <Button
            data-ocid="landing.ultra_button"
            onClick={onUltraClick}
            size="sm"
            className="rounded-lg text-sm font-semibold px-4 py-2 transition-all duration-200 flex items-center gap-1.5"
            style={{
              background: "oklch(0.72 0.22 10 / 0.12)",
              border: "1px solid oklch(0.72 0.22 10 / 0.35)",
              color: "oklch(0.72 0.22 10)",
            }}
          >
            <Crown className="w-3.5 h-3.5" />
            {signedInUser ? `${signedInUser} · Ultra` : "Innovexa Ultra →"}
          </Button>

          <Button
            data-ocid="landing.try_button"
            onClick={onTryInnovexa}
            size="sm"
            className="rounded-lg text-sm font-semibold px-4 py-2 transition-all duration-200"
            style={{
              background: "oklch(0.72 0.18 220 / 0.12)",
              border: "1px solid oklch(0.72 0.18 220 / 0.3)",
              color: "oklch(0.72 0.18 220)",
            }}
          >
            Try Innovexa
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-8 pb-16 md:pt-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase"
            style={{
              background: "oklch(0.72 0.18 220 / 0.1)",
              border: "1px solid oklch(0.72 0.18 220 / 0.25)",
              color: "oklch(0.72 0.18 220)",
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "oklch(0.78 0.20 190)" }}
            />
            Next-Generation AI Assistant
          </div>
        </motion.div>

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
            style={{
              background: "oklch(0.14 0.01 260)",
              border: "1px solid oklch(0.72 0.18 220 / 0.35)",
              boxShadow:
                "0 0 60px oklch(0.72 0.18 220 / 0.2), 0 0 120px oklch(0.72 0.18 220 / 0.08)",
            }}
          >
            <img
              src="/assets/generated/innovexa-logo-mark-transparent.dim_80x80.png"
              alt="Innovexa AI"
              className="w-14 h-14 object-contain"
            />
          </div>
          <div
            className="absolute inset-0 rounded-3xl mx-auto pulse-ring"
            style={{ border: "1px solid oklch(0.72 0.18 220 / 0.2)" }}
          />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-center mb-6 max-w-3xl"
        >
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.08] mb-4">
            The AI That
            <br />
            <span
              className="text-glow"
              style={{ color: "oklch(0.72 0.18 220)" }}
            >
              World's Most Intelligent AI Assistant
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
            A next-generation AI assistant with adaptive thinking modes — from
            lightning-fast replies to deep analytical reasoning.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center gap-3 mb-6"
        >
          <Button
            data-ocid="landing.primary_button"
            onClick={onTryInnovexa}
            size="lg"
            className="relative px-8 py-6 text-base font-bold rounded-xl transition-all duration-300 overflow-hidden group"
            style={{
              background: "oklch(0.72 0.18 220)",
              color: "oklch(0.08 0.006 260)",
              boxShadow:
                "0 0 32px oklch(0.72 0.18 220 / 0.4), 0 4px 16px oklch(0 0 0 / 0.4)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Try Innovexa
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.80 0.18 220) 0%, oklch(0.72 0.18 220) 100%)",
              }}
            />
          </Button>
          <p className="text-xs text-muted-foreground">
            Ultra access available for team members
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48 }}
          className="flex flex-wrap items-center justify-center gap-y-3 mb-14"
        >
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center">
                {i > 0 && (
                  <span
                    className="hidden sm:block w-px h-4 mx-5"
                    style={{ background: "oklch(0.25 0.015 260)" }}
                  />
                )}
                <div className="flex items-center gap-2 px-2 sm:px-0">
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: "oklch(0.55 0.01 260)" }}
                    strokeWidth={2}
                  />
                  <span
                    className="text-sm font-bold"
                    style={{ color: "oklch(0.80 0.01 260)" }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="w-full max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Section label */}
          <div className="text-center mb-8">
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "oklch(0.55 0.01 260)" }}
            >
              Capabilities
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              const isUltra = idx === 4;
              return (
                <motion.div
                  key={feat.title}
                  data-ocid={`landing.feature.card.${idx + 1}`}
                  className="group relative rounded-2xl p-5 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.55 + idx * 0.07 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  style={{
                    background: isUltra
                      ? "oklch(0.72 0.22 10 / 0.06)"
                      : "oklch(0.13 0.008 260 / 0.8)",
                    border: isUltra
                      ? "1px solid oklch(0.72 0.22 10 / 0.3)"
                      : "1px solid oklch(0.22 0.015 260)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at top left, oklch(${feat.color} / 0.08) 0%, transparent 70%)`,
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative z-10"
                    style={{
                      background: `oklch(${feat.color} / 0.12)`,
                      border: `1px solid oklch(${feat.color} / 0.25)`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: `oklch(${feat.color})` }}
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className="font-display font-semibold text-sm text-foreground mb-2 relative z-10">
                    {feat.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed relative z-10"
                    style={{ color: "oklch(0.75 0.01 260)" }}
                  >
                    {feat.description}
                  </p>
                  {isUltra && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: "oklch(0.72 0.22 10 / 0.2)",
                        color: "oklch(0.72 0.22 10)",
                        border: "1px solid oklch(0.72 0.22 10 / 0.3)",
                      }}
                    >
                      <Crown className="w-2.5 h-2.5" />
                      Ultra
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Enterprise strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 w-full max-w-3xl"
        >
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl px-8 py-5"
            style={{
              background: "oklch(0.13 0.007 260 / 0.6)",
              border: "1px solid oklch(0.22 0.012 260)",
            }}
          >
            <Shield
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "oklch(0.55 0.01 260)" }}
              strokeWidth={1.5}
            />
            <p
              className="text-sm font-medium text-center sm:text-left"
              style={{ color: "oklch(0.65 0.01 260)" }}
            >
              Built for serious work.{" "}
              <span style={{ color: "oklch(0.78 0.01 260)" }}>
                Enterprise-grade reliability with no compromise on intelligence.
              </span>
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 px-4">
        <p className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

// ─── Mode Select Step ─────────────────────────────────────────────────────────

function ModeSelectStep({
  selectedMode,
  onSelectMode,
  onStart,
  onBack,
  onUltraLocked,
  signedInUser,
  onSignOut,
}: {
  selectedMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onStart: () => void;
  onBack: () => void;
  onUltraLocked: () => void;
  signedInUser: string | null;
  onSignOut: () => void;
}) {
  const allModes = [
    Mode.fast,
    Mode.thinking,
    Mode.pro,
    Mode.ultra,
  ] as AppMode[];

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{ background: "oklch(0.10 0.006 260)" }}
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.72 0.18 220 / 0.06) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top bar: back + user info */}
        <div className="w-full flex items-center justify-between mb-8">
          <motion.button
            data-ocid="mode.back_button"
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ArrowLeft
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
              strokeWidth={2}
            />
            <span>Back</span>
          </motion.button>

          {signedInUser && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium"
                style={{
                  background: "oklch(0.72 0.22 10 / 0.1)",
                  border: "1px solid oklch(0.72 0.22 10 / 0.25)",
                  color: "oklch(0.72 0.22 10)",
                }}
              >
                <Crown className="w-3 h-3" />
                <span>Hi, {signedInUser}</span>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg px-2 py-1.5"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Header */}
        <motion.div
          className="flex flex-col items-center mb-10 text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="relative mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: "oklch(0.14 0.01 260)",
                border: "1px solid oklch(0.72 0.18 220 / 0.35)",
                boxShadow: "0 0 32px oklch(0.72 0.18 220 / 0.2)",
              }}
            >
              <img
                src="/assets/generated/innovexa-logo-mark-transparent.dim_80x80.png"
                alt="Innovexa AI"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div
              className="absolute inset-0 rounded-2xl mx-auto pulse-ring"
              style={{ border: "1px solid oklch(0.72 0.18 220 / 0.2)" }}
            />
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-2">
            <span style={{ color: "oklch(0.72 0.18 220)" }}>Choose Your</span>{" "}
            <span
              className="text-glow"
              style={{ color: "oklch(0.72 0.18 220)" }}
            >
              Thinking Mode
            </span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
            Select how Innovexa AI approaches your questions — from instant
            answers to deep analytical research.
          </p>
        </motion.div>

        {/* Mode Cards — 2x2 grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {allModes.map((modeKey, idx) => {
            const cfg = MODE_CONFIG[modeKey];
            const Icon = cfg.icon;
            const isSelected = selectedMode === modeKey;
            const isUltra = modeKey === Mode.ultra;
            const isLocked = isUltra && !signedInUser;

            return (
              <motion.button
                key={modeKey}
                data-ocid={`mode.${modeKey}.card`}
                type="button"
                onClick={() => {
                  if (isLocked) {
                    onUltraLocked();
                  } else {
                    onSelectMode(modeKey);
                  }
                }}
                className="relative group text-left rounded-2xl p-5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background: isLocked
                    ? "oklch(0.12 0.007 260 / 0.6)"
                    : isSelected
                      ? `oklch(${cfg.colorRaw} / 0.08)`
                      : "oklch(0.13 0.008 260 / 0.8)",
                  border: isLocked
                    ? "1px solid oklch(0.22 0.015 260 / 0.5)"
                    : isSelected
                      ? `1px solid oklch(${cfg.colorRaw} / 0.4)`
                      : "1px solid oklch(0.22 0.015 260)",
                  boxShadow:
                    !isLocked && isSelected
                      ? `0 0 32px oklch(${cfg.colorRaw} / 0.15), inset 0 1px 0 oklch(${cfg.colorRaw} / 0.1)`
                      : isUltra && !isLocked
                        ? `0 0 24px oklch(${cfg.colorRaw} / 0.08)`
                        : "none",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: isLocked ? 0.55 : 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + idx * 0.08 }}
                whileHover={isLocked ? {} : { scale: 1.02, y: -2 }}
                whileTap={isLocked ? {} : { scale: 0.98 }}
              >
                {/* Lock overlay — single clean overlay */}
                {isLocked && (
                  <div
                    className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 pointer-events-none z-20"
                    style={{ background: "oklch(0.10 0.006 260 / 0.5)" }}
                  >
                    <Lock
                      className="w-5 h-5"
                      style={{ color: "oklch(0.50 0.01 260)" }}
                      strokeWidth={1.5}
                    />
                    <span
                      className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                      style={{
                        background: "oklch(0.18 0.008 260)",
                        border: "1px solid oklch(0.28 0.015 260)",
                        color: "oklch(0.60 0.01 260)",
                      }}
                    >
                      Team only
                    </span>
                  </div>
                )}

                {/* Unlocked badge for Ultra */}
                {isUltra && !isLocked && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold z-10"
                    style={{
                      background: "oklch(0.72 0.22 10 / 0.2)",
                      color: "oklch(0.72 0.22 10)",
                      border: "1px solid oklch(0.72 0.22 10 / 0.35)",
                    }}
                  >
                    <Crown className="w-2.5 h-2.5" />
                    Unlocked
                  </div>
                )}

                {isSelected && !isLocked && !isUltra && (
                  <motion.div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ background: `oklch(${cfg.colorRaw})` }}
                    layoutId="selectedDot"
                  />
                )}

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative z-10"
                  style={{
                    background: `oklch(${cfg.colorRaw} / ${isLocked ? "0.06" : "0.12"})`,
                    border: `1px solid oklch(${cfg.colorRaw} / ${isLocked ? "0.15" : "0.25"})`,
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: isLocked
                        ? `oklch(${cfg.colorRaw} / 0.4)`
                        : `oklch(${cfg.colorRaw})`,
                    }}
                    strokeWidth={isSelected ? 2.5 : 2}
                  />
                </div>

                <div className="font-display font-bold text-lg text-foreground mb-1 relative z-10">
                  {cfg.label}
                </div>
                <div
                  className="text-sm font-semibold mb-2 relative z-10"
                  style={{
                    color: isLocked
                      ? `oklch(${cfg.colorRaw} / 0.4)`
                      : `oklch(${cfg.colorRaw})`,
                  }}
                >
                  {cfg.tagline}
                </div>
                <p
                  className="text-sm leading-relaxed relative z-10"
                  style={{ color: "oklch(0.75 0.01 260)" }}
                >
                  {cfg.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="w-full sm:w-auto"
        >
          <Button
            data-ocid="mode.start_button"
            onClick={onStart}
            size="lg"
            className="w-full sm:w-auto px-10 py-6 text-base font-bold rounded-xl transition-all duration-300 relative overflow-hidden group"
            style={
              selectedMode === Mode.ultra
                ? {
                    background: "oklch(0.72 0.22 10)",
                    color: "oklch(0.97 0.005 30)",
                    boxShadow:
                      "0 0 28px oklch(0.72 0.22 10 / 0.4), 0 4px 16px oklch(0 0 0 / 0.4)",
                  }
                : {
                    background: "oklch(0.72 0.18 220)",
                    color: "oklch(0.08 0.006 260)",
                    boxShadow:
                      "0 0 28px oklch(0.72 0.18 220 / 0.4), 0 4px 16px oklch(0 0 0 / 0.4)",
                  }
            }
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Chat in{" "}
              <span className="font-black">
                {MODE_CONFIG[selectedMode].label}
              </span>{" "}
              Mode
              {selectedMode === Mode.ultra ? (
                <Crown className="w-4 h-4" strokeWidth={2.5} />
              ) : (
                <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              )}
            </span>
          </Button>
        </motion.div>

        {/* Attribution */}
        <motion.p
          className="mt-8 text-xs text-muted-foreground/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Powered by Innovexa Neural Engine v4.2
        </motion.p>
      </motion.div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ mode }: { mode: AppMode }) {
  const cfg = MODE_CONFIG[mode];
  const labels: Record<AppMode, string> = {
    [Mode.fast]: "Innovexa AI is composing...",
    [Mode.thinking]: "Innovexa AI is reasoning...",
    [Mode.pro]: "Innovexa AI is analyzing deeply...",
    [Mode.ultra]: "Innovexa Ultra is computing...",
  };

  return (
    <motion.div
      data-ocid="chat.loading_state"
      className="flex items-start gap-3 px-4 py-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
        style={{
          background: "oklch(0.14 0.01 260)",
          border: `1px solid oklch(${cfg.colorRaw} / 0.3)`,
        }}
      >
        <img
          src="/assets/generated/innovexa-logo-mark-transparent.dim_80x80.png"
          alt="Innovexa"
          className="w-5 h-5 object-contain"
        />
      </div>

      <div
        className="flex flex-col gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3"
        style={{
          background: "oklch(0.14 0.008 260)",
          border: "1px solid oklch(0.22 0.015 260)",
          maxWidth: "fit-content",
        }}
      >
        <span className="text-xs text-muted-foreground mb-1">
          {labels[mode]}
        </span>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: `oklch(${cfg.colorRaw})`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  index,
  mode,
}: {
  message: ChatMessage;
  index: number;
  mode: AppMode;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const cfg = MODE_CONFIG[mode];

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  return (
    <motion.div
      data-ocid={`chat.message.item.${index + 1}`}
      className={`flex items-start gap-3 px-4 py-1 group ${isUser ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Avatar — AI only */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{
            background: "oklch(0.14 0.01 260)",
            border: `1px solid oklch(${cfg.colorRaw} / 0.3)`,
          }}
        >
          <img
            src="/assets/generated/innovexa-logo-mark-transparent.dim_80x80.png"
            alt="Innovexa"
            className="w-5 h-5 object-contain"
          />
        </div>
      )}

      <div
        className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser ? "rounded-tr-sm" : "rounded-tl-sm"
          }`}
          style={
            isUser
              ? {
                  background: "oklch(0.72 0.18 220 / 0.15)",
                  border: "1px solid oklch(0.72 0.18 220 / 0.25)",
                  color: "oklch(0.94 0.008 240)",
                }
              : {
                  background: "oklch(0.14 0.008 260)",
                  border: "1px solid oklch(0.22 0.015 260)",
                  color: "oklch(0.88 0.008 240)",
                }
          }
        >
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed break-words">
            {message.content}
          </pre>
        </div>

        {/* Copy button — appears on hover */}
        {!isUser && (
          <motion.button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 px-1 py-0.5 rounded"
            title="Copy response"
            aria-label="Copy response"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

function ErrorBanner({
  message,
  onDismiss,
}: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      data-ocid="chat.error_state"
      className="mx-4 my-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
      style={{
        background: "oklch(0.62 0.22 25 / 0.1)",
        border: "1px solid oklch(0.62 0.22 25 / 0.3)",
        color: "oklch(0.85 0.08 25)",
      }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs underline opacity-70 hover:opacity-100 transition-opacity"
      >
        Dismiss
      </button>
    </motion.div>
  );
}

// ─── Chat Screen ──────────────────────────────────────────────────────────────

function ChatScreen({
  mode,
  messages,
  onModeChange,
  onNewChat,
  onSendMessage,
  isLoading,
  error,
  onDismissError,
  signedInUser,
}: {
  mode: AppMode;
  messages: ChatMessage[];
  onModeChange: (mode: AppMode) => void;
  onNewChat: () => void;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  error: string | null;
  onDismissError: () => void;
  signedInUser: string | null;
}) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cfg = MODE_CONFIG[mode];
  const isUltraMode = mode === Mode.ultra;

  // Auto-scroll to bottom
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally depend on messages/isLoading to scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run when inputValue changes to resize
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [inputValue]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue("");
    onSendMessage(text);
  }, [inputValue, isLoading, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const isEmpty = messages.length === 0;
  const allModes = [
    Mode.fast,
    Mode.thinking,
    Mode.pro,
    Mode.ultra,
  ] as AppMode[];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 z-10 glass-strong"
        style={{
          borderBottom: isUltraMode
            ? "1px solid oklch(0.72 0.22 10 / 0.4)"
            : "1px solid oklch(0.22 0.015 260)",
          boxShadow: isUltraMode
            ? "0 1px 20px oklch(0.72 0.22 10 / 0.12)"
            : "none",
        }}
      >
        {/* Logo + user badge */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "oklch(0.14 0.01 260)",
              border: `1px solid ${isUltraMode ? "oklch(0.72 0.22 10 / 0.35)" : "oklch(0.72 0.18 220 / 0.3)"}`,
            }}
          >
            <img
              src="/assets/generated/innovexa-logo-mark-transparent.dim_80x80.png"
              alt="Innovexa AI"
              className="w-4.5 h-4.5 object-contain"
            />
          </div>
          <span className="font-display font-semibold text-sm text-foreground">
            Innovexa{" "}
            <span
              style={{
                color: isUltraMode
                  ? "oklch(0.72 0.22 10)"
                  : "oklch(0.72 0.18 220)",
              }}
            >
              {isUltraMode ? "Ultra" : "AI"}
            </span>
          </span>
          {/* Signed-in user badge */}
          {signedInUser && (
            <div
              className="hidden sm:flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ml-1"
              style={{
                background: "oklch(0.72 0.22 10 / 0.1)",
                border: "1px solid oklch(0.72 0.22 10 / 0.2)",
                color: "oklch(0.72 0.22 10 / 0.85)",
              }}
            >
              <Crown className="w-2.5 h-2.5" />
              {signedInUser}
            </div>
          )}
        </div>

        {/* Center: Mode switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-ocid="chat.mode.select"
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              style={{
                background: `oklch(${cfg.colorRaw} / 0.12)`,
                border: `1px solid oklch(${cfg.colorRaw} / 0.3)`,
                color: `oklch(${cfg.colorRaw})`,
                boxShadow: isUltraMode
                  ? `0 0 16px oklch(${cfg.colorRaw} / 0.15)`
                  : `0 0 12px oklch(${cfg.colorRaw} / 0.1)`,
              }}
            >
              <cfg.icon className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Switch Model</span>
              <span className="sm:hidden">{cfg.label}</span>
              <span
                className="hidden sm:inline text-xs font-normal opacity-70 px-1.5 py-0.5 rounded-md"
                style={{
                  background: `oklch(${cfg.colorRaw} / 0.15)`,
                }}
              >
                {isUltraMode ? "⚡ Ultra" : cfg.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="min-w-[200px] rounded-xl overflow-hidden p-1"
            style={{
              background: "oklch(0.14 0.01 260)",
              border: "1px solid oklch(0.25 0.015 260)",
              boxShadow: "0 16px 48px oklch(0 0 0 / 0.5)",
            }}
          >
            <div
              className="px-3 py-1.5 mb-1"
              style={{ borderBottom: "1px solid oklch(0.22 0.015 260)" }}
            >
              <p
                className="text-xs font-semibold tracking-wider uppercase"
                style={{ color: "oklch(0.5 0.01 260)" }}
              >
                Select Model
              </p>
            </div>
            {allModes.map((m) => {
              const mc = MODE_CONFIG[m];
              const isActive = m === mode;
              const isUltraOption = m === Mode.ultra;
              const isUltraOptionLocked = isUltraOption && !signedInUser;
              return (
                <DropdownMenuItem
                  key={m}
                  onClick={() => {
                    if (!isUltraOptionLocked) onModeChange(m);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-lg focus:outline-none"
                  style={{
                    background: isActive
                      ? `oklch(${mc.colorRaw} / 0.12)`
                      : "transparent",
                    color: isUltraOptionLocked
                      ? "oklch(0.50 0.01 260)"
                      : isActive
                        ? `oklch(${mc.colorRaw})`
                        : "oklch(0.88 0.008 240)",
                    cursor: isUltraOptionLocked ? "not-allowed" : "pointer",
                    opacity: isUltraOptionLocked ? 0.5 : 1,
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `oklch(${mc.colorRaw} / 0.15)`,
                    }}
                  >
                    <mc.icon
                      className="w-3.5 h-3.5"
                      strokeWidth={2}
                      style={{ color: `oklch(${mc.colorRaw})` }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {isUltraOption ? "⚡ Ultra" : mc.label}
                    </span>
                    <span className="text-xs opacity-60">
                      {isUltraOptionLocked ? "Team access only" : mc.tagline}
                    </span>
                  </div>
                  {isActive && (
                    <span
                      className="ml-auto text-xs px-1.5 py-0.5 rounded-md font-medium"
                      style={{
                        background: `oklch(${mc.colorRaw} / 0.2)`,
                        color: `oklch(${mc.colorRaw})`,
                      }}
                    >
                      Active
                    </span>
                  )}
                  {isUltraOptionLocked && (
                    <Lock className="ml-auto w-3 h-3 opacity-50" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New Chat */}
        <Button
          data-ocid="chat.new_button"
          onClick={onNewChat}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-xs font-medium hover:bg-accent/50 rounded-lg"
          style={{ color: "oklch(0.65 0.01 260)" }}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

        {isEmpty ? (
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 py-16">
            <motion.div
              className="text-center max-w-md"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{
                  background: "oklch(0.14 0.01 260)",
                  border: `1px solid oklch(${cfg.colorRaw} / 0.3)`,
                  boxShadow: `0 0 24px oklch(${cfg.colorRaw} / 0.12)`,
                }}
              >
                <cfg.icon
                  className="w-7 h-7"
                  style={{ color: `oklch(${cfg.colorRaw})` }}
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                {isUltraMode
                  ? "Innovexa Ultra is ready"
                  : "What can I help you with today?"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You&apos;re in{" "}
                <span
                  style={{ color: `oklch(${cfg.colorRaw})` }}
                  className="font-medium"
                >
                  {cfg.label} mode
                </span>{" "}
                — {cfg.tagline.toLowerCase()}. Ask me anything.
              </p>

              {/* Suggestion pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {(isUltraMode
                  ? [
                      "Solve a complex problem",
                      "Deep technical analysis",
                      "Research a topic in depth",
                      "Expert-level advice",
                    ]
                  : [
                      "Explain a complex concept",
                      "Write some code",
                      "Analyze this problem",
                      "Help me brainstorm",
                    ]
                ).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setInputValue(s);
                      textareaRef.current?.focus();
                    }}
                    className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:border-opacity-60"
                    style={{
                      background: "oklch(0.14 0.008 260)",
                      border: "1px solid oklch(0.25 0.015 260)",
                      color: "oklch(0.75 0.01 260)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="relative z-10 py-6 space-y-1 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  index={i}
                  mode={mode}
                />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {isLoading && <TypingIndicator mode={mode} />}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <ErrorBanner message={error} onDismiss={onDismissError} />
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Empty error state (when no messages) */}
        {isEmpty && error && (
          <div className="absolute bottom-0 left-0 right-0 z-10 max-w-3xl mx-auto px-4 pb-2">
            <AnimatePresence>
              <ErrorBanner message={error} onDismiss={onDismissError} />
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Input area */}
      <footer
        className="flex-shrink-0 pb-safe"
        style={{ borderTop: "1px solid oklch(0.18 0.012 260)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div
            className="relative flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
            style={{
              background: "oklch(0.13 0.008 260)",
              border: isLoading
                ? "1px solid oklch(0.28 0.015 260)"
                : "1px solid oklch(0.25 0.015 260)",
              boxShadow: "0 2px 16px oklch(0 0 0 / 0.3)",
            }}
          >
            <Textarea
              ref={textareaRef}
              data-ocid="chat.input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isUltraMode
                  ? "Ask Innovexa Ultra anything..."
                  : "Message Innovexa AI..."
              }
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none bg-transparent border-none shadow-none focus-visible:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60 min-h-[24px] max-h-[160px] py-0 px-0 leading-relaxed disabled:opacity-50"
              style={{ scrollbarWidth: "none", color: "oklch(0.92 0.005 260)" }}
            />

            <Button
              data-ocid="chat.send_button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="flex-shrink-0 w-8 h-8 p-0 rounded-lg transition-all duration-200 disabled:opacity-30"
              style={{
                background:
                  inputValue.trim() && !isLoading
                    ? isUltraMode
                      ? "oklch(0.72 0.22 10)"
                      : "oklch(0.72 0.18 220)"
                    : "oklch(0.22 0.012 260)",
                border: "none",
                color: isUltraMode
                  ? "oklch(0.97 0.005 30)"
                  : "oklch(0.08 0.006 260)",
              }}
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground/40 mt-2">
            Innovexa AI can make mistakes. Verify important information.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    // Restore screen from sessionStorage if signed in
    const savedUser = sessionStorage.getItem("innovexa_user");
    return savedUser ? "mode-select" : "landing";
  });
  const [mode, setMode] = useState<AppMode>(Mode.fast);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedInUser, setSignedInUser] = useState<string | null>(() => {
    return sessionStorage.getItem("innovexa_user");
  });
  // Track where to go after sign-in
  const [afterSignIn, setAfterSignIn] = useState<"mode-select">("mode-select");
  const { actor } = useActor();

  const handleSignIn = useCallback((username: string) => {
    sessionStorage.setItem("innovexa_user", username);
    setSignedInUser(username);
    setScreen("welcome");
  }, []);

  const handleSignOut = useCallback(() => {
    sessionStorage.removeItem("innovexa_user");
    setSignedInUser(null);
    // If currently in Ultra mode, switch back to fast
    setMode((prev) => (prev === Mode.ultra ? Mode.fast : prev));
    setScreen("mode-select");
  }, []);

  const handleWelcomeEnter = useCallback(() => {
    setScreen(afterSignIn);
  }, [afterSignIn]);

  const handleTryInnovexa = useCallback(() => {
    setScreen("mode-select");
  }, []);

  const handleUltraClick = useCallback(() => {
    if (signedInUser) {
      setMode(Mode.ultra);
      setScreen("mode-select");
    } else {
      setAfterSignIn("mode-select");
      setScreen("signin");
    }
  }, [signedInUser]);

  const handleUltraLocked = useCallback(() => {
    setAfterSignIn("mode-select");
    setScreen("signin");
  }, []);

  const handleBackToLanding = useCallback(() => {
    setScreen("landing");
  }, []);

  const handleStartChat = useCallback(() => {
    setScreen("chat");
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setScreen("landing");
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (isLoading || !actor) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-u`,
        role: "user",
        content: text,
      };
      const prevMessages = [...messages];

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        // Convert chat history to the format the backend expects: Array<[role, content]>
        const history: Array<[string, string]> = prevMessages.map((m) => [
          m.role === "user" ? "user" : "model",
          m.content,
        ]);

        const reply = await actor.sendMessage(history, text, mode);

        setMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}-a`, role: "model", content: reply },
        ]);
      } catch (err) {
        const rawMsg =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setError(
          rawMsg.length > 200 || rawMsg.includes("fetch")
            ? "Could not reach the AI service. Please try again."
            : rawMsg,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, mode, actor],
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.10 0.006 260)" }}
    >
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <LandingPage
              onTryInnovexa={handleTryInnovexa}
              onUltraClick={handleUltraClick}
              signedInUser={signedInUser}
            />
          </motion.div>
        )}

        {screen === "signin" && (
          <motion.div
            key="signin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <SignInPage
              onSignIn={handleSignIn}
              onBack={() => setScreen("mode-select")}
            />
          </motion.div>
        )}

        {screen === "welcome" && signedInUser && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WelcomeScreen
              username={signedInUser}
              onEnter={handleWelcomeEnter}
            />
          </motion.div>
        )}

        {screen === "mode-select" && (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <ModeSelectStep
              selectedMode={mode}
              onSelectMode={setMode}
              onStart={handleStartChat}
              onBack={handleBackToLanding}
              onUltraLocked={handleUltraLocked}
              signedInUser={signedInUser}
              onSignOut={handleSignOut}
            />
          </motion.div>
        )}

        {screen === "chat" && (
          <motion.div
            key="chat"
            className="h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChatScreen
              mode={mode}
              messages={messages}
              onModeChange={setMode}
              onNewChat={handleNewChat}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              error={error}
              onDismissError={() => setError(null)}
              signedInUser={signedInUser}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
