import express, { Application } from 'express';
import { Groq } from 'groq-sdk';
import http from 'node:http';
import 'dotenv/config';

const app: Application = express();
app.use(express.text());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getGroqChatCompletion(content: string) {
	return groq.chat.completions.create({
		messages: [
			{
				role: 'user',
				content,
			},
		],
		model: 'deepseek-r1-distill-llama-70b',
	});
}

app.post('/stream', async (req: express.Request, res: express.Response) => {
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Transfer-Encoding', 'chunked');

	if (req?.body) {
		const chatCompletion = await getGroqChatCompletion(req.body as string);

		const text = chatCompletion.choices[0]?.message?.content;
		if (text) {
			const chunks = text.split('</think>')[1].split(' ');
			const animated_typing: string[] = [];
			for (const split_text of chunks) {
				animated_typing.push(split_text);
				res.write(animated_typing.join(' '));
				await delay(1000);
			}
			res.end('Stream ended.\n');
		} else {
			res.write('Response error\n');
			res.end('Stream ended.\n');
		}
	} else {
		res.write('Prompt tidak ditemukan.\n');
		res.end('Stream ended.\n');
	}
});

const server = http.createServer(app);
server.listen(3000, () => {
	console.log('Server berjalan di http://localhost:3000');
});

async function fetchStreamAsync() {
	const response: Response = await fetch('http://localhost:3000/stream', {
		method: 'POST',
		headers: {
			'Content-Type': 'text/plain',
		},
		body: 'Halo, apa kabar?',
	});
	const decoder = new TextDecoder();

	for await (const chunk of response?.body as ReadableStream<Uint8Array>) {
		console.log(decoder.decode(chunk, { stream: true }));
	}

	console.log('Stream selesai.');
}

fetchStreamAsync().catch((error) => console.error('Error:', error));
