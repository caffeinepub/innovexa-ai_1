import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Brain,
  Check,
  ChevronDown,
  Copy,
  Gem,
  Plus,
  Send,
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

// ─── Mode Config ──────────────────────────────────────────────────────────────

const MODE_CONFIG = {
  [Mode.fast]: {
    label: "Fast",
    tagline: "Quick, sharp answers",
    description:
      "Instant responses optimized for speed. Perfect for quick lookups, short questions, and rapid iteration.",
    icon: Zap,
    colorVar: "var(--fast-color)",
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
      "Thoughtful analysis with nuanced context. Ideal for complex questions requiring careful consideration.",
    icon: Brain,
    colorVar: "var(--thinking-color)",
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
      "Maximum depth and precision. Comprehensive research-grade responses for your most demanding challenges.",
    icon: Gem,
    colorVar: "var(--pro-color)",
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
} as const;

// ─── Welcome Screen ────────────────────────────────────────────────────────────

function WelcomeScreen({
  selectedMode,
  onSelectMode,
  onStart,
}: {
  selectedMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onStart: () => void;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.72 0.18 220 / 0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.18 270 / 0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo & Header */}
        <motion.div
          className="flex flex-col items-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "oklch(0.14 0.01 260)",
                border: "1px solid oklch(0.72 0.18 220 / 0.3)",
                boxShadow: "0 0 32px oklch(0.72 0.18 220 / 0.2)",
              }}
            >
              <img
                src="/assets/generated/innovexa-logo-mark-transparent.dim_80x80.png"
                alt="Innovexa AI"
                className="w-10 h-10 object-contain"
              />
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-2xl pulse-ring"
              style={{ border: "1px solid oklch(0.72 0.18 220 / 0.2)" }}
            />
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground mb-2">
            Innovexa{" "}
            <span
              className="text-glow"
              style={{ color: "oklch(0.72 0.18 220)" }}
            >
              AI
            </span>
          </h1>
          <p className="text-muted-foreground text-base text-center max-w-md">
            Next-generation intelligence at your fingertips. Choose your mode to
            get started.
          </p>
        </motion.div>

        {/* Mode Cards */}
        <motion.div
          className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {(Object.keys(MODE_CONFIG) as AppMode[]).map((mode, idx) => {
            const cfg = MODE_CONFIG[mode];
            const Icon = cfg.icon;
            const isSelected = selectedMode === mode;

            return (
              <motion.button
                key={mode}
                data-ocid={`mode.${mode}.card`}
                onClick={() => onSelectMode(mode)}
                className="relative group text-left rounded-2xl p-5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background: isSelected
                    ? `oklch(${cfg.colorVar} / 0.08)`
                    : "oklch(0.13 0.008 260 / 0.8)",
                  border: isSelected
                    ? `1px solid oklch(${cfg.colorVar} / 0.4)`
                    : "1px solid oklch(0.22 0.015 260)",
                  boxShadow: isSelected
                    ? `0 0 32px oklch(${cfg.colorVar} / 0.15), inset 0 1px 0 oklch(${cfg.colorVar} / 0.1)`
                    : "none",
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + idx * 0.08 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{ background: `oklch(${cfg.colorVar})` }}
                    layoutId="selectedDot"
                  />
                )}

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: `oklch(${cfg.colorVar} / 0.12)`,
                    border: `1px solid oklch(${cfg.colorVar} / 0.25)`,
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: `oklch(${cfg.colorVar})` }}
                    strokeWidth={isSelected ? 2.5 : 2}
                  />
                </div>

                <div className="font-display font-semibold text-base text-foreground mb-1">
                  {cfg.label}
                </div>
                <div
                  className="text-xs font-medium mb-2"
                  style={{ color: `oklch(${cfg.colorVar})` }}
                >
                  {cfg.tagline}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cfg.description}
                </p>
              </motion.button>
            );
          })}
        </motion.div>

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
            className="w-full sm:w-auto px-10 py-5 text-base font-semibold rounded-xl transition-all duration-300"
            style={{
              background: "oklch(0.72 0.18 220)",
              color: "oklch(0.08 0.006 260)",
              boxShadow:
                "0 0 24px oklch(0.72 0.18 220 / 0.35), 0 2px 8px oklch(0 0 0 / 0.3)",
            }}
          >
            <span className="mr-2">
              Start with {MODE_CONFIG[selectedMode].label}
            </span>
            <Zap className="w-4 h-4 inline-block" strokeWidth={2.5} />
          </Button>
        </motion.div>

        {/* Bottom attribution */}
        <motion.p
          className="mt-10 text-xs text-muted-foreground"
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
          border: `1px solid oklch(${cfg.colorVar} / 0.3)`,
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
                background: `oklch(${cfg.colorVar})`,
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
            border: `1px solid oklch(${cfg.colorVar} / 0.3)`,
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
}: {
  mode: AppMode;
  messages: ChatMessage[];
  onModeChange: (mode: AppMode) => void;
  onNewChat: () => void;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  error: string | null;
  onDismissError: () => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cfg = MODE_CONFIG[mode];

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

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 z-10 glass-strong"
        style={{
          borderBottom: "1px solid oklch(0.22 0.015 260)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "oklch(0.14 0.01 260)",
              border: "1px solid oklch(0.72 0.18 220 / 0.3)",
            }}
          >
            <img
              src="/assets/generated/innovexa-logo-mark-transparent.dim_80x80.png"
              alt="Innovexa AI"
              className="w-4.5 h-4.5 object-contain"
            />
          </div>
          <span className="font-display font-semibold text-sm text-foreground">
            Innovexa <span style={{ color: "oklch(0.72 0.18 220)" }}>AI</span>
          </span>
        </div>

        {/* Center: Mode switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-ocid="chat.mode.select"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              style={{
                background: `oklch(${cfg.colorVar} / 0.1)`,
                border: `1px solid oklch(${cfg.colorVar} / 0.25)`,
                color: `oklch(${cfg.colorVar})`,
              }}
            >
              <cfg.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>{cfg.label} Mode</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="min-w-[160px] rounded-xl overflow-hidden"
            style={{
              background: "oklch(0.14 0.01 260)",
              border: "1px solid oklch(0.25 0.015 260)",
            }}
          >
            {(Object.keys(MODE_CONFIG) as AppMode[]).map((m) => {
              const mc = MODE_CONFIG[m];
              const isActive = m === mode;
              return (
                <DropdownMenuItem
                  key={m}
                  onClick={() => onModeChange(m)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer rounded-lg mx-1 my-0.5 focus:outline-none"
                  style={{
                    background: isActive
                      ? `oklch(${mc.colorVar} / 0.12)`
                      : "transparent",
                    color: isActive
                      ? `oklch(${mc.colorVar})`
                      : "oklch(0.88 0.008 240)",
                  }}
                >
                  <mc.icon className="w-3.5 h-3.5" strokeWidth={2} />
                  <span className="font-medium">{mc.label}</span>
                  {isActive && (
                    <span className="ml-auto text-xs opacity-70">Active</span>
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
                  border: `1px solid oklch(${cfg.colorVar} / 0.3)`,
                  boxShadow: `0 0 24px oklch(${cfg.colorVar} / 0.12)`,
                }}
              >
                <cfg.icon
                  className="w-7 h-7"
                  style={{ color: `oklch(${cfg.colorVar})` }}
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                What can I help you with today?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You&apos;re in{" "}
                <span
                  style={{ color: `oklch(${cfg.colorVar})` }}
                  className="font-medium"
                >
                  {cfg.label} mode
                </span>{" "}
                — {cfg.tagline.toLowerCase()}. Ask me anything.
              </p>

              {/* Suggestion pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  "Explain a complex concept",
                  "Write some code",
                  "Analyze this problem",
                  "Help me brainstorm",
                ].map((s) => (
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
              placeholder="Message Innovexa AI..."
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none bg-transparent border-none shadow-none focus-visible:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60 min-h-[24px] max-h-[160px] py-0 px-0 leading-relaxed disabled:opacity-50"
              style={{ scrollbarWidth: "none" }}
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
                    ? "oklch(0.72 0.18 220)"
                    : "oklch(0.22 0.012 260)",
                border: "none",
                color: "oklch(0.08 0.006 260)",
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
  const [screen, setScreen] = useState<"welcome" | "chat">("welcome");
  const [mode, setMode] = useState<AppMode>(Mode.fast);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { actor } = useActor();

  const handleStart = useCallback(() => {
    setScreen("chat");
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setScreen("welcome");
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!actor || isLoading) return;

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
        // Build history as tuples (previous messages only, not the current one)
        const history: Array<[string, string]> = prevMessages.map((m) => [
          m.role,
          m.content,
        ]);

        const reply = await actor.sendMessage(history, text, mode);

        setMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}-a`, role: "model", content: reply },
        ]);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
        setError(`Innovexa AI encountered an error: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    },
    [actor, isLoading, messages, mode],
  );

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {screen === "welcome" ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen
              selectedMode={mode}
              onSelectMode={setMode}
              onStart={handleStart}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            className="h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer — only on welcome screen */}
      {screen === "welcome" && (
        <footer className="fixed bottom-4 left-0 right-0 text-center z-20 pointer-events-none">
          <p className="text-xs text-muted-foreground/40 pointer-events-auto">
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
      )}
    </div>
  );
}
