import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

// Initialize SDK clients securely on the server side
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { subjectId, chapterId, chapterName, prompt, practiceType, question, options } = body;

    // =========================================================================
    // 1. HANDLE SINGLE QUESTION EVALUATION (Called when evaluating custom saved MCQs)
    // =========================================================================
    if (question && options) {
      const evalSystemPrompt = `You are an expert educational AI evaluator. Your task is to analyze the provided question and its options array, find the correct answer, and return its 0-based index.
      
      Example:
      Options: ["Wood", "Gas", "Liquid", "None"] -> Correct answer is "Wood", so "correct_answer" should be 0.

      You must return valid JSON matching this exact schema:
      {
        "correct_answer": 0,
        "explanation": "Clear explanation of why this option is correct."
      }`;

      const evalUserPrompt = `Question: ${question}
      Options Array: ${JSON.stringify(options)}`;

      let rawEvalText = '';

      // --- TRY GEMINI FIRST (WITH AUTOMATIC FALLBACK TO OPENAI) ---
      try {
        console.log('[AI Provider] Evaluating custom question with Gemini 3.6 Flash');
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            { role: 'user', parts: [{ text: `${evalSystemPrompt}\n\n${evalUserPrompt}` }] }
          ],
        });

        rawEvalText = response.text;
        console.log('[AI Provider] Success with Gemini for custom question evaluation.');
      } catch (geminiEvalError) {
        console.warn(`[AI Provider] Gemini failed (${geminiEvalError.message || geminiEvalError}). Switching to OpenAI...`);

        try {
          if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is missing. Please add OPENAI_API_KEY to your .env.local file.');
          }

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: evalSystemPrompt },
              { role: 'user', content: evalUserPrompt }
            ],
            response_format: { type: 'json_object' }
          });

          rawEvalText = completion.choices[0]?.message?.content || '';
          console.log('[AI Provider] Success with OpenAI fallback for custom question evaluation.');
        } catch (openaiEvalError) {
          console.error('[AI Provider] Both Gemini and OpenAI failed:', openaiEvalError);
          return NextResponse.json(
            { error: `Gemini quota exceeded and OpenAI fallback failed: ${openaiEvalError.message}` },
            { status: 500 }
          );
        }
      }

      // --- PARSE & VALIDATE EVALUATION JSON ---
      try {
        const cleanedText = rawEvalText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanedText);

        return NextResponse.json({
          correct_answer: Number(parsedData.correct_answer ?? 0),
          explanation: parsedData.explanation || 'The correct option has been evaluated based on the question context.'
        });
      } catch (parseErr) {
        console.error('Failed to parse custom question evaluation JSON response:', rawEvalText);
        return NextResponse.json({ error: 'Failed to parse evaluation format from AI response.' }, { status: 500 });
      }
    }

    // =========================================================================
    // 2. HANDLE STANDARD PRACTICE GENERATION
    // =========================================================================
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const systemPrompt = `You are an expert educational AI. Generate practice questions based on the user request. 
You must return valid JSON matching this exact schema:
{
  "questions": [
    {
      "question": "The question text here",
      "topic": "Specific sub-topic name",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation of why the correct answer is right."
    }
  ]
}
Ensure correct_answer is the 0-based index of the correct option in the options array.`;

    const userPrompt = `Subject ID: ${subjectId || 'General'}
Chapter: ${chapterName || 'General Chapter'}
Practice Type: ${practiceType || 'mcq'}
User Request / Instruction: ${prompt}`;

    let rawText = '';

    // --- TRY GEMINI (PRIMARY) ---
    try {
      console.log('[AI Provider] Attempting generation with primary provider: Gemini 3.6 Flash');
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
      });

      rawText = response.text;
      console.log('[AI Provider] Success with Gemini.');
    } catch (geminiError) {
      console.warn(`[AI Provider] Gemini 3.6 Flash failed (${geminiError.message || geminiError}). Falling back to OpenAI...`);

      // --- FALLBACK TO OPENAI ---
      try {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key is missing from environment variables.');
        }

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' }
        });

        rawText = completion.choices[0]?.message?.content || '';
        console.log('[AI Provider] Success with OpenAI fallback.');
      } catch (openaiError) {
        console.error('[AI Provider] Both Gemini and OpenAI fallback failed:', openaiError);
        return NextResponse.json(
          { error: `Gemini 3.6 Flash error: ${geminiError.message || 'Model request failed'}. OpenAI fallback also failed.` },
          { status: 500 }
        );
      }
    }

    // --- PARSE & VALIDATE JSON RESPONSE ---
    let parsedData;
    try {
      const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error('Failed to parse AI JSON response:', rawText);
      return NextResponse.json({ error: 'Failed to parse questions format from AI response.' }, { status: 500 });
    }

    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      return NextResponse.json({ error: 'Invalid question structure returned by AI.' }, { status: 500 });
    }

    return NextResponse.json({ questions: parsedData.questions });

  } catch (err) {
    console.error('Practice Generation Endpoint Error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}