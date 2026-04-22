import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestions, createQuestion, createOption } from '../api/questionApi';
import { apiClient } from '../api/apiClient';
import Toast from '../components/Toast';

// ── Tiny icon helpers ───────────────────────────────────────────────
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ── Input style ─────────────────────────────────────────────────────
const inputCls = `w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 text-sm
  bg-white outline-none focus:border-[#7FB77E] focus:ring-2 focus:ring-[#7FB77E]/20
  transition-all placeholder-gray-400`;

const btnPrimary = `inline-flex items-center gap-2 bg-[#7FB77E] hover:bg-[#6aa66a] text-white
  text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50`;

const btnSecondary = `inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50
  text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-all`;

// ── Option row inside a question ────────────────────────────────────
const OptionRow = ({ opt, index, onTextChange, onCorrectChange, onRemove }) => (
  <div className="flex items-center gap-3">
    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100
                     text-xs font-bold text-gray-500 shrink-0">
      {String.fromCharCode(65 + index)}
    </span>
    <input
      type="text"
      value={opt.option_text}
      onChange={(e) => onTextChange(e.target.value)}
      placeholder={`Option ${String.fromCharCode(65 + index)}`}
      className={`${inputCls} flex-1`}
    />
    <button
      type="button"
      onClick={() => onCorrectChange(!opt.is_correct)}
      title="Mark as correct"
      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
        opt.is_correct
          ? 'bg-[#7FB77E] border-[#7FB77E] text-white'
          : 'border-gray-300 text-gray-300 hover:border-[#7FB77E] hover:text-[#7FB77E]'
      }`}
    >
      <CheckIcon />
    </button>
    <button
      type="button"
      onClick={onRemove}
      className="shrink-0 w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
    >
      <TrashIcon />
    </button>
  </div>
);

// ── Question card ───────────────────────────────────────────────────
const QuestionCard = ({ q, index, onChange, onRemove }) => {
  const addOption = () =>
    onChange({ ...q, options: [...q.options, { option_text: '', is_correct: false }] });

  const removeOption = (i) =>
    onChange({ ...q, options: q.options.filter((_, oi) => oi !== i) });

  const updateOption = (i, patch) =>
    onChange({ ...q, options: q.options.map((o, oi) => oi === i ? { ...o, ...patch } : o) });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#f5f9f4] border-b border-gray-200">
        <span className="text-xs font-bold text-[#7FB77E] uppercase tracking-widest">
          Question {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 transition-colors text-sm font-medium flex items-center gap-1.5"
        >
          <TrashIcon /> Remove
        </button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Question text */}
        <textarea
          value={q.question_text}
          onChange={(e) => onChange({ ...q, question_text: e.target.value })}
          placeholder="Enter your question here…"
          rows={2}
          className={`${inputCls} resize-none`}
        />

        {/* Type + Marks row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Type
            </label>
            <select
              value={q.question_type}
              onChange={(e) => onChange({ ...q, question_type: e.target.value })}
              className={inputCls}
            >
              <option value="mcq">MCQ (Multiple Choice)</option>
              <option value="truefalse">True / False</option>
            </select>
          </div>
          <div className="w-28">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Marks
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={q.marks}
              onChange={(e) => onChange({ ...q, marks: parseInt(e.target.value) || 1 })}
              className={inputCls}
            />
          </div>
        </div>

        {/* Options */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Answer Options
            </label>
            <span className="text-xs text-gray-400 italic">Click ✓ to mark correct answer</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {q.question_type === 'truefalse' ? (
              <>
                {['True', 'False'].map((label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100
                                     text-xs font-bold text-gray-500 shrink-0">{label[0]}</span>
                    <span className={`${inputCls} flex-1 text-gray-600 cursor-default select-none`}>{label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const opts = [
                          { option_text: 'True', is_correct: i === 0 },
                          { option_text: 'False', is_correct: i === 1 },
                        ];
                        onChange({ ...q, options: opts });
                      }}
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        q.options[i]?.is_correct
                          ? 'bg-[#7FB77E] border-[#7FB77E] text-white'
                          : 'border-gray-300 text-gray-300 hover:border-[#7FB77E] hover:text-[#7FB77E]'
                      }`}
                    >
                      <CheckIcon />
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <>
                {q.options.map((opt, oi) => (
                  <OptionRow
                    key={oi}
                    index={oi}
                    opt={opt}
                    onTextChange={(v) => updateOption(oi, { option_text: v })}
                    onCorrectChange={(v) => updateOption(oi, { is_correct: v })}
                    onRemove={() => removeOption(oi)}
                  />
                ))}
                {q.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-2 text-sm text-[#7FB77E] hover:text-[#558b54]
                               font-medium mt-1 transition-colors"
                  >
                    <PlusIcon /> Add Option
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Saved question card (read-only) ────────────────────────────────
const SavedQuestionCard = ({ q, index }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
    <div className="flex items-start justify-between gap-3 mb-3">
      <p className="font-semibold text-gray-800 text-sm leading-snug">
        <span className="text-[#7FB77E] font-bold mr-2">Q{index + 1}.</span>
        {q.question_text}
      </p>
      <span className="text-xs bg-[#e5efdf] text-[#4d7f4c] font-bold px-2.5 py-0.5 rounded-full shrink-0">
        {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
      </span>
    </div>
    <div className="flex flex-wrap gap-2">
      {(q.options || []).map((o, oi) => (
        <span
          key={oi}
          className={`text-xs px-3 py-1 rounded-full border font-medium ${
            o.is_correct
              ? 'bg-[#e5efdf] border-[#7FB77E] text-[#4d7f4c]'
              : 'bg-gray-50 border-gray-200 text-gray-600'
          }`}
        >
          {o.is_correct && '✓ '}
          {o.option_text}
        </span>
      ))}
    </div>
  </div>
);

// ── Default blank question ──────────────────────────────────────────
const blankQuestion = () => ({
  question_text: '',
  question_type: 'mcq',
  marks: 1,
  options: [
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
  ],
  _id: Math.random().toString(36).slice(2),
});

// ── Main page ───────────────────────────────────────────────────────
const ExamBuilder = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Load exam info and existing questions
  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all exams and find this one
        const examsData = await apiClient('/exams');
        const all = Array.isArray(examsData) ? examsData : (examsData.exams || []);
        const found = all.find(e => String(e.exam_id) === String(examId));
        setExamInfo(found || { exam_id: examId, subject_name: `Exam #${examId}` });

        // Fetch existing questions
        const qData = await getQuestions(examId);
        const existing = Array.isArray(qData) ? qData : (qData.questions || []);
        setSavedQuestions(existing);
      } catch (err) {
        showToast('Failed to load exam data', 'error');
      } finally {
        setLoadingExisting(false);
      }
    };
    load();
  }, [examId]);

  const updateQuestion = (i, patch) =>
    setQuestions(prev => prev.map((q, qi) => qi === i ? { ...q, ...patch } : q));

  const removeQuestion = (i) =>
    setQuestions(prev => prev.filter((_, qi) => qi !== i));

  const addQuestion = () =>
    setQuestions(prev => [...prev, blankQuestion()]);

  // Validate before saving
  const validate = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) return `Question ${i + 1}: enter question text`;
      if (q.question_type === 'mcq') {
        const nonEmpty = q.options.filter(o => o.option_text.trim());
        if (nonEmpty.length < 2) return `Question ${i + 1}: add at least 2 options`;
        if (!q.options.some(o => o.is_correct)) return `Question ${i + 1}: mark a correct answer`;
      }
      if (q.question_type === 'truefalse') {
        if (!q.options.some(o => o.is_correct)) return `Question ${i + 1}: select True or False as correct`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { showToast(err, 'warning'); return; }

    setSaving(true);
    try {
      const newlySaved = [];
      for (const q of questions) {
        // 1. Save question
        const qRes = await createQuestion({
          exam_id: Number(examId),
          question_text: q.question_text.trim(),
          question_type: q.question_type,
          marks: q.marks,
        });
        const question_id = qRes.question?.question_id || qRes.question_id;

        // 2. Save options
        const savedOpts = [];
        const optsToSave = q.question_type === 'truefalse'
          ? q.options.length > 0
            ? q.options
            : [{ option_text: 'True', is_correct: false }, { option_text: 'False', is_correct: false }]
          : q.options.filter(o => o.option_text.trim());

        for (const o of optsToSave) {
          await createOption({
            question_id,
            option_text: o.option_text,
            is_correct: !!o.is_correct,
          });
          savedOpts.push(o);
        }
        newlySaved.push({ ...q, question_id, options: savedOpts });
      }

      setSavedQuestions(prev => [...prev, ...newlySaved]);
      setQuestions([blankQuestion()]);
      showToast(`${newlySaved.length} question${newlySaved.length > 1 ? 's' : ''} saved successfully!`);
    } catch (err) {
      showToast(err.message || 'Failed to save questions', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#7FB77E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalMarks = savedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#7FB77E] font-medium mb-2">
          <button onClick={() => navigate('/admin-dashboard/exams')} className="hover:underline">
            Exams
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Exam Builder</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {examInfo?.subject_name || `Exam #${examId}`}
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Build and manage questions for this exam
            </p>
          </div>
          {savedQuestions.length > 0 && (
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold text-[#7FB77E]">{savedQuestions.length}</p>
              <p className="text-xs text-gray-500 font-medium">
                {savedQuestions.length === 1 ? 'Question' : 'Questions'} · {totalMarks} marks
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Saved questions */}
      {savedQuestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Saved Questions
          </h2>
          <div className="flex flex-col gap-3">
            {savedQuestions.map((q, i) => (
              <SavedQuestionCard key={q.question_id || i} q={q} index={i} />
            ))}
          </div>
          <div className="mt-3 p-4 bg-[#f5f9f4] border border-[#d4e6d0] rounded-xl">
            <p className="text-sm font-semibold text-[#4d7f4c]">
              Total: {savedQuestions.length} questions · {totalMarks} marks
            </p>
          </div>
        </div>
      )}

      {/* Builder section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {savedQuestions.length > 0 ? 'Add More Questions' : 'New Questions'}
        </h2>
        <span className="text-xs text-gray-400">{questions.length} question{questions.length !== 1 ? 's' : ''} in draft</span>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <QuestionCard
            key={q._id}
            q={q}
            index={i}
            onChange={(patch) => updateQuestion(i, patch)}
            onRemove={() => removeQuestion(i)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button type="button" onClick={addQuestion} className={btnSecondary}>
          <PlusIcon /> Add Another Question
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={btnPrimary}
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <CheckIcon />
              Save {questions.length} Question{questions.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin-dashboard/exams')}
          className="ml-auto text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          ← Back to Exams
        </button>
      </div>
    </div>
  );
};

export default ExamBuilder;
