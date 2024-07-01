import express from 'express';
const app = express();
import cors from 'cors';

// Middleware used for parsing JSON data
app.use(express.json());
app.use(cors());
import { GoogleGenerativeAI } from '@google/generative-ai';

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyDOlrAUmRrAQYVD8Ny7Ib8O6ZCx4M7K3W4");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function optimizeCode(codeSnippet) {
  const prompt = `Given the code snippet. Analyze it and correct any errors and provide any scope of optimizations
Here's the code:
${codeSnippet}

Provide the optimized code. 
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text(); // Ensure text is properly awaited
    return { code: text.trim() }; // Return the optimized code directly
  } catch (error) {
    console.error('Error calling checkCode:', error);
    return { error: 'Failed to optimize code' };
  }
}
async function translateCode(codeSnippet, toLang) {
  const prompt = `Translate the following code into ${toLang}:
${codeSnippet}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedCode = await response.text(); // Ensure text is properly awaited
    return { code: translatedCode.trim() }; // Return translated code directly
  } catch (error) {
    console.error('Error calling translateCode:', error);
    return { error: 'Failed to translate code' };
  }
}

async function debugCode(codeSnippet) {
  const prompt = `Given the code snippet. Analyze it, identify any errors, and provide a corrected version.
Here's the code:
${codeSnippet}

Provide the corrected code. 
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const debuggedCode = await response.text(); // Ensure text is properly awaited
    return { code: debuggedCode.trim() }; // Return debugged code directly
  } catch (error) {
    console.error('Error calling debugCode:', error);
    return { error: 'Failed to debug code' };
  }
}

async function testCode(codeSnippet) {
  const prompt = `Analyze the following code snippet and generate test cases for both white-box and black-box testing. Provide the test cases in the following format:

1. <Test Case Description>
    - Input: <Input Values>
    - Expected Output: <Expected Output>

Here's the code:
${codeSnippet}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const testCases = await response.text(); // Ensure text is properly awaited
    return { testCases: testCases.trim() }; // Return test cases directly
  } catch (error) {
    console.error('Error calling testCode:', error);
    return { error: 'Failed to generate test cases' };
  }
}

app.post('/test-code', async (req, res) => {
  const { code } = req.body; // Extract code from request body

  try {
    const geminiOutput = await testCode(code);
    console.log(geminiOutput);
    res.json({ output: geminiOutput }); // Send Gemini's output in response
  } catch (error) {
    console.error('Error calling testCode:', error);
    res.status(500).json({ error: 'Failed to generate test cases' }); // Handle errors gracefully
  }
});




app.post('/optimize-code', async (req, res) => {
  const { code } = req.body; // Extract code from request body

  try {
    const geminiOutput = await optimizeCode(code);
    console.log(geminiOutput)
    res.json({ output: geminiOutput }); // Send Gemini's output in response
  } catch (error) {
    console.error('Error calling optimizeCode:', error);
    res.status(500).json({ error: 'Failed to optimize code' }); // Handle errors gracefully
  }
});
app.post('/translate-code', async(req, res) => {
  const { code, toLang } = req.body;
  try {
    const geminiOutput = await translateCode(code, toLang);
    res.json({ translatedOutput: geminiOutput });
  } catch (error) {
    console.error('Error calling translateCode: ', error);
    res.status(500).json({ error: 'Failed to translate code' }); // Handle errors gracefully
  }
});

app.post('/debug-code', async (req, res) => {
  const { code } = req.body; // Extract code from request body

  try {
    const geminiOutput = await debugCode(code);
    console.log(geminiOutput);
    res.json({ output: geminiOutput }); // Send Gemini's output in response
  } catch (error) {
    console.error('Error calling debugCode:', error);
    res.status(500).json({ error: 'Failed to debug code' }); // Handle errors gracefully
  }
});




app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
