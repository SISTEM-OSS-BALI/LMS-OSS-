import { AssemblyAI } from "assemblyai";
import fs from "fs-extra";
import path from "path";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY as string,
});

export const transcribeAudioFromUrl = async (
  audioUrl: string
): Promise<string> => {

  console.log("Transcribing audio from URL:", audioUrl);
  const transcript = await client.transcripts.create({
    audio_url: audioUrl,
  });

  let completedTranscript = await client.transcripts.get(transcript.id);
  while (
    completedTranscript.status !== "completed" &&
    completedTranscript.status !== "error"
  ) {
    await new Promise((res) => setTimeout(res, 3000)); // Polling tiap 3 detik
    completedTranscript = await client.transcripts.get(transcript.id);
  }

  if (completedTranscript.status === "error") {
    throw new Error(`Transkripsi gagal: ${completedTranscript.error}`);
  }

  return completedTranscript.text as string;
};
