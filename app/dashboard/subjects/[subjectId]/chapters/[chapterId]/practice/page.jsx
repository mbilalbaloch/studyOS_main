'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, CheckSquare, Edit3, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Trophy, AlertCircle, Loader2, Check, RefreshCw } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function PracticePage({ params }) {
  const unwrappedParams = use(params);
  const { subjectId, chapterId } = unwrappedParams;

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // View state: 'setup' | 'loading' | 'session' | 'complete'
  const [viewState, setViewState] = useState('setup');
  
  // Setup state
  const [instruction, setInstruction] = useState('');
  const [practiceType, setPracticeType] = useState('mcq');
  const [errorMessage, setErrorMessage] = useState('');

  // Session state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [sessionResults, setSessionResults] = useState(null);

  const handleStartPractice = async () => {
    if (!instruction.trim()) {
      setErrorMessage('Please enter what you want to practice.');
      return;
    }

    setErrorMessage('');
    setViewState('loading');

    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          chapterId,
          chapterName: 'Chapter Hub',
          prompt: instruction,
          practiceType
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate practice session.');
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions were returned by the AI.');
      }

      setQuestions(data.questions);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setViewState('session');
    } catch (err) {
      console.error('Generation error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setViewState('setup');
    }
  };

  const currentQuestion = questions[currentIndex];
  const selectedOptionIndex = selectedAnswers[currentIndex];

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await handleCompleteSession();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCompleteSession = async () => {
    setIsSaving(true);
    let correctCount = 0;
    let incorrectCount = 0;
    let attemptedCount = 0;

    const attemptsData = questions.map((q, idx) => {
      const selectedIdx = selectedAnswers[idx];
      const isAttempted = selectedIdx !== undefined;
      const isCorrect = isAttempted && selectedIdx === q.correctAnswer;

      if (isAttempted) {
        attemptedCount++;
        if (isCorrect) correctCount++;
        else incorrectCount++;
      }

      return {
        question: q.question,
        topic: q.topic || 'General Concepts',
        options: q.options,
        correct_answer: q.correctAnswer,
        selected_answer: isAttempted ? selectedIdx : null,
        is_correct: isCorrect,
        explanation: q.explanation || ''
      };
    });

    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    // Group performance by topic/concept for analytics
    const conceptMap = {};
    attemptsData.forEach(att => {
      const topic = att.topic;
      if (!conceptMap[topic]) {
        conceptMap[topic] = { total: 0, correct: 0 };
      }
      conceptMap[topic].total += 1;
      if (att.is_correct) {
        conceptMap[topic].correct += 1;
      }
    });

    const strongAreas = [];
    const needsPractice = [];

    Object.entries(conceptMap).forEach(([topic, stats]) => {
      const percentage = Math.round((stats.correct / stats.total) * 100);
      if (stats.total >= 1 && percentage >= 70) {
        strongAreas.push({ topic, percentage, ...stats });
      } else {
        needsPractice.push({ topic, percentage, ...stats });
      }
    });

    const resultsSummary = {
      total: questions.length,
      attempted: attemptedCount,
      correct: correctCount,
      incorrect: incorrectCount,
      accuracy,
      strongAreas,
      needsPractice
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 1. Insert Practice Session summary matching updated full schema
      const { data: sessionRecord, error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: user.id,
          chapter_id: chapterId,
          practice_type: practiceType,
          student_prompt: instruction,
          total_questions: questions.length,
          attempted_questions: attemptedCount,
          correct_answers: correctCount,
          incorrect_answers: incorrectCount,
          correct_count: correctCount,
          wrong_count: incorrectCount,
          accuracy: accuracy
        })
        .select()
        .single();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      // 2. Insert individual question attempts into practice_questions table
      if (sessionRecord) {
        const attemptsToInsert = attemptsData.map(att => ({
          session_id: sessionRecord.id,
          user_id: user.id,
          chapter_id: chapterId,
          question: att.question,
          question_type: practiceType,
          topic: att.topic,
          options: att.options,
          correct_answer: att.correct_answer,
          selected_answer: att.selected_answer,
          is_correct: att.is_correct,
          explanation: att.explanation
        }));

        const { error: attemptError } = await supabase.from('practice_questions').insert(attemptsToInsert);
        if (attemptError) {
          console.error('Error saving question attempts:', attemptError);
          throw new Error(attemptError.message);
        }
      }

      setSessionResults(resultsSummary);
      setViewState('complete');
    } catch (dbErr) {
      console.error('Error saving practice session to database:', dbErr);
      setErrorMessage('Failed to save your session to Supabase. Please check your connection.');
      setViewState('session');
    } finally {
      setIsSaving(false);
    }
  };

  // --- LOADING VIEW ---
  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans px-6">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8 max-w-md w-full text-center flex flex-col items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-inner">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-semibold text-zinc-100">Generating your practice...</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              StudyOS is creating questions based on your instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- PRACTICE SETUP VIEW ---
  if (viewState === 'setup') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/subjects/${subjectId}/chapters/${chapterId}`}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition flex items-center justify-center"
              title="Back to Chapter Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Chapter Practice
              </div>
              <h1 className="text-lg font-semibold text-zinc-100">Practice Setup</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-zinc-100">What do you want to practice?</h2>
            <p className="text-xs text-zinc-400">
              Type your study instruction below. Gemini will generate custom questions tailored to your goal.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Example: Give me 10 conceptual questions about functions at class 10 level..."
              rows={4}
              className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition resize-none shadow-sm leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Practice Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPracticeType('ai')}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                  practiceType === 'ai'
                    ? "bg-zinc-800/80 border-zinc-600 text-zinc-100 shadow-sm"
                    : "bg-zinc-900/40 hover:bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-sm text-zinc-200">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI Questions</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Custom AI generated practice questions.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPracticeType('mcq')}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                  practiceType === 'mcq'
                    ? "bg-zinc-800/80 border-zinc-600 text-zinc-100 shadow-sm"
                    : "bg-zinc-900/40 hover:bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-sm text-zinc-200">
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                  <span>MCQs</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Standard multiple-choice question format.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPracticeType('written')}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                  practiceType === 'written'
                    ? "bg-zinc-800/80 border-zinc-600 text-zinc-100 shadow-sm"
                    : "bg-zinc-900/40 hover:bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-sm text-zinc-200">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Written Questions</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Concept questions requiring structured responses.
                </p>
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStartPractice}
              className="bg-zinc-100 hover:bg-white text-zinc-950 px-6 py-2.5 rounded-xl text-xs font-medium transition shadow-sm inline-flex items-center gap-2"
            >
              <span>Start Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --- PRACTICE SESSION VIEW ---
  if (viewState === 'session') {
    const alphabetLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewState('setup')}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition flex items-center justify-center"
              title="Back to Setup"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Practice Session
              </div>
              <h1 className="text-lg font-semibold text-zinc-100">Interactive Quiz</h1>
            </div>
          </div>

          <div className="text-xs text-zinc-400 font-medium">
            Question <span className="text-zinc-200">{currentIndex + 1}</span> of {questions.length}
          </div>
        </header>

        <div className="w-full bg-zinc-900 h-1">
          <div
            className="bg-zinc-100 h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
          {errorMessage && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Question {currentIndex + 1}
                </span>
                {currentQuestion?.topic && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {currentQuestion.topic}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-medium text-zinc-100 leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {currentQuestion.options.map((optionText, optIdx) => {
                const isSelected = selectedOptionIndex === optIdx;
                const optLabel = alphabetLabels[optIdx] || String(optIdx + 1);

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                      isSelected
                        ? "bg-zinc-800/80 border-zinc-600 text-zinc-100 shadow-sm"
                        : "bg-zinc-950/40 hover:bg-zinc-900/60 border-zinc-800/80 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                          : "border-zinc-700 text-zinc-400 group-hover:border-zinc-600"
                      }`}>
                        {optLabel}
                      </div>
                      <span className="text-sm">{optionText}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-zinc-100 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-zinc-800/60 mt-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm disabled:opacity-50"
              >
                <span>{currentIndex === questions.length - 1 ? (isSaving ? "Saving Session..." : "Finish Practice") : "Next"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- COMPLETION & ANALYSIS VIEW ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Practice Complete
            </div>
            <h1 className="text-lg font-semibold text-zinc-100">Session Analysis</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-inner">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Practice Summary</h2>
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">{practiceType.toUpperCase()} Practice</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-emerald-400">{sessionResults?.accuracy}%</span>
              <p className="text-[10px] text-zinc-500 uppercase font-medium">Accuracy</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-medium">Total Questions</span>
              <span className="text-lg font-semibold text-zinc-100">{sessionResults?.total}</span>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-medium">Correct</span>
              <span className="text-lg font-semibold text-emerald-400">{sessionResults?.correct}</span>
            </div>
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-medium">Incorrect</span>
              <span className="text-lg font-semibold text-red-400">{sessionResults?.incorrect}</span>
            </div>
          </div>

          <hr className="border-zinc-800/80" />

          {/* Strong Areas */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Strong Areas</h3>
            {sessionResults?.strongAreas && sessionResults.strongAreas.length > 0 ? (
              <div className="flex flex-col gap-2">
                {sessionResults.strongAreas.map((item, idx) => (
                  <div key={idx} className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-medium flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      {item.topic}
                    </span>
                    <span className="text-emerald-400 font-medium">{item.percentage}% ({item.correct}/{item.total})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No strong area classifications yet. Keep practicing!</p>
            )}
          </div>

          {/* Needs Practice */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Needs Practice</h3>
            {sessionResults?.needsPractice && sessionResults.needsPractice.length > 0 ? (
              <div className="flex flex-col gap-2">
                {sessionResults.needsPractice.map((item, idx) => (
                  <div key={idx} className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl px-4 py-3 flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {item.topic}
                    </span>
                    <span className="text-amber-400 font-medium">{item.percentage}% ({item.correct}/{item.total})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No weak concepts identified in this session. Excellent work!</p>
            )}
          </div>

          <div className="pt-2 flex gap-3 w-full">
            <button
              onClick={() => {
                setInstruction('');
                setViewState('setup');
              }}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 py-2.5 rounded-xl text-xs font-medium transition text-center flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </button>
            <Link
              href={`/dashboard/subjects/${subjectId}/chapters/${chapterId}`}
              className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 py-2.5 rounded-xl text-xs font-medium transition text-center shadow-sm flex items-center justify-center"
            >
              Back to Chapter
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}