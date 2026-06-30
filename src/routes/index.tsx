import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Apron Boy | CBT Portal" },
      { name: "description", content: "NEET Demo Mock Test — CBT Exam Simulator by The Apron Boy." },
    ],
  }),
  component: ExamSimulator,
});

type Status = "not-visited" | "not-answered" | "answered" | "marked" | "answered-marked";

interface Question {
  id: number;
  subject: "PHYSICS" | "CHEMISTRY" | "BIOLOGY";
  text: string;
  options: string[];
  correct: number;
}

const SUBJECTS = ["PHYSICS", "CHEMISTRY", "BIOLOGY"] as const;

const QUESTIONS: Question[] = [
  // Physics 1-10
  { id: 1, subject: "PHYSICS", text: "The SI unit of electric current is:", options: ["Volt", "Ampere", "Ohm", "Coulomb"], correct: 1 },
  { id: 2, subject: "PHYSICS", text: "A body in uniform circular motion has constant:", options: ["Velocity", "Acceleration", "Speed", "Momentum"], correct: 2 },
  { id: 3, subject: "PHYSICS", text: "The dimensional formula of work is:", options: ["[MLT⁻²]", "[ML²T⁻²]", "[MLT⁻¹]", "[ML²T⁻¹]"], correct: 1 },
  { id: 4, subject: "PHYSICS", text: "Which of the following is a scalar quantity?", options: ["Force", "Velocity", "Energy", "Acceleration"], correct: 2 },
  { id: 5, subject: "PHYSICS", text: "The escape velocity from Earth is approximately:", options: ["7.9 km/s", "9.8 km/s", "11.2 km/s", "15.0 km/s"], correct: 2 },
  { id: 6, subject: "PHYSICS", text: "Refractive index of vacuum is:", options: ["0", "1", "1.33", "1.5"], correct: 1 },
  { id: 7, subject: "PHYSICS", text: "Ohm's law relates:", options: ["V, I, R", "P, V, I", "Q, V, C", "F, m, a"], correct: 0 },
  { id: 8, subject: "PHYSICS", text: "Sound waves are:", options: ["Transverse", "Longitudinal", "Electromagnetic", "Stationary"], correct: 1 },
  { id: 9, subject: "PHYSICS", text: "The unit of magnetic flux is:", options: ["Tesla", "Weber", "Henry", "Gauss"], correct: 1 },
  { id: 10, subject: "PHYSICS", text: "Photoelectric effect was explained by:", options: ["Newton", "Einstein", "Bohr", "Planck"], correct: 1 },
  // Chemistry 11-20
  { id: 11, subject: "CHEMISTRY", text: "Atomic number of Carbon is:", options: ["4", "6", "8", "12"], correct: 1 },
  { id: 12, subject: "CHEMISTRY", text: "pH of pure water at 25°C is:", options: ["0", "7", "14", "1"], correct: 1 },
  { id: 13, subject: "CHEMISTRY", text: "The most electronegative element is:", options: ["Oxygen", "Fluorine", "Chlorine", "Nitrogen"], correct: 1 },
  { id: 14, subject: "CHEMISTRY", text: "Avogadro's number is:", options: ["6.022 × 10²³", "9.81 × 10²³", "3.14 × 10²³", "1.602 × 10⁻¹⁹"], correct: 0 },
  { id: 15, subject: "CHEMISTRY", text: "Which is a noble gas?", options: ["Nitrogen", "Oxygen", "Argon", "Hydrogen"], correct: 2 },
  { id: 16, subject: "CHEMISTRY", text: "The IUPAC name of CH₃COOH is:", options: ["Methanol", "Ethanoic acid", "Ethanol", "Methanoic acid"], correct: 1 },
  { id: 17, subject: "CHEMISTRY", text: "Number of electrons in Na⁺ is:", options: ["10", "11", "12", "9"], correct: 0 },
  { id: 18, subject: "CHEMISTRY", text: "Which is an alkali metal?", options: ["Mg", "Ca", "Na", "Al"], correct: 2 },
  { id: 19, subject: "CHEMISTRY", text: "Bleaching powder is:", options: ["CaOCl₂", "CaCO₃", "Ca(OH)₂", "CaCl₂"], correct: 0 },
  { id: 20, subject: "CHEMISTRY", text: "Hybridization in methane is:", options: ["sp", "sp²", "sp³", "sp³d"], correct: 2 },
  // Biology 21-30
  { id: 21, subject: "BIOLOGY", text: "Powerhouse of the cell is:", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correct: 2 },
  { id: 22, subject: "BIOLOGY", text: "Which blood cells fight infection?", options: ["RBC", "WBC", "Platelets", "Plasma"], correct: 1 },
  { id: 23, subject: "BIOLOGY", text: "Photosynthesis occurs in:", options: ["Mitochondria", "Chloroplast", "Nucleus", "Vacuole"], correct: 1 },
  { id: 24, subject: "BIOLOGY", text: "Human heart has how many chambers?", options: ["2", "3", "4", "5"], correct: 2 },
  { id: 25, subject: "BIOLOGY", text: "Largest gland in human body is:", options: ["Pancreas", "Thyroid", "Liver", "Adrenal"], correct: 2 },
  { id: 26, subject: "BIOLOGY", text: "DNA stands for:", options: ["Deoxyribo Nucleic Acid", "Di Nucleic Acid", "Dual Nucleic Acid", "Deoxy Nitric Acid"], correct: 0 },
  { id: 27, subject: "BIOLOGY", text: "Father of Genetics is:", options: ["Darwin", "Mendel", "Watson", "Crick"], correct: 1 },
  { id: 28, subject: "BIOLOGY", text: "Number of bones in adult human:", options: ["196", "206", "216", "186"], correct: 1 },
  { id: 29, subject: "BIOLOGY", text: "Insulin is secreted by:", options: ["Liver", "Pancreas", "Kidney", "Stomach"], correct: 1 },
  { id: 30, subject: "BIOLOGY", text: "Malaria is caused by:", options: ["Bacteria", "Virus", "Plasmodium", "Fungus"], correct: 2 },
];

function formatTime(s: number) {
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

function ExamSimulator() {
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [currentQ, setCurrentQ] = useState(1);
  const [activeSubject, setActiveSubject] = useState<typeof SUBJECTS[number]>("PHYSICS");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [statuses, setStatuses] = useState<Record<number, Status>>(() => {
    const s: Record<number, Status> = {};
    for (let i = 1; i <= 30; i++) s[i] = "not-visited";
    s[1] = "not-answered";
    return s;
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      setSubmitted(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted]);

  const question = QUESTIONS.find((q) => q.id === currentQ)!;

  // Sync selected when navigating
  useEffect(() => {
    setSelected(answers[currentQ] ?? null);
    setStatuses((prev) => {
      if (prev[currentQ] === "not-visited") {
        return { ...prev, [currentQ]: "not-answered" };
      }
      return prev;
    });
  }, [currentQ, answers]);

  const goToSubject = (sub: typeof SUBJECTS[number]) => {
    setActiveSubject(sub);
    const start = sub === "PHYSICS" ? 1 : sub === "CHEMISTRY" ? 11 : 21;
    setCurrentQ(start);
  };

  const updateStatus = (id: number, status: Status) => {
    setStatuses((p) => ({ ...p, [id]: status }));
  };

  const handleSaveNext = () => {
    if (selected !== null) {
      setAnswers((p) => ({ ...p, [currentQ]: selected }));
      const wasMarked = statuses[currentQ] === "marked" || statuses[currentQ] === "answered-marked";
      updateStatus(currentQ, wasMarked ? "answered-marked" : "answered");
    } else {
      updateStatus(currentQ, "not-answered");
    }
    if (currentQ < 30) setCurrentQ(currentQ + 1);
  };

  const handleMarkNext = () => {
    if (selected !== null) {
      setAnswers((p) => ({ ...p, [currentQ]: selected }));
      updateStatus(currentQ, "answered-marked");
    } else {
      updateStatus(currentQ, "marked");
    }
    if (currentQ < 30) setCurrentQ(currentQ + 1);
  };

  const handleClear = () => {
    setSelected(null);
    setAnswers((p) => {
      const n = { ...p };
      delete n[currentQ];
      return n;
    });
    updateStatus(currentQ, "not-answered");
  };

  // Switch active subject pill when question changes
  useEffect(() => {
    const sub = QUESTIONS.find((q) => q.id === currentQ)?.subject;
    if (sub && sub !== activeSubject) setActiveSubject(sub);
  }, [currentQ, activeSubject]);

  const stats = useMemo(() => {
    let notVisited = 0, notAnswered = 0, answered = 0, marked = 0, ansMarked = 0;
    for (let i = 1; i <= 30; i++) {
      const s = statuses[i];
      if (s === "not-visited") notVisited++;
      else if (s === "not-answered") notAnswered++;
      else if (s === "answered") answered++;
      else if (s === "marked") marked++;
      else if (s === "answered-marked") ansMarked++;
    }
    return { notVisited, notAnswered, answered, marked, ansMarked };
  }, [statuses]);

  if (submitted) {
    return <ResultScreen answers={answers} statuses={statuses} timeUsed={20 * 60 - timeLeft} />;
  }

  const palette = SUBJECTS.map((sub) => {
    const start = sub === "PHYSICS" ? 1 : sub === "CHEMISTRY" ? 11 : 21;
    return { sub, ids: Array.from({ length: 10 }, (_, i) => start + i) };
  }).find((g) => g.sub === activeSubject)!;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Top Branding */}
      <header className="flex items-center justify-between bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="https://yt3.googleusercontent.com/qdo1xrlhfa82iLMS4yqWLJtgFt4-jizxXkvR_6HuYzYIv65nN0zg3-J3YDEwRK405xh_ASSgtQ=s160-c-k-c0x00ffffff-no-rj" alt="The Apron Boy logo" className="h-12 w-12 rounded-full bg-black object-cover" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              THE APRON BOY <span className="text-orange-500">|</span> <span className="text-emerald-600">CBT Portal</span>
            </h1>
            <p className="text-xs italic text-slate-500">Excellence in Assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-200 text-2xl">👤</div>
          <div className="space-y-0.5">
            <div>Candidate Name : <span className="font-semibold text-orange-600">Dr. Shashi Kumar</span></div>
            <div>Subject Name &nbsp;: <span className="font-semibold text-orange-600">NEET Demo Mock Test</span></div>
            <div>Remaining Time : <span className={`rounded px-2 py-0.5 font-mono font-bold text-white ${timeLeft < 60 ? "bg-red-600 animate-pulse" : "bg-emerald-600"}`}>{formatTime(timeLeft)}</span></div>
          </div>
        </div>
      </header>

      {/* Sub header */}
      <div className="flex items-center justify-between bg-orange-500 px-6 py-2 text-white">
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 text-lg font-extrabold tracking-wide">NEET EXAM</span>
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => goToSubject(s)}
              className={`rounded px-4 py-2 text-sm font-bold tracking-wide transition ${
                activeSubject === s ? "bg-white text-orange-600 shadow" : "bg-sky-500 text-white hover:bg-sky-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="font-semibold">Paper Language:</span>
          <select className="rounded border border-white/40 bg-white px-3 py-1.5 text-slate-800">
            <option>English</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>

      {/* Main */}
      <div className="grid grid-cols-[1fr_360px] gap-4 p-4">
        {/* Question */}
        <div className="rounded-md bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold text-slate-900">Question {currentQ}:</h2>
            <span className="text-sm text-slate-500">{question.subject}</span>
          </div>
          <p className="mb-6 text-base leading-relaxed text-slate-800">{question.text}</p>
          <div className="space-y-3">
            {question.options.map((opt, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition ${
                  selected === i ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${currentQ}`}
                  checked={selected === i}
                  onChange={() => setSelected(i)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span className="font-semibold text-slate-600">({i + 1})</span>
                <span className="text-slate-800">{opt}</span>
              </label>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap gap-2 border-t pt-4">
            <button onClick={handleSaveNext} className="rounded bg-emerald-600 px-4 py-2 text-xs font-bold tracking-wide text-white hover:bg-emerald-700">SAVE &amp; NEXT</button>
            <button onClick={() => { handleMarkNext(); }} className="rounded bg-orange-500 px-4 py-2 text-xs font-bold tracking-wide text-white hover:bg-orange-600">SAVE &amp; MARK FOR REVIEW</button>
            <button onClick={handleClear} className="rounded border border-slate-300 bg-white px-4 py-2 text-xs font-bold tracking-wide text-slate-700 hover:bg-slate-100">CLEAR RESPONSE</button>
            <button onClick={handleMarkNext} className="rounded bg-indigo-600 px-4 py-2 text-xs font-bold tracking-wide text-white hover:bg-indigo-700">MARK FOR REVIEW &amp; NEXT</button>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => currentQ > 1 && setCurrentQ(currentQ - 1)} className="rounded border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">&lt;&lt; BACK</button>
              <button onClick={() => currentQ < 30 && setCurrentQ(currentQ + 1)} className="rounded border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">NEXT &gt;&gt;</button>
            </div>
            <button onClick={() => setSubmitted(true)} className="rounded bg-emerald-600 px-6 py-2 text-sm font-bold text-white shadow hover:bg-emerald-700">SUBMIT</button>
          </div>
        </div>

        {/* Palette */}
        <aside className="rounded-md bg-white p-4 shadow-sm">
          <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
            <Legend color="bg-slate-300 text-slate-800" count={stats.notVisited} label="Not Visited" />
            <Legend color="bg-red-500 text-white" count={stats.notAnswered} label="Not Answered" />
            <Legend color="bg-emerald-500 text-white" count={stats.answered} label="Answered" />
            <Legend color="bg-purple-600 text-white" count={stats.marked} label="Marked for Review" />
            <div className="col-span-2 flex items-center gap-2">
              <span className="relative flex h-7 w-7 items-center justify-center rounded bg-purple-600 text-xs font-bold text-white">
                {stats.ansMarked}
                <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
              </span>
              <span className="text-slate-700">Answered &amp; Marked for Review (will be considered for evaluation)</span>
            </div>
          </div>

          <div className="mb-2 rounded bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
            {activeSubject} — Q{palette.ids[0]}–{palette.ids[palette.ids.length - 1]}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {palette.ids.map((id) => (
              <PaletteBtn key={id} id={id} status={statuses[id]} active={id === currentQ} onClick={() => setCurrentQ(id)} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Legend({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${color}`}>{count}</span>
      <span className="text-slate-700">{label}</span>
    </div>
  );
}

function PaletteBtn({ id, status, active, onClick }: { id: number; status: Status; active: boolean; onClick: () => void }) {
  let cls = "bg-slate-200 text-slate-800";
  let dot = false;
  if (status === "not-answered") cls = "bg-red-500 text-white";
  else if (status === "answered") cls = "bg-emerald-500 text-white";
  else if (status === "marked") cls = "bg-purple-600 text-white";
  else if (status === "answered-marked") { cls = "bg-purple-600 text-white"; dot = true; }

  return (
    <button
      onClick={onClick}
      className={`relative h-10 rounded text-sm font-bold transition ${cls} ${active ? "ring-2 ring-offset-2 ring-orange-500" : ""} hover:opacity-90`}
    >
      {String(id).padStart(2, "0")}
      {dot && <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />}
    </button>
  );
}

function ResultScreen({ answers, statuses, timeUsed }: { answers: Record<number, number>; statuses: Record<number, Status>; timeUsed: number }) {
  let correct = 0, incorrect = 0, attempted = 0, unanswered = 0;
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a === undefined) { unanswered++; continue; }
    attempted++;
    if (a === q.correct) correct++; else incorrect++;
  }
  const score = correct * 4 - incorrect * 1;
  const maxScore = 30 * 4;
  const pct = Math.max(0, Math.round((score / maxScore) * 100));

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-center gap-3 text-center">
          <img src="/logo.png" alt="The Apron Boy logo" className="h-14 w-14 rounded-full bg-black object-cover" />
          <div className="text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Exam Summary Report</h1>
            <p className="text-xs text-slate-500">Dr. Shashi Kumar · NEET Demo Mock Test · The Apron Boy CBT</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Score hero */}
          <div className="mb-8 grid grid-cols-1 items-center gap-6 rounded-xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-[auto_1fr]">
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white ring-4 ring-emerald-500">
              <span className="text-4xl font-black text-emerald-600">{score}</span>
              <span className="text-xs text-slate-500">/ {maxScore}</span>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-orange-600">Total Score</div>
              <div className="text-2xl font-bold text-slate-900">{pct}% Performance</div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-200">
                <div className="h-full bg-gradient-to-r from-orange-500 to-emerald-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">Scoring: +4 for correct · -1 for incorrect · 0 for unattempted</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Correct" value={correct} accent="text-emerald-600" />
            <StatCard label="Incorrect" value={incorrect} accent="text-red-600" />
            <StatCard label="Attempted" value={attempted} accent="text-sky-600" />
            <StatCard label="Unanswered" value={unanswered} accent="text-amber-600" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard label="Total Questions" value={30} />
            <StatCard label="Time Used" value={formatTime(timeUsed)} />
            <StatCard label="Marked for Review" value={Object.values(statuses).filter(s => s === "marked" || s === "answered-marked").length} />
          </div>

          {/* CTA dual buttons */}
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href="tel:+919175013816"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372a1.5 1.5 0 0 0-1.149-1.459l-4.423-1.106a1.5 1.5 0 0 0-1.547.555l-.97 1.293a11.25 11.25 0 0 1-5.516-5.516l1.293-.97a1.5 1.5 0 0 0 .555-1.547L8.637 5.4A1.5 1.5 0 0 0 7.18 4.25H5.808A2.25 2.25 0 0 0 3.558 6.5"/></svg>
              Contact Developer
            </a>
            <a
              href="https://wa.me/9175013816"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1ebe5d]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.555-5.338 11.89-11.893 11.89a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.521.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              Talk on WhatsApp
            </a>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded-lg border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ↺ Retake Test
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "text-slate-900" }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${accent}`}>{value}</div>
    </div>
  );
}

