import axios from 'axios';
import FormData from 'form-data';
import { Readable } from 'stream';

// This is the API endpoint for ElevenLabs Speech to Text
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ message: 'No file provided' });
  }

  // The API key is stored in environment variables for security
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'ElevenLabs API key not configured' });
  }

  try {
    // Convert base64 to a buffer
    const base64Data = file.split(',')[1];
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Create a FormData object to send the file
    const formData = new FormData();
    const audioStream = new Readable();
    audioStream.push(audioBuffer);
    audioStream.push(null); // Signal the end of the stream

    formData.append('file', audioStream, {
      filename: 'audio.wav',
      contentType: 'audio/wav',
    });
  formData.append('model_id', 'scribe_v1');
  formData.append('tag_audio_events', 'false');

    // Make the request to the ElevenLabs API
    const response = await axios.post(ELEVENLABS_API_URL, formData, {
      headers: {
        'xi-api-key': apiKey,
        ...formData.getHeaders(),
      },
    });

    // The transcription is in the 'text' field of the response data
    res.status(200).json({ text: response.data.text });
  } catch (error) {
    console.error('Error transcribing audio with ElevenLabs:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error transcribing audio' });
  }
}
