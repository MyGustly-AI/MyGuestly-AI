import { OpenAI } from 'openai';

// Initialize the client to use your free Groq credentials from the .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export const organizeEventMoments = async (mediaDescriptions) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'llama3-8b-8192', 
      messages: [
        { 
          role: 'system', 
          content: 'You are an event memory assistant. Categorize the following media descriptions into meaningful event moments (e.g., Ceremony, Reception, Dance). Return the result as a structured JSON object where keys are the categories and values are arrays of the media items.' 
        },
        { 
          role: 'user', 
          content: JSON.stringify(mediaDescriptions) 
        }
      ],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('AI Integration Error:', error);
    throw new Error('Failed to organize event moments');
  }
};