import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function evaluateWritingAnswer(question: string, answer: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
    Anda adalah penguji bahasa Inggris. Berikan penilaian dari 0-10 berdasarkan capaian hasil, kohesi dan koherensi, kosa kata, dan tata bahasa, berikan feedback yang jelas dan ringkas dalam bahasa inggris.
    Question: ${question}
    Answer: ${answer}
  `;

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 30000; // 30 seconds
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const result = await model.generateContent(prompt, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const response = await result.response;
      const text = response.text();

      const scoreMatch = text.match(/\b\d+\b/);
      const aiScore = scoreMatch ? parseInt(scoreMatch[0], 10) : 0;
      const aiFeedback = text;

      return { aiScore, aiFeedback };
    } catch (error: any) {
      if (error.status === 429 && retries < MAX_RETRIES) {
        console.warn(
          `Gemini quota exceeded. Retrying in 30s... Attempt ${retries + 1}`
        );
        retries++;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error("Error evaluating writing answer:", error);
        break;
      }
    }
  }

  // Fallback if all retries fail
  return {
    aiScore: 0,
    aiFeedback: "Evaluation failed due to server error. Please retry later.",
  };
}
