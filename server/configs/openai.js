// import {OpenAI }from "openai";

// const openai = new OpenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
// });
// export default openai





import { OpenAI } from "openai";

const openai = new OpenAI({
	baseURL: "https://router.huggingface.co/v1",
	apiKey: process.env.HUGGING_FACE_API_TOKEN,
});

export default openai