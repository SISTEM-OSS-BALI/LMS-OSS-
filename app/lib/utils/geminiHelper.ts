import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function evaluateWritingAnswer(question: string, answer: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
  const prompt = `
    Anda adalah penguji bahasa Inggris. Berikan penilaian dari 0-10 berdasarkan capaian hasil, kohesi dan koherensi, kosa kata, dan tata bahasa, berikan feedback yang jelas dan ringkas dalam bahasa inggris.
    Question: ${question}
    Answer: ${answer}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const scoreMatch = text.match(/\b\d+\b/);
  const aiScore = scoreMatch ? parseInt(scoreMatch[0], 10) : 0;
  const aiFeedback = text;


  return { aiScore, aiFeedback };
}
