import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            // Save audio file
            const { file } = req.body;
            const audioBuffer = Buffer.from(file.split(',')[1], 'base64');

            // Call Whisper API
            const form = new FormData();
            form.append('file', audioBuffer, 'audio.wav');
            form.append('model', 'whisper-1');

            const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            });

            res.status(200).json({ text: response.data.text });
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            res.status(500).json({ error: 'Failed to process audio' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
