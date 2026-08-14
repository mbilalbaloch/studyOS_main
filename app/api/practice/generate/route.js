import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {}
          },
          remove(name, options) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subjectId, chapterId, chapterName, prompt, practiceType } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Practice instruction prompt is required.' }, { status: 400 });
    }

    const systemInstruction = `You are an expert AI tutor for StudyOS, an educational platform for students in Pakistan (Class 10 level / entry test preparation). 
Your task is to generate practice questions based strictly on the student's instructions and chapter context.
You MUST return ONLY a valid JSON object matching this exact structure with no extra text or markdown formatting:
{
  "questions": [
    {
      "question": "Clear question text",
      "topic": "Concise concept name",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why the answer is correct."
    }
  ]
}
Provide between 5 to 10 high-quality questions. For correctAnswer, provide the 0-based index (0, 1, 2, or 3) of the correct option.`;

    const userPrompt = `Subject ID: ${subjectId}
Chapter: ${chapterName || 'General Chapter'}
Practice Type: ${practiceType}
Student Instructions: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.5,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Received empty response from AI model.');
    }

    // Clean any accidental markdown code blocks if present
    const cleanJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJsonText);

    if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
      throw new Error('Invalid response structure received from AI.');
    }

    return NextResponse.json({ success: true, questions: parsedData.questions });

  } catch (error) {
    console.error('Error generating practice questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate practice session. Please try again.' },
      { status: 500 }
    );
  }
}