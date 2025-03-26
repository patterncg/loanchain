import { Ollama } from 'ollama';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get configuration from environment variables
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

// Create Ollama client
const ollama = new Ollama({ host: OLLAMA_BASE_URL });

// Flag to track LLM availability
let isLLMAvailable = false;

/**
 * Generates a response from the LLM using the provided prompt
 * @param prompt The text prompt to send to the LLM
 * @returns The generated response
 */
export async function generateWithLLM(prompt: string): Promise<string> {
  try {
    // If LLM is known to be unavailable, use mock response
    if (!isLLMAvailable) {
      console.log('LLM unavailable, using mock response');
      return generateMockResponse(prompt);
    }
    
    console.log(`Sending prompt to ${OLLAMA_MODEL}...`);
    
    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
    });

    return response.message.content;
  } catch (error) {
    console.error('Error generating LLM response:', error);
    console.log('Falling back to mock response');
    isLLMAvailable = false;
    return generateMockResponse(prompt);
  }
}

/**
 * Checks if the configured LLM model is available on the Ollama server
 * @returns True if the model is available
 */
export async function checkLLMAvailability(): Promise<boolean> {
  try {
    const models = await ollama.list();
    isLLMAvailable = models.models.some((model: { name: string }) => model.name === OLLAMA_MODEL);
    return isLLMAvailable;
  } catch (error) {
    console.error('Error checking LLM availability:', error);
    isLLMAvailable = false;
    return false;
  }
}

/**
 * Generates a mock response for when the LLM is unavailable
 * @param prompt The prompt that would have been sent to the LLM
 * @returns A mock response based on the prompt content
 */
function generateMockResponse(prompt: string): string {
  // Check if this is a summary prompt
  if (prompt.includes('human-readable summary')) {
    return "This is a 36-month loan of $50,000 at 5.5% interest rate for Jane Doe. The loan is secured by Real Estate valued at $80,000 and will be used for home renovation purposes.";
  }
  
  // Check if this is a risk assessment prompt
  if (prompt.includes('risk assessment')) {
    return JSON.stringify({
      riskRating: "Low",
      riskFactors: [
        "Loan-to-value ratio is favorable at 62.5%",
        "Borrower has good credit score of 720",
        "Loan purpose (home renovation) is likely to increase collateral value",
        "Loan term is relatively short at 36 months"
      ],
      recommendations: [
        "Consider offering a slightly lower interest rate to this low-risk borrower",
        "Request periodic updates on renovation progress to monitor collateral value"
      ]
    }, null, 2);
  }
  
  // Default response
  return "Mock LLM response: Unable to determine specific response type from the prompt.";
} 