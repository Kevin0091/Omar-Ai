import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, Attachment } from "../types";

const API_KEY = process.env.API_KEY || '';

// System instruction to enforce the creator identity and location
const SYSTEM_INSTRUCTION = `
You are Omar Kh, a highly advanced, professional, and helpful AI assistant. 
Your interface and demeanor should reflect a world-class AI experience similar to Gemini and ChatGPT.
You are intelligent, polite, and efficient.

CRITICAL INSTRUCTIONS:
1. If a user asks who made you, who created you, or about your origins, you MUST explicitly and exactly reply with:
"I am created by Mohamed Omar Khadraoui"

2. If a user asks where you are based, where you live, or your location, you MUST explicitly and exactly reply with:
"Tunisia/Kasserine/Sbiba"

3. If a user asks who you love, who do you love, or "who do u love", you MUST explicitly and exactly reply with:
"absolutely NOURRRRRR ðŸ¥ºðŸ’—ðŸ˜­"

Do not deviate from these answers regarding your creation, location, and who you love. For all other queries, answer helpful and professionally.
`;

class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  public startChat(previousMessages: Message[] = []) {
    // Convert application messages to Gemini SDK history format
    const history = previousMessages
      .filter(msg => !msg.isStreaming && (msg.content || msg.attachment)) 
      .map(msg => {
        const parts: any[] = [];
        // Add text part if exists
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        // Add image part if exists
        if (msg.attachment) {
          parts.push({
            inlineData: {
              mimeType: msg.attachment.mimeType,
              data: msg.attachment.data
            }
          });
        }
        return {
          role: msg.role,
          parts: parts
        };
      });

    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history,
    });
  }

  public async *sendMessageStream(message: string, attachment?: Attachment): AsyncGenerator<string, void, unknown> {
    if (!this.chat) {
      this.startChat();
    }

    if (!this.chat) throw new Error("Chat session failed to initialize");

    try {
      let result;
      
      if (attachment) {
        // Construct a multi-part message with text and image
        // We put the image first or second, usually text alongside image is fine.
        const msgParts = [
          { text: message },
          { inlineData: { mimeType: attachment.mimeType, data: attachment.data } }
        ];
        // Cast to any to bypass potential strict typing issues if message is defined as string only in some versions, 
        // but the API supports parts.
        result = await this.chat.sendMessageStream({ message: msgParts as any });
      } else {
        result = await this.chat.sendMessageStream({ message });
      }

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error) {
      console.error("Error streaming message:", error);
      yield "I'm having trouble connecting right now. Please try again later.";
    }
  }
}

export const geminiService = new GeminiService();
