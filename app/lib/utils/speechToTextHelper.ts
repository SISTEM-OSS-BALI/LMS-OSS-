import { AssemblyAI } from "assemblyai";
import fs from "fs-extra";
import path from "path";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY as string,
});

export const transcribeAudioFromBase64 = async (
  audioBase64: string
): Promise<string> => {
  const cleanedBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, "");

  const audioBuffer = Buffer.from(cleanedBase64, "base64");
  const audioPath = path.join(
    process.cwd(),
    "public",
    `audio-${Date.now()}.mp3`
  );

  await fs.writeFile(audioPath, audioBuffer);

  try {
    const uploadUrl = await client.files.upload(audioPath);

    const transcript = await client.transcripts.create({
      audio_url: uploadUrl,
    });

    let completedTranscript = await client.transcripts.get(transcript.id);
    while (
      completedTranscript.status !== "completed" &&
      completedTranscript.status !== "error"
    ) {
      await new Promise((res) => setTimeout(res, 3000)); // polling tiap 3 detik
      completedTranscript = await client.transcripts.get(transcript.id);
    }

    if (completedTranscript.status === "error") {
      throw new Error(`Transkripsi gagal: ${completedTranscript.error}`);
    }

    return completedTranscript.text as string;
  } catch (error) {
    throw error;
  } finally {
    await fs.unlink(audioPath).catch(() => {});
  }
};
