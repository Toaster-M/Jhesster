import { useState } from 'react';
import { Chess } from 'chess.js';
import Board from '../components/Board/Board';
import { LESSONS, LESSON_CATEGORIES } from '../data/lessons';
import type { Lesson, LessonCategory } from '../data/lessons';
import { OPENINGS } from '../data/openings';
import OpeningExplorer from './OpeningExplorer';

// ── Lesson completion persistence ────────────────────────────────────────────
// Completed lesson IDs are stored as a JSON array in localStorage so progress
// survives page reloads without needing a backend.

const STORAGE_KEY = 'jhesster_lessons_complete';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

// ── Step-through lesson reader ────────────────────────────────────────────────
// Full-screen view that walks through a lesson's steps one at a time,
// showing an optional board diagram and text content for each step.

function LessonReader({ lesson, onBack, onComplete }: { lesson: Lesson; onBack: () => void; onComplete: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);

  const step       = lesson.steps[stepIndex];
  const isFirst    = stepIndex === 0;
  const isLast     = stepIndex === lesson.steps.length - 1;

  const boardFen   = step.fen ?? null;
  const board      = boardFen ? new Chess(boardFen).board() : null;

  const highlightMove = step.move
    ? { from: step.move.slice(0, 2) as any, to: step.move.slice(2, 4) as any }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a] screen-slide-in">
      <header className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none">♟</span>
          <h1 className="text-base font-bold text-white leading-tight">
            {lesson.title}
          </h1>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
        >
          ← Lessons
        </button>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
          {/* Board */}
          <div className="flex flex-col gap-3 items-center">
            {board ? (
              <Board
                board={board as any}
                selectedSquare={null}
                legalMoves={[]}
                lastMove={highlightMove}
                onSquareClick={() => {}}
                onPromote={() => {}}
                isFlipped={false}
              />
            ) : (
              <div className="w-[min(80vw,480px)] aspect-square bg-white/4 rounded-2xl border border-white/10 flex items-center justify-center">
                <span className="text-7xl select-none opacity-20">♟</span>
              </div>
            )}

            {/* Step navigation */}
            <div className="flex gap-2 w-full max-w-[min(80vw,480px)]">
              <button
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                disabled={isFirst}
                className="flex-1 py-2 rounded-lg bg-white/6 hover:bg-white/12 disabled:opacity-30 text-gray-300 text-sm font-semibold transition-all border border-white/10"
              >
                ← Previous
              </button>
              {!isLast ? (
                <button
                  onClick={() => setStepIndex((i) => i + 1)}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all"
                >
                  Complete ✓
                </button>
              )}
            </div>
            <p className="text-xs text-gray-600">
              Step {stepIndex + 1} / {lesson.steps.length}
            </p>
          </div>

          {/* Text content */}
          <div className="flex flex-col gap-5 flex-1">
            <div className="bg-white/4 border border-white/10 rounded-2xl p-6">
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{step.text}</p>
            </div>

            {/* Takeaways — always visible */}
            {lesson.takeaways.length > 0 && (
              <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-5">
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-3">Key Takeaways</p>
                <ul className="flex flex-col gap-2">
                  {lesson.takeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step dots */}
            <div className="flex gap-1.5 flex-wrap">
              {lesson.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStepIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === stepIndex ? 'bg-white scale-110' : i < stepIndex ? 'bg-emerald-500/60' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lesson card ───────────────────────────────────────────────────────────────
// Summary tile shown in the lesson grid; displays category icon, title,
// summary text, and a completion badge when the lesson is done.

function LessonCard({ lesson, completed, onClick }: { lesson: Lesson; completed: boolean; onClick: () => void }) {
  const cat = LESSON_CATEGORIES[lesson.category];
  return (
    <button
      onClick={onClick}
      className="bg-white/4 border border-white/10 hover:border-white/20 hover:bg-white/6 rounded-2xl p-5 text-left transition-all group flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg select-none">{cat.icon}</span>
        {completed && (
          <span className="text-xs px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
            ✓ Done
          </span>
        )}
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-white/90">{lesson.title}</h3>
        <p className="text-gray-500 text-xs line-clamp-2">{lesson.summary}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="px-2 py-0.5 rounded border bg-white/5 border-white/10">{cat.label}</span>
        <span>{lesson.readTime} min</span>
        <span>{lesson.steps.length} steps</span>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
// Top-level Learning Center screen with Lessons and Openings tabs.
// Manages which lesson (or the Opening Explorer) is currently active.

interface LearningCenterProps {
  onBack: () => void;
}

type MainView = 'lessons' | 'openings';

export default function LearningCenter({ onBack }: LearningCenterProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [mainView,       setMainView]       = useState<MainView>('lessons');
  const [activeLesson,   setActiveLesson]   = useState<Lesson | null>(null);
  const [completed,      setCompleted]      = useState<Set<string>>(loadCompleted);
  const [activeCategory, setActiveCategory] = useState<LessonCategory | null>(null);
  const [showExplorer,   setShowExplorer]   = useState(false);

  const filtered = activeCategory
    ? LESSONS.filter((l) => l.category === activeCategory)
    : LESSONS;

  const handleComplete = (lesson: Lesson) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(lesson.id);
      saveCompleted(next);
      return next;
    });
    setActiveLesson(null);
  };

  // ── Route to leaf views (lesson reader or opening explorer) ──────────────

  if (activeLesson) {
    return (
      <LessonReader
        lesson={activeLesson}
        onBack={() => setActiveLesson(null)}
        onComplete={() => handleComplete(activeLesson)}
      />
    );
  }

  if (showExplorer) {
    return (
      <OpeningExplorer
        openings={OPENINGS}
        onBack={() => setShowExplorer(false)}
      />
    );
  }

  // ── Main page ─────────────────────────────────────────────────────────────

  const completedCount = LESSONS.filter((l) => completed.has(l.id)).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a] screen-slide-in">
      <header className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl select-none">♟</span>
          <h1 className="text-base font-bold text-white">Learning Center</h1>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-2 min-h-11 text-sm rounded-lg bg-white/8 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
        >
          ← Menu
        </button>
      </header>

      <div className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          {/* Top-level tabs */}
          <div className="flex gap-1 bg-white/4 border border-white/10 rounded-xl p-1 self-start">
            {(['lessons', 'openings'] as MainView[]).map((view) => (
              <button
                key={view}
                onClick={() => setMainView(view)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                  mainView === view
                    ? 'bg-white text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {view === 'lessons' ? '📖 Lessons' : '🌐 Openings'}
              </button>
            ))}
          </div>

          {/* ── Lessons tab ── */}
          {mainView === 'lessons' && (
            <>
              {/* Progress bar */}
              <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-semibold text-sm">Your progress</p>
                  <p className="text-xs text-gray-400">{completedCount} / {LESSONS.length} lessons</p>
                </div>
                <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(completedCount / LESSONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeCategory === null
                      ? 'bg-white text-gray-900 border-transparent'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                {(Object.entries(LESSON_CATEGORIES) as [LessonCategory, { label: string; icon: string }][]).map(
                  ([key, { label, icon }]) => (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        activeCategory === key
                          ? 'bg-white text-gray-900 border-transparent'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span>{icon}</span>
                      {label}
                    </button>
                  )
                )}
              </div>

              {/* Lesson grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    completed={completed.has(lesson.id)}
                    onClick={() => setActiveLesson(lesson)}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Openings tab ── */}
          {mainView === 'openings' && (
            <>
              {/* Intro card + Explorer CTA */}
              <div className="bg-white/4 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">Opening Explorer</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Interactive tree navigator — explore positions, variations, and key ideas for 7 major openings.
                    Board adjusts perspective to match which side you're learning.
                  </p>
                </div>
                <button
                  onClick={() => setShowExplorer(true)}
                  className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all active:scale-95"
                >
                  Open Explorer →
                </button>
              </div>

              {/* Quick-access opening cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {OPENINGS.map((opening) => {
                  const diffLabel = ['', 'Beginner', 'Intermediate', 'Advanced'][opening.difficulty];
                  const diffColor = ['', 'text-emerald-400', 'text-yellow-400', 'text-orange-400'][opening.difficulty];
                  const varCount  = (opening.root.variations?.length ?? 0);

                  return (
                    <button
                      key={opening.id}
                      onClick={() => setShowExplorer(true)}
                      className="bg-white/4 border border-white/10 hover:border-white/22 hover:bg-white/6 rounded-2xl p-5 text-left transition-all group flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded border font-mono ${
                            opening.color === 'white'
                              ? 'bg-white/10 border-white/20 text-gray-300'
                              : 'bg-black/40 border-white/10 text-gray-400'
                          }`}>
                            {opening.color === 'white' ? '♔ White' : '♚ Black'}
                          </span>
                          <span className="text-xs text-gray-600 font-mono">{opening.eco}</span>
                        </div>
                        <span className={`text-xs font-semibold shrink-0 ${diffColor}`}>
                          {diffLabel}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1">{opening.title}</h3>
                        <p className="text-gray-500 text-xs leading-snug line-clamp-2">{opening.summary}</p>
                      </div>
                      <p className="text-xs text-gray-600">
                        {varCount} main branch{varCount !== 1 ? 'es' : ''} · multiple sub-variations
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
