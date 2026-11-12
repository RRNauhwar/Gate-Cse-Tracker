import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Check,
  AlertTriangle,
  Send,
  Eye,
  Plus
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { TestSeries, Question, TestAttempt, TestAttemptAnswer } from '../types';
import { MathRenderer } from '../components/common/MathRenderer';
import { Modal } from '../components/common/Modal';

export const TestsView: React.FC = () => {
  const { testSeries, testAttempts, saveTestAttempt, addMistake } = useAppState();

  // Active testing state
  const [activeTest, setActiveTest] = useState<TestSeries | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, {
    selectedOptions?: string[];
    natValue?: number;
    status: 'answered' | 'marked_review' | 'skipped';
  }>>({});

  // Question palette visit tracking
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({});

  // Countdown timer for test
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Modals & Review
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<TestAttempt | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Time tracking per question
  const questionStartTimeRef = useRef<number>(Date.now());
  const questionTimesRef = useRef<Record<string, number>>({});
  const isSubmittingRef = useRef<boolean>(false);

  // Start a test
  const startTest = (test: TestSeries) => {
    isSubmittingRef.current = false;
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setVisitedQuestions({ [test.questions[0].id]: true });
    setRemainingSeconds(test.durationMinutes * 60);
    setCompletedAttempt(null);
    setIsReviewing(false);
    questionStartTimeRef.current = Date.now();
    questionTimesRef.current = {};
  };

  // Timer countdown
  useEffect(() => {
    if (!activeTest || isReviewing) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeTest, isReviewing]);

  const currentQuestion: Question | undefined = activeTest?.questions[currentQuestionIndex];

  // Record time spent when switching questions
  const recordQuestionTime = () => {
    if (!currentQuestion) return;
    const now = Date.now();
    const elapsed = Math.round((now - questionStartTimeRef.current) / 1000);
    questionTimesRef.current[currentQuestion.id] = (questionTimesRef.current[currentQuestion.id] || 0) + elapsed;
    questionStartTimeRef.current = now;
  };

  const handleSelectQuestion = (idx: number) => {
    recordQuestionTime();
    setCurrentQuestionIndex(idx);
    if (activeTest) {
      setVisitedQuestions(prev => ({ ...prev, [activeTest.questions[idx].id]: true }));
    }
  };

  // Handle MCQ Option Selection
  const handleSelectMCQ = (optionId: string) => {
    if (!currentQuestion || isReviewing) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOptions: [optionId],
        status: 'answered'
      }
    }));
  };

  // Handle MSQ Option Toggle
  const handleToggleMSQ = (optionId: string) => {
    if (!currentQuestion || isReviewing) return;
    const existing = userAnswers[currentQuestion.id]?.selectedOptions || [];
    const next = existing.includes(optionId)
      ? existing.filter(id => id !== optionId)
      : [...existing, optionId];

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOptions: next,
        status: next.length > 0 ? 'answered' : 'skipped'
      }
    }));
  };

  // Handle NAT input change
  const handleNATChange = (val: string) => {
    if (!currentQuestion || isReviewing) return;
    const num = parseFloat(val);
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        natValue: isNaN(num) ? undefined : num,
        status: isNaN(num) ? 'skipped' : 'answered'
      }
    }));
  };

  // Clear Response
  const handleClearResponse = () => {
    if (!currentQuestion || isReviewing) return;
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  // Mark for Review & Next
  const handleMarkForReview = () => {
    if (!currentQuestion || isReviewing) return;
    const current = userAnswers[currentQuestion.id];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selectedOptions: current?.selectedOptions,
        natValue: current?.natValue,
        status: 'marked_review'
      }
    }));

    if (currentQuestionIndex < (activeTest?.questions.length || 0) - 1) {
      handleSelectQuestion(currentQuestionIndex + 1);
    }
  };

  // Submit test and evaluate scores
  const handleSubmitTest = () => {
    if (isSubmittingRef.current || !activeTest) return;
    isSubmittingRef.current = true;

    try {
      recordQuestionTime();

    let totalScore = 0;
    let correctCount = 0;
    let attemptedCount = 0;
    const evaluatedAnswers: Record<string, TestAttemptAnswer> = {};

    for (const q of activeTest.questions) {
      const ans = userAnswers[q.id];
      const timeSpent = questionTimesRef.current[q.id] || 0;

      if (!ans || (!ans.selectedOptions?.length && ans.natValue === undefined)) {
        evaluatedAnswers[q.id] = {
          isCorrect: false,
          marksAwarded: 0,
          status: 'skipped',
          timeSpentSeconds: timeSpent
        };
        continue;
      }

      attemptedCount++;
      let isCorrect = false;

      if (q.type === 'MCQ') {
        const chosen = ans.selectedOptions?.[0];
        isCorrect = chosen === q.correctOptions?.[0];
      } else if (q.type === 'MSQ') {
        const chosen = (ans.selectedOptions || []).slice().sort();
        const correct = (q.correctOptions || []).slice().sort();
        isCorrect = chosen.length === correct.length && chosen.every((v, i) => v === correct[i]);
      } else if (q.type === 'NAT') {
        if (ans.natValue !== undefined && q.natRange) {
          isCorrect = ans.natValue >= q.natRange.min && ans.natValue <= q.natRange.max;
        }
      }

      let awarded = 0;
      if (isCorrect) {
        awarded = q.marks;
        correctCount++;
      } else {
        awarded = -q.negativeMarks;
      }

      totalScore += awarded;

      evaluatedAnswers[q.id] = {
        selectedOptions: ans.selectedOptions,
        natValue: ans.natValue,
        isCorrect,
        marksAwarded: parseFloat(awarded.toFixed(2)),
        status: ans.status,
        timeSpentSeconds: timeSpent
      };
    }

    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const finalScore = Math.max(0, parseFloat(totalScore.toFixed(2)));

    const attempt: TestAttempt = {
      id: `attempt-${Date.now()}`,
      testId: activeTest.id,
      testTitle: activeTest.title,
      startedAt: new Date(Date.now() - (activeTest.durationMinutes * 60 - remainingSeconds) * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      score: finalScore,
      maxScore: activeTest.totalMarks,
      accuracy,
      answers: evaluatedAnswers
    };

    saveTestAttempt(attempt);
    setCompletedAttempt(attempt);
    setIsReviewing(true);
    setShowSubmitModal(false);
  } finally {
    isSubmittingRef.current = false;
  }
};

  const handleTransferToMistakes = (q: Question, myAnsText: string, correctAnsText: string) => {
    addMistake({
      questionText: q.questionText,
      subjectId: q.subjectId,
      subjectName: q.subjectName,
      topicName: q.topic,
      myAnswer: myAnsText,
      correctAnswer: correctAnsText,
      explanation: q.explanation,
      category: 'Conceptual Gap',
      resolved: false
    });
    alert('Question added to your Mistake Book!');
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // Test Taking Mode View
  // -------------------------------------------------------------
  if (activeTest) {
    const answeredCount = Object.values(userAnswers).filter(a => a.status === 'answered').length;
    const markedCount = Object.values(userAnswers).filter(a => a.status === 'marked_review').length;

    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* CBT Exam Top Bar */}
        <div className="p-4 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
              {isReviewing ? 'Solution & Diagnostic Review' : 'Official CBT Exam Mode'}
            </span>
            <h1 className="text-base font-bold text-white">{activeTest.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {!isReviewing && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm">
                <Clock size={16} className={remainingSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-blue-400'} />
                <span className={`font-bold ${remainingSeconds < 300 ? 'text-rose-400' : 'text-white'}`}>
                  {formatTimer(remainingSeconds)}
                </span>
              </div>
            )}

            {isReviewing ? (
              <button
                onClick={() => setActiveTest(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
              >
                Exit to Test Hub
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition"
              >
                <Send size={14} />
                <span>Submit Exam</span>
              </button>
            )}
          </div>
        </div>

        {/* Post-Submission Scorecard Banner */}
        {isReviewing && completedAttempt && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-800/60 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Attempt Completed</p>
              <h2 className="text-xl font-extrabold text-white">
                Score: {completedAttempt.score} / {completedAttempt.maxScore} marks
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Accuracy: {completedAttempt.accuracy}% • Attempted: {Object.values(completedAttempt.answers).filter(a => a.status !== 'skipped').length}/{activeTest.questions.length} questions
              </p>
            </div>
            <button
              onClick={() => startTest(activeTest)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
            >
              <RotateCcw size={14} /> Retake Test
            </button>
          </div>
        )}

        {/* Main Split Interface: Question Workspace (Left) & Palette (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Question Workspace (3 cols) */}
          <div className="lg:col-span-3 rounded-2xl bg-[#11141c] border border-slate-800 p-6 flex flex-col justify-between min-h-[550px]">
            {currentQuestion && (
              <div>
                {/* Question Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-600 text-white">
                      Q{currentQuestionIndex + 1}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      {currentQuestion.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {currentQuestion.subjectName} • {currentQuestion.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-emerald-400">+{currentQuestion.marks} marks</span>
                    {currentQuestion.negativeMarks > 0 && (
                      <span className="text-rose-400">-{currentQuestion.negativeMarks} negative</span>
                    )}
                  </div>
                </div>

                {/* Question Statement */}
                <div className="mb-8">
                  <MathRenderer
                    content={currentQuestion.questionText}
                    className="text-base text-slate-100 font-medium leading-relaxed"
                  />
                </div>

                {/* Options / Input Field depending on Question Type */}
                {currentQuestion.type === 'MCQ' && (
                  <div className="space-y-3 max-w-2xl">
                    {currentQuestion.options?.map(opt => {
                      const isSelected = userAnswers[currentQuestion.id]?.selectedOptions?.includes(opt.id);
                      const isCorrect = currentQuestion.correctOptions?.includes(opt.id);
                      let optionClasses = 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700';

                      if (isReviewing) {
                        if (isCorrect) optionClasses = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold';
                        else if (isSelected && !isCorrect) optionClasses = 'border-rose-500 bg-rose-950/40 text-rose-300';
                      } else if (isSelected) {
                        optionClasses = 'border-blue-500 bg-blue-950/50 text-blue-200 font-semibold shadow-sm';
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectMCQ(opt.id)}
                          className={`p-3.5 rounded-xl border flex items-center gap-3.5 cursor-pointer transition ${optionClasses}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                            isSelected ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {opt.id}
                          </div>
                          <span className="text-sm">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === 'MSQ' && (
                  <div className="space-y-3 max-w-2xl">
                    <p className="text-xs text-blue-400 font-semibold mb-2">
                      (Multiple Select Question: One or more options can be correct. No negative marking.)
                    </p>
                    {currentQuestion.options?.map(opt => {
                      const isSelected = userAnswers[currentQuestion.id]?.selectedOptions?.includes(opt.id);
                      const isCorrect = currentQuestion.correctOptions?.includes(opt.id);
                      let optionClasses = 'border-slate-800 bg-slate-900/60 hover:bg-slate-900';

                      if (isReviewing) {
                        if (isCorrect) optionClasses = 'border-emerald-500 bg-emerald-950/40 text-emerald-300';
                        else if (isSelected && !isCorrect) optionClasses = 'border-rose-500 bg-rose-950/40 text-rose-300';
                      } else if (isSelected) {
                        optionClasses = 'border-blue-500 bg-blue-950/50 text-blue-200';
                      }

                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleToggleMSQ(opt.id)}
                          className={`p-3.5 rounded-xl border flex items-center gap-3.5 cursor-pointer transition ${optionClasses}`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border ${
                            isSelected ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {isSelected && <Check size={14} />}
                          </div>
                          <span className="text-sm">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === 'NAT' && (
                  <div className="max-w-md space-y-3">
                    <p className="text-xs text-blue-400 font-semibold">
                      (Numerical Answer Type: Enter an integer or decimal number.)
                    </p>
                    <input
                      type="number"
                      step="any"
                      disabled={isReviewing}
                      value={userAnswers[currentQuestion.id]?.natValue ?? ''}
                      onChange={e => handleNATChange(e.target.value)}
                      placeholder="Enter numerical answer"
                      className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-lg font-mono text-white outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Review Explanation Box */}
                {isReviewing && (
                  <div className="mt-8 p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Official Solution & Explanation
                      </span>
                      <button
                        onClick={() => {
                          const myAns = userAnswers[currentQuestion.id]?.selectedOptions?.join(', ') ||
                            String(userAnswers[currentQuestion.id]?.natValue ?? 'None');
                          const correctAns = currentQuestion.correctOptions?.join(', ') ||
                            (currentQuestion.natRange ? `${currentQuestion.natRange.min} to ${currentQuestion.natRange.max}` : '');
                          handleTransferToMistakes(currentQuestion, myAns, correctAns);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                      >
                        <Plus size={14} /> Log to Mistake Book
                      </button>
                    </div>
                    <MathRenderer content={currentQuestion.explanation} className="text-xs text-slate-300 leading-relaxed font-mono" />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Navigation Toolbar */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 mt-6">
              <div className="flex items-center gap-2">
                {!isReviewing && (
                  <>
                    <button
                      onClick={handleMarkForReview}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/70 text-purple-400 hover:bg-purple-900/60 border border-purple-800 text-xs font-semibold transition"
                    >
                      <Bookmark size={14} /> Mark for Review
                    </button>
                    <button
                      onClick={handleClearResponse}
                      className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
                    >
                      Clear Answer
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => handleSelectQuestion(currentQuestionIndex - 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 text-xs font-semibold border border-slate-800"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  disabled={currentQuestionIndex === (activeTest.questions.length - 1)}
                  onClick={() => handleSelectQuestion(currentQuestionIndex + 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 text-xs font-semibold shadow-md shadow-blue-600/20"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar (1 col) */}
          <div className="rounded-2xl bg-[#11141c] border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Question Palette</h3>

            {/* Palette Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-600 shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-purple-600 shrink-0" />
                <span>Marked ({markedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-700 shrink-0" />
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-900 border border-slate-700 shrink-0" />
                <span>Not Visited</span>
              </div>
            </div>

            {/* Palette Number Grid */}
            <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-800">
              {activeTest.questions.map((q, idx) => {
                const ans = userAnswers[q.id];
                const isVisited = visitedQuestions[q.id];
                const isCurrent = idx === currentQuestionIndex;

                let btnClass = 'bg-slate-900 border-slate-800 text-slate-500'; // Not visited

                if (isReviewing && completedAttempt) {
                  const evalAns = completedAttempt.answers[q.id];
                  if (evalAns?.isCorrect) btnClass = 'bg-emerald-600 text-white font-bold';
                  else if (evalAns?.status !== 'skipped') btnClass = 'bg-rose-600 text-white font-bold';
                  else btnClass = 'bg-slate-800 text-slate-400';
                } else if (ans?.status === 'answered') {
                  btnClass = 'bg-emerald-600 text-white font-bold';
                } else if (ans?.status === 'marked_review') {
                  btnClass = 'bg-purple-600 text-white font-bold';
                } else if (isVisited) {
                  btnClass = 'bg-rose-950/80 border-rose-800 text-rose-300 font-bold'; // Visited but not answered
                }

                if (isCurrent) {
                  btnClass += ' ring-2 ring-blue-400 ring-offset-2 ring-offset-[#11141c]';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(idx)}
                    className={`h-9 rounded-xl border text-xs flex items-center justify-center transition ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        <Modal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Confirm Exam Submission"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to finish and submit <span className="font-bold text-white">{activeTest.title}</span>?
            </p>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900 text-center text-xs">
              <div>
                <p className="text-slate-500">Answered</p>
                <p className="font-bold text-emerald-400 text-base">{answeredCount}</p>
              </div>
              <div>
                <p className="text-slate-500">Marked</p>
                <p className="font-bold text-purple-400 text-base">{markedCount}</p>
              </div>
              <div>
                <p className="text-slate-500">Unanswered</p>
                <p className="font-bold text-rose-400 text-base">
                  {activeTest.questions.length - answeredCount - markedCount}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Back to Test
              </button>
              <button
                onClick={handleSubmitTest}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Test Hub / List Mode
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-blue-500" size={24} />
            <span>Mock Tests & CBT Practice Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate real GATE Computer Science exams with official marking rules, question palettes, and instant evaluations.
          </p>
        </div>
      </div>

      {/* Available Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testSeries.map(test => (
          <div
            key={test.id}
            className="p-6 rounded-2xl bg-[#11141c] border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  {test.subjectName}
                </span>
                <span className="text-xs text-slate-400">
                  {test.questions.length} Questions • {test.durationMinutes} Mins
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{test.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{test.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Total Marks: <span className="text-white font-bold">{test.totalMarks}</span>
              </span>
              <button
                onClick={() => startTest(test)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition"
              >
                <Play size={14} /> Start CBT Exam
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Past Attempt History */}
      <div className="p-6 rounded-2xl bg-[#11141c] border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4">Past Mock Test Attempts</h3>
        {testAttempts.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No tests attempted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Test Title</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Accuracy</th>
                  <th className="pb-3 text-right">Attempt Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {testAttempts.map(att => (
                  <tr key={att.id} className="text-xs hover:bg-slate-900/40 transition">
                    <td className="py-3 font-medium text-white">{att.testTitle}</td>
                    <td className="py-3 font-mono font-bold text-blue-400">
                      {att.score} / {att.maxScore}
                    </td>
                    <td className="py-3 font-mono font-semibold text-emerald-400">
                      {att.accuracy}%
                    </td>
                    <td className="py-3 text-slate-500 text-right">
                      {new Date(att.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
