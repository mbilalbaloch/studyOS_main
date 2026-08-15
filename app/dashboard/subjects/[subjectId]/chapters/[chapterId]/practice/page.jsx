'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, CheckSquare, Edit3, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Trophy, AlertCircle, Loader2, Check, RefreshCw, Bookmark, Trash2, BookOpen, Plus, X } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function PracticePage({ params }) {
  const unwrappedParams = use(params);
  const { subjectId, chapterId } = unwrappedParams;

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Main navigation tab on setup view: 'ai-generator' | 'saved-mcqs'
  const [activeTab, setActiveTab] = useState('ai-generator');

  // View state: 'setup' | 'loading' | 'session' | 'complete'
  const [viewState, setViewState] = useState('setup');

  // Setup state
  const [instruction, setInstruction] = useState('');
  const [practiceType, setPracticeType] = useState('mcq');
  const [errorMessage, setErrorMessage] = useState('');

  // Saved MCQs state
  const [savedMcqs, setSavedMcqs] = useState([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [savedActionMessage, setSavedActionMessage] = useState('');

  // Modal State for adding custom MCQ manually (No correct answer required)
  const [showAddModal, setShowAddModal] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customOptions, setCustomOptions] = useState(['', '', '', '']);
  const [customTopic, setCustomTopic] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Session state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [sessionResults, setSessionResults] = useState(null);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [showMistakesView, setShowMistakesView] = useState(false);

  // Fetch saved MCQs when switching to that tab
  useEffect(() => {
    if (activeTab === 'saved-mcqs') {
      fetchSavedMcqs();
    }
  }, [activeTab]);

  const fetchSavedMcqs = async () => {
    setIsLoadingSaved(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_mcqs')
        .select('*')
        .eq('user_id', user.id)
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedMcqs(data || []);
    } catch (err) {
      console.error('Error fetching saved MCQs:', err);
      setErrorMessage('Failed to load saved MCQs.');
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleDeleteSavedMcq = async (id, e) => {
    e.stopPropagation();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_mcqs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Security check

      if (error) throw error;
      setSavedMcqs(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting saved MCQ:', err);
    }
  };

  const handleSaveMcq = async (qItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSavedActionMessage('You must be logged in to save MCQs.');
        return;
      }

      const correctAns = qItem.correctAnswer !== undefined ? qItem.correctAnswer : qItem.correct_answer;

      const { error } = await supabase
        .from('saved_mcqs')
        .insert({
          user_id: user.id,
          chapter_id: chapterId,
          question: qItem.question,
          options: qItem.options,
          correct_answer: correctAns !== undefined ? correctAns : null,
          topic: qItem.topic || 'General',
          explanation: qItem.explanation || ''
        });

      if (error) throw error;
      setSavedActionMessage('MCQ saved successfully!');
      setTimeout(() => setSavedActionMessage(''), 3000);
    } catch (err) {
      console.error('Error saving MCQ:', err);
      setSavedActionMessage('Failed to save question.');
      setTimeout(() => setSavedActionMessage(''), 3000);
    }
  };

  const handleCreateCustomMcq = async (e) => {
    e.preventDefault();
    if (!customQuestion.trim() || customOptions.some(opt => !opt.trim())) {
      alert('Please fill out the question and all option fields.');
      return;
    }

    setIsAddingCustom(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save without correct_answer so AI can decide later
      const { error } = await supabase
        .from('saved_mcqs')
        .insert({
          user_id: user.id,
          chapter_id: chapterId,
          question: customQuestion.trim(),
          options: customOptions.map(o => o.trim()),
          correct_answer: null,
          topic: customTopic.trim() || 'Custom Added',
          explanation: 'Evaluated by AI during practice session.'
        });

      if (error) throw error;

      // Reset form & close modal
      setCustomQuestion('');
      setCustomOptions(['', '', '', '']);
      setCustomTopic('');
      setShowAddModal(false);

      // Refresh list
      fetchSavedMcqs();
      setSavedActionMessage('Custom MCQ added successfully! AI will determine the correct answer when practiced.');
      setTimeout(() => setSavedActionMessage(''), 4000);
    } catch (err) {
      console.error('Error adding custom MCQ:', err);
      alert('Failed to save custom MCQ.');
    } finally {
      setIsAddingCustom(false);
    }
  };

  const handleStartSavedPractice = () => {
    if (savedMcqs.length === 0) return;

    const formattedQuestions = savedMcqs.map(item => ({
      question: item.question,
      topic: item.topic || 'Saved Question',
      options: item.options,
      correctAnswer: item.correct_answer, // Can be null if custom added
      explanation: item.explanation || ''
    }));

    setQuestions(formattedQuestions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setPracticeType('saved-practice');
    setViewState('session');
  };

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

    // If practice type is 'saved-practice' and any question has a null correct_answer, 
    // ask Gemini AI to evaluate/determine the correct answers first before grading!
    let evaluatedQuestions = [...questions];
    const needsAiEvaluation = evaluatedQuestions.some(q => q.correctAnswer === null || q.correctAnswer === undefined);

    if (practiceType === 'saved-practice' && needsAiEvaluation) {
     try {
  // 1. Ensure we have the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('You must be logged in to save a custom question.');
  }

  // 2. Call the unified API route to evaluate the question via AI
  const evalRes = await fetch('/api/practice/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      prompt: `Evaluate this custom question: ${customQuestion.trim()} with options: ${JSON.stringify(customOptions)}`,
      question: customQuestion.trim(), 
      options: customOptions.map(o => o.trim()) 
    })
  });

  const contentType = evalRes.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('API route returned an HTML error page instead of JSON.');
  }

  const evalData = await evalRes.json();

  if (!evalRes.ok) {
    throw new Error(evalData.error || 'Failed to evaluate custom question.');
  }

  // 3. Save to Supabase using the fetched user ID and AI-evaluated data
  const { error } = await supabase
    .from('saved_mcqs')
    .insert({
      user_id: user.id, // <-- Uses the safely retrieved user ID
      chapter_id: chapterId,
      question: customQuestion.trim(),
      options: customOptions.map(o => o.trim()),
      correct_answer: evalData.correct_answer, // <-- AI's correct index (0, 1, 2, 3)
      topic: customTopic.trim() || 'Custom Added',
      explanation: evalData.explanation       // <-- AI's explanation
    });

  if (error) throw error;

  alert('Custom question successfully created and evaluated by AI!');

} catch (err) {
  console.error('Failed to evaluate and save custom question:', err.message);
  alert(err.message);
}
      let correctCount = 0;
      let incorrectCount = 0;
      let attemptedCount = 0;

      const attemptsData = evaluatedQuestions.map((q, idx) => {
        const selectedIdx = selectedAnswers[idx];
        const isAttempted = selectedIdx !== undefined;
        const correctAns = q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer;
        const isCorrect = isAttempted && selectedIdx === correctAns;

        if (isAttempted) {
          attemptedCount++;
          if (isCorrect) correctCount++;
          else incorrectCount++;
        }

        return {
          question: q.question,
          topic: q.topic || 'General Concepts',
          options: q.options,
          correct_answer: correctAns,
          selected_answer: isAttempted ? selectedIdx : null,
          is_correct: isCorrect,
          explanation: q.explanation || 'Evaluated successfully.'
        };
      });

      const accuracy = evaluatedQuestions.length > 0 ? Math.round((correctCount / evaluatedQuestions.length) * 100) : 0;

      const resultsSummary = {
        total: evaluatedQuestions.length,
        attempted: attemptedCount,
        correct: correctCount,
        incorrect: incorrectCount,
        accuracy
      };

      const incorrectItems = attemptsData
        .map((att, idx) => ({ ...att, questionNumber: idx + 1 }))
        .filter(att => !att.is_correct);

      setWrongQuestions(incorrectItems);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data: sessionRecord, error: sessionError } = await supabase
          .from('practice_sessions')
          .insert({
            user_id: user.id,
            chapter_id: chapterId,
            practice_type: practiceType,
            student_prompt: instruction || 'Saved MCQs Practice',
            total_questions: evaluatedQuestions.length,
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

          await supabase.from('practice_questions').insert(attemptsToInsert);
        }

        setSessionResults(resultsSummary);
        setViewState('complete');
      } catch (dbErr) {
        console.error('Error saving practice session:', dbErr);
        setErrorMessage('Failed to save session results.');
        setViewState('session');
      } finally {
        setIsSaving(false);
      }
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
                <h1 className="text-lg font-semibold text-zinc-100">Practice Hub</h1>
              </div>
            </div>

            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab('ai-generator')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${activeTab === 'ai-generator'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Generator</span>
              </button>
              <button
                onClick={() => setActiveTab('saved-mcqs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${activeTab === 'saved-mcqs'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                <span>Saved MCQs</span>
              </button>
            </div>
          </header>

          <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {savedActionMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>{savedActionMessage}</span>
              </div>
            )}

            {activeTab === 'ai-generator' ? (
              <>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold text-zinc-100">What do you want to practice?</h2>
                  <p className="text-xs text-zinc-400">
                    Type your study instruction below. Gemini will generate custom questions tailored to your goal.
                  </p>
                </div>

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
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${practiceType === 'ai'
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
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${practiceType === 'mcq'
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
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${practiceType === 'written'
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
              </>
            ) : (
              <>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-semibold text-zinc-100">Saved MCQs</h2>
                      <p className="text-xs text-zinc-400">
                        Access bookmarked items, add custom questions without selecting answers, or start a quiz.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm inline-flex items-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Add Custom MCQ</span>
                      </button>

                      {savedMcqs.length > 0 && (
                        <button
                          onClick={handleStartSavedPractice}
                          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm inline-flex items-center gap-2 shrink-0"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Practice Saved ({savedMcqs.length})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Practice Card Banner */}
                  {savedMcqs.length > 0 && (
                    <div
                      onClick={handleStartSavedPractice}
                      className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/60 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition group shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition">
                            Start Saved MCQs Practice Quiz
                          </h3>
                          <p className="text-xs text-zinc-400">
                            Take a full practice test of your {savedMcqs.length} bookmarked questions. AI will automatically evaluate any custom questions.
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition shrink-0" />
                    </div>
                  )}
                </div>

                {isLoadingSaved ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                  </div>
                ) : savedMcqs.length === 0 ? (
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
                    <Bookmark className="w-8 h-8 text-zinc-600" />
                    <h3 className="text-sm font-medium text-zinc-300">No saved MCQs for this chapter</h3>
                    <p className="text-xs text-zinc-500 max-w-sm">
                      Bookmark interesting questions during practice or add your own custom questions using the button above.
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 px-4 py-2 rounded-xl text-xs font-medium transition inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Create First Question</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {savedMcqs.map((item) => {
                      const alphabetLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
                      return (
                        <div key={item.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {item.topic || 'General'}
                            </span>
                            <button
                              onClick={(e) => handleDeleteSavedMcq(item.id, e)}
                              className="text-zinc-500 hover:text-red-400 transition p-1"
                              title="Remove from saved"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm font-medium text-zinc-100 leading-relaxed">{item.question}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {item.options?.map((opt, optIdx) => {
                              const isCorrect = item.correct_answer !== null && optIdx === item.correct_answer;
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-medium'
                                    : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400'
                                    }`}
                                >
                                  <span className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
                                    {alphabetLabels[optIdx] || optIdx + 1}
                                  </span>
                                  <span className="truncate">{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </main>

          {/* CUSTOM MCQ MODAL (NO CORRECT OPTION REQUIRED) */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-semibold text-zinc-100">Add Custom MCQ</h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomMcq} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-400">Topic / Category</label>
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g. Algebra Formulas"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-400">Question Statement *</label>
                    <textarea
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Enter your question text here..."
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-400">Options (A, B, C, D) *</label>
                    {customOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center text-[10px] text-zinc-400 shrink-0">
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...customOptions];
                            newOpts[idx] = e.target.value;
                            setCustomOptions(newOpts);
                          }}
                          placeholder={`Option ${['A', 'B', 'C', 'D'][idx]}`}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                          required
                        />
                      </div>
                    ))}
                    <p className="text-[11px] text-emerald-400/90 mt-1 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>No need to pick the correct answer! AI will automatically determine it when you start a practice quiz.</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingCustom}
                      className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isAddingCustom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Save Question</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
                  {practiceType === 'saved-practice' ? 'Saved MCQs Quiz' : 'Practice Session'}
                </div>
                <h1 className="text-lg font-semibold text-zinc-100">Interactive Quiz</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSaveMcq(currentQuestion)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs font-medium"
                title="Save this MCQ"
              >
                <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                <span>Save MCQ</span>
              </button>
              <div className="text-xs text-zinc-400 font-medium">
                Question <span className="text-zinc-200">{currentIndex + 1}</span> of {questions.length}
              </div>
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
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 group ${isSelected
                        ? "bg-zinc-800/80 border-zinc-600 text-zinc-100 shadow-sm"
                        : "bg-zinc-950/40 hover:bg-zinc-900/60 border-zinc-800/80 text-zinc-300"
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium transition-colors ${isSelected
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
                  <span>{currentIndex === questions.length - 1 ? (isSaving ? "Evaluating..." : "Submit & Check") : "Next"}</span>
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
                Evaluation Complete
              </div>
              <h1 className="text-lg font-semibold text-zinc-100">AI Quiz Analysis</h1>
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
                  <h2 className="text-base font-semibold text-zinc-100">Performance Summary</h2>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Verified by AI Evaluation</p>
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

            {/* REVIEW MISTAKES SECTION */}
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => setShowMistakesView(!showMistakesView)}
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 py-2.5 rounded-xl text-xs font-medium transition text-center flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{showMistakesView ? "Hide Detailed Breakdown" : `Review Mistakes & Correct Answers (${wrongQuestions.length})`}</span>
              </button>

              {showMistakesView && (
                <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-zinc-800/80">
                  {wrongQuestions.length === 0 ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center text-emerald-400 text-xs">
                      Fantastic! You got every question right.
                    </div>
                  ) : (
                    wrongQuestions.map((item, idx) => {
                      const alphabetLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
                      return (
                        <div key={idx} className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-zinc-500">Question #{item.questionNumber}</span>
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">{item.topic}</span>
                          </div>
                          <p className="text-zinc-100 font-medium leading-relaxed">{item.question}</p>

                          <div className="flex flex-col gap-1.5 pt-1">
                            {item.options.map((optText, optIdx) => {
                              const isUserSelection = optIdx === item.selected_answer;
                              const isCorrectAnswer = optIdx === item.correct_answer;

                              let optStyle = "border-zinc-800/80 bg-zinc-900/30 text-zinc-400";
                              if (isCorrectAnswer) {
                                optStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-medium";
                              } else if (isUserSelection && !isCorrectAnswer) {
                                optStyle = "border-red-500/40 bg-red-500/10 text-red-300 line-through";
                              }

                              return (
                                <div key={optIdx} className={`p-2.5 rounded-lg border flex items-center justify-between ${optStyle}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center text-[10px]">
                                      {alphabetLabels[optIdx] || optIdx + 1}
                                    </span>
                                    <span>{optText}</span>
                                  </div>
                                  {isCorrectAnswer && <span className="text-[10px] text-emerald-400 uppercase font-bold">Correct Answer</span>}
                                  {isUserSelection && !isCorrectAnswer && <span className="text-[10px] text-red-400 uppercase font-bold">Your Answer</span>}
                                </div>
                              );
                            })}
                          </div>

                          {item.explanation && (
                            <div className="mt-2 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-[11px] leading-relaxed">
                              <span className="font-semibold text-zinc-200 block mb-0.5">Explanation:</span>
                              {item.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3 w-full">
              <button
                onClick={() => {
                  setInstruction('');
                  setViewState('setup');
                  setShowMistakesView(false);
                  setWrongQuestions([]);
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