import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Coins, Scale, Trophy, Users, Zap } from "lucide-react";

const INITIAL_STATS = {
  finances: 50,
  fans: 50,
  morale: 50,
};

const QUIZ_STEPS = {
  step1: {
    title: "THE STAR PLAYER DILEMMA",
    context:
      "A rival club offers £40M for your top goalscorer. The club needs the money, but the fans love him.",
    options: [
      {
        label: "SELL HIM (£40M)",
        delta: { finances: 20, fans: -30, morale: -15 },
        next: "step2a",
      },
      {
        label: "REJECT & KEEP",
        delta: { finances: -20, fans: 30, morale: 15 },
        next: "step2b",
      },
    ],
  },
  step2a: {
    title: "REINVESTING THE CASH",
    context: "You have £40M in the bank. How do you spend it?",
    options: [
      {
        label: "SIGN A SUPER STAR",
        delta: { finances: -40, fans: 20, morale: -10 },
        next: "step3Healthy",
      },
      {
        label: "INVEST IN YOUTH & FACILITIES",
        delta: { finances: -20, fans: 20, morale: 15 },
        next: "step3Healthy",
      },
    ],
  },
  step2b: {
    title: "FINANCIAL DISTRESS",
    context: "Keeping the player put the club in a tight financial spot. Cash is running low.",
    options: [
      {
        label: "CUT ACADEMY BUDGET",
        delta: { finances: 20, fans: -10, morale: -20 },
        next: "step3Low",
      },
      {
        label: "SELL CLUB SHARES",
        delta: { finances: 40, fans: -40, morale: 0 },
        next: "step3Low",
      },
    ],
  },
  step3Healthy: {
    title: "THE CHAMPIONSHIP FINAL",
    context: "You are in the final. Finances are strong.",
    options: [
      {
        label: "PROMISE A RECORD BONUS",
        delta: { finances: -20, fans: 0, morale: 30 },
        next: "result",
      },
      {
        label: "OPEN TRAINING TO FANS",
        delta: { finances: -10, fans: 15, morale: 15 },
        next: "result",
      },
    ],
  },
  step3Low: {
    title: "THE CHAMPIONSHIP FINAL",
    context: "You are in the final but short on cash.",
    options: [
      {
        label: "FREE TICKETS FOR FAN SUPPORT",
        delta: { finances: 0, fans: 30, morale: 15 },
        next: "result",
      },
      {
        label: "SPEND LAST CASH ON MATCH BONUS",
        delta: { finances: -20, fans: 15, morale: 15 },
        next: "result",
      },
    ],
  },
};

function clampForBar(value) {
  return Math.max(0, Math.min(100, value));
}

function buildNextStats(current, delta) {
  return {
    finances: current.finances + delta.finances,
    fans: current.fans + delta.fans,
    morale: current.morale + delta.morale,
  };
}

function getOwnerTitle(stats) {
  // Ultimate combination if both stats are elite
  if (stats.fans > 65 && stats.finances > 65) {
    return "THE CHOSEN ONE 👑";
  }

  // High Fan focus but balanced/low finance
  if (stats.fans > stats.finances && stats.fans > 60) {
    return "THE TERRACE HERO 📣";
  }

  // High Finance focus but balanced/low fans
  if (stats.finances > stats.fans && stats.finances > 60) {
    return "THE MONEYBALL TYCOON 💰";
  }

  // Default balanced tactical state
  return "THE TACTICAL STRATEGIST 🧠";
}

function App() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [stepKey, setStepKey] = useState("step1");
  const [selectedOption, setSelectedOption] = useState(null);
  const [pendingSelection, setPendingSelection] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isFinalRevealed, setIsFinalRevealed] = useState(false);
  const currentStep = QUIZ_STEPS[stepKey];
  const currentStepNumber =
    stepKey === "step1" ? 1 : stepKey === "step2a" || stepKey === "step2b" ? 2 : 3;
  const phaseLabel =
    currentStepNumber === 1
      ? "Phase 1: Transfer Deadline Day"
      : currentStepNumber === 3
        ? "The Championship Final"
        : "Phase 2: Boardroom Pressure";
  const finalProfileTitle = getOwnerTitle(stats);
  const attitudeScore = Math.min(
    98,
    Math.max(75, Math.round(((stats.finances + stats.fans + stats.morale) / 3) * 1.3)),
  );
  const [animatedAttitudeScore, setAnimatedAttitudeScore] = useState(0);
  const [barFillScore, setBarFillScore] = useState(0);
  const metricItems = useMemo(
    () => [
      { key: "finances", label: "Finances", icon: Coins, value: stats.finances },
      { key: "fans", label: "Fans", icon: Users, value: stats.fans },
      { key: "morale", label: "Squad Morale", icon: Zap, value: stats.morale },
    ],
    [stats],
  );

  useEffect(() => {
    if (!isFinalRevealed) {
      setAnimatedAttitudeScore(0);
      setBarFillScore(0);
      return;
    }

    setAnimatedAttitudeScore(0);
    setBarFillScore(0);

    const fillTimeout = window.setTimeout(() => {
      setBarFillScore(attitudeScore);
    }, 40);

    const durationMs = 2000;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setAnimatedAttitudeScore(Math.round(attitudeScore * progress));
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(fillTimeout);
      window.cancelAnimationFrame(rafId);
    };
  }, [isFinalRevealed, attitudeScore]);

  const handleSelectOption = (option, optionKey) => {
    if (isLocked || isCalculating || isFinalRevealed) return;
    setSelectedOption(optionKey);
    setPendingSelection(option);
  };

  const handleNextStep = () => {
    if (!pendingSelection || isCalculating || isFinalRevealed) return;
    const nextStats = buildNextStats(stats, pendingSelection.delta);
    setStats(nextStats);

    if (currentStepNumber < 3) {
      const nextStep = pendingSelection.next;
      window.setTimeout(() => {
        setStepKey(nextStep);
        setPendingSelection(null);
        setSelectedOption(null);
      }, 220);
      return;
    }

    setIsLocked(true);
    setIsCalculating(true);
    setPendingSelection(null);
    window.setTimeout(() => {
      setIsCalculating(false);
      setIsFinalRevealed(true);
    }, 1500);
  };

  const handleRestart = () => {
    setStats(INITIAL_STATS);
    setStepKey("step1");
    setSelectedOption(null);
    setPendingSelection(null);
    setIsLocked(false);
    setIsCalculating(false);
    setIsFinalRevealed(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-zinc-100">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden overflow-visible md:absolute md:right-0 md:top-0 md:block md:h-full md:w-1/2">
        <img
          src="/case.png"
          alt="Legendary Club Owner chairman"
          className="h-full w-full object-cover object-right"
          style={{
            filter: "brightness(1.45) contrast(1.1) saturate(1.15) drop-shadow(0 0 20px rgba(0, 255, 0, 0.15))",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 md:hidden">
        <img
          src="/case.png"
          alt="Legendary Club Owner chairman mobile"
          className="h-full w-full object-cover object-[72%_top] opacity-45"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(16,185,129,0.17),transparent_45%)]" />
      <main className="relative z-10 flex w-full flex-col px-4 py-4 pb-20 md:w-1/2 md:px-12 md:py-6">
        <div className="mx-auto flex w-full max-w-md flex-col gap-y-6 md:max-w-3xl">
          <div className="relative z-10">
            <h1>
              <span className="block text-white font-black text-4xl md:text-5xl tracking-tight uppercase mb-1">
                LEGENDARY CLUB OWNER (LCO)
              </span>
              <span className="block !text-[#10b981] font-black text-5xl md:text-7xl tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                OWN THE CLUB. RULE THE GAME.
              </span>
            </h1>

            <div className="mt-4 mb-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-emerald-500/60 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)]"
              >
                <BrainCircuit className="!text-[#10b981] w-8 h-8 drop-shadow-[0_0_8px_#10b981] animate-pulse" />
                <p className="mt-2 text-sm font-black tracking-wider text-white md:text-base">SKILL-BASED</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-emerald-500/60 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)]"
              >
                <Scale className="!text-[#10b981] w-8 h-8 drop-shadow-[0_0_8px_#10b981]" />
                <p className="mt-2 text-sm font-black tracking-wider text-white md:text-base">NO PAY-TO-WIN</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center backdrop-blur-md transition-all duration-300 hover:scale-[1.03] hover:border-emerald-500/60 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)]"
              >
                <Trophy className="!text-[#10b981] w-8 h-8 drop-shadow-[0_0_8px_#10b981]" />
                <p className="mt-2 text-sm font-black tracking-wider text-white md:text-base">REAL REWARDS</p>
              </motion.div>
            </div>

            <section
              data-testid="quiz-container"
              className="relative w-full h-auto overflow-hidden rounded-xl border border-emerald-500/30 bg-zinc-900/80 px-4 pt-4 pb-6 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] md:pb-8"
            >
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              WHAT KIND OF OWNER ARE YOU?
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {metricItems.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.key}>
                    <div className="mb-2 flex items-center justify-between text-sm text-zinc-200">
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <Icon size={14} className="text-emerald-400" />
                        {metric.label}
                      </span>
                      <span
                        data-testid={
                          metric.key === "finances"
                            ? "finance-val"
                            : metric.key === "fans"
                              ? "fans-val"
                              : "morale-val"
                        }
                        className="font-bold"
                      >
                        {metric.value}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        animate={{ width: `${clampForBar(metric.value)}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="!bg-[#10b981] h-full rounded-full shadow-[0_0_15px_#10b981]"
                        style={{ width: `${clampForBar(metric.value)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                Step {currentStepNumber} of 3
              </p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`h-1 w-8 rounded-full transition ${
                      step <= currentStepNumber
                        ? "bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.65)]"
                        : "bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="mt-2 text-center text-xl font-medium text-zinc-200">{phaseLabel}</p>

            <div className="mt-2">
              <AnimatePresence mode="wait">
              <motion.div
                key={stepKey}
                className="pr-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="mt-2 text-2xl font-black uppercase leading-tight text-white">{currentStep.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-zinc-200">{currentStep.context}</p>

                {!isFinalRevealed ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <motion.button
                      type="button"
                      data-testid="option-a"
                      data-legacy-testid="quiz-option-a"
                      onClick={() => handleSelectOption(currentStep.options[0], "a")}
                      whileHover={{ scale: 1.02 }}
                      className={`group w-full rounded-xl border bg-zinc-900/80 p-5 text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-[#10b981] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] ${
                        selectedOption === "a"
                          ? "border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                          : "border-zinc-800"
                      }`}
                    >
                      <span className="text-sm font-extrabold uppercase text-zinc-300 transition-colors group-hover:text-[#10b981]">
                        OPTION A:
                      </span>
                        <p className="mt-1 text-base font-black uppercase text-zinc-100">
                        {currentStep.options[0].label}
                      </p>
                    </motion.button>

                    <motion.button
                      type="button"
                      data-testid="option-b"
                      data-legacy-testid="quiz-option-b"
                      onClick={() => handleSelectOption(currentStep.options[1], "b")}
                      whileHover={{ scale: 1.02 }}
                      className={`group w-full rounded-xl border bg-zinc-900/80 p-5 text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-[#10b981] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] ${
                        selectedOption === "b"
                          ? "border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                          : "border-zinc-800"
                      }`}
                    >
                      <span className="text-sm font-extrabold uppercase text-zinc-300 transition-colors group-hover:text-[#10b981]">
                        OPTION B:
                      </span>
                        <p className="mt-1 text-base font-black uppercase text-zinc-100">
                        {currentStep.options[1].label}
                      </p>
                    </motion.button>
                  </div>
                ) : null}

                {!isFinalRevealed && (
                  <button
                    type="button"
                    data-testid="next-step-btn"
                    onClick={handleNextStep}
                    disabled={!pendingSelection || isCalculating}
                    className="mt-4 w-full rounded-full !bg-[#10b981] !text-black py-3 text-sm font-black uppercase tracking-[0.14em] shadow-[0_0_20px_rgba(16,185,129,0.55)] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    CONFIRM STRATEGY
                  </button>
                )}
              </motion.div>
              </AnimatePresence>
            </div>

            {(isCalculating || isFinalRevealed) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-black/75 p-4 backdrop-blur-xl md:p-6">
                {isCalculating ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-300">
                      ANALYZING YOUR OWNER PROFILE...
                    </p>
                    <div className="mx-auto mt-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 overflow-hidden rounded-xl opacity-0 animate-in fade-in duration-1000"
                  >
                    <img
                      src="/stadium-tunnel.png"
                      alt="Matchday tunnel"
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      style={{ filter: "brightness(1.45) contrast(1.1) saturate(1.2)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/20 to-transparent" />

                    <div className="relative z-10 flex h-full items-center justify-center p-5 md:p-6">
                      <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-black/60 p-4 text-center shadow-2xl backdrop-blur-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white md:text-base">
                          MATCHDAY: THE GRAND FINAL
                        </h3>
                        <p className="mt-3 text-lg font-extrabold uppercase tracking-wide text-[#10b981] md:text-xl">
                          {finalProfileTitle}
                        </p>

                        <hr className="my-6 border-zinc-700" />

                        <div className="rounded-xl border border-zinc-700 bg-black/90 p-5 shadow-[0_0_30px_rgba(0,0,0,0.75)]">
                          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                            <span className="text-emerald-400">Owner DNA</span>
                            <span className="text-emerald-400 font-bold [text-shadow:0_0_8px_#10b981]">
                              {animatedAttitudeScore}%
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-emerald-500/30">
                            <div
                              className="h-full rounded-full !bg-[#10b981] shadow-[0_0_18px_#10b981] transition-all duration-[2000ms] ease-out"
                              style={{ width: `${barFillScore}%` }}
                            />
                          </div>
                          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                            <span className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
                              💰 Finance:{" "}
                              <span className="font-bold text-emerald-400">{clampForBar(stats.finances)}</span>
                            </span>
                            <span className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
                              📣 Fans:{" "}
                              <span className="font-bold text-emerald-400">{clampForBar(stats.fans)}</span>
                            </span>
                            <span className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300">
                              🧠 Morale:{" "}
                              <span className="font-bold text-emerald-400">{clampForBar(stats.morale)}</span>
                            </span>
                          </div>
                        </div>

                        <p className="mt-6 text-xs leading-relaxed tracking-wide text-zinc-300 md:text-sm">
                          Your tactical DNA is calculated. The squad is waiting in the tunnel. Take control
                          of a real club against live data and rule the game.
                        </p>
                        <a
                          href="https://apps.apple.com/tr/app/efsane-ba%C5%9Fkan/id6743401408"
                          target="_blank"
                          data-testid="download-beta-btn"
                          className="mt-4 w-full !bg-[#10b981] !text-black font-black py-4 px-6 rounded-full text-center block shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:scale-105 transition-all text-sm tracking-widest uppercase cursor-pointer"
                        >
                          TAKE CONTROL: DOWNLOAD NOW
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            </section>
          </div>

          <div className="relative z-0 mt-6 flex w-full justify-center">
            <img
              src="/efsanebaskan.png"
              alt="Efsane Baskan Studio"
              className="pointer-events-none w-[120px] opacity-75 sm:w-[150px] md:w-[180px]"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
