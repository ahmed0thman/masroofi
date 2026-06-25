import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';

export async function transcribeAudioFile(file: File) {
  const formData = new FormData();
  formData.append('file', file, file.name);
  console.log('form data built');
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('language', 'ar');
  formData.append('response_format', 'verbose_json');
  console.log(process.env.EXPO_PUBLIC_GROQ_API_KEY);
  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
      },
      body: formData,
    });
    console.log({ response });
    if (response.ok) {
      const data = await response.json();
      return {
        text: data.text,
        segments: data.segments,
        duration: data.duration,
        language: data.language,
      };
    }
  } catch (error) {
    console.error('Error transcribing audio file:', error);
  }
}
