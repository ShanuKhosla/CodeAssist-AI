import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json());
app.use(cors());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const genAI = new GoogleGenerativeAI("AIzaSyDOlrAUmRrAQYVD8Ny7Ib8O6ZCx4M7K3W4");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function optimizeCode(codeSnippet) {
  const prompt = `Given the following code snippet, analyze it, correct any errors, and provide optimizations:

${codeSnippet}

Please provide:
1. The optimized code
2. A list of optimizations made

Format your response as follows:
OPTIMIZED CODE:
[Your optimized code here]

OPTIMIZATIONS:
- [First optimization]
- [Second optimization]
- [etc.]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    // Split the response into optimized code and optimizations
    const [optimizedCodeSection, optimizationsSection] = text.split('OPTIMIZATIONS:');
    
    return {
      code: optimizedCodeSection.replace('OPTIMIZED CODE:', '').trim(),
      optimizations: optimizationsSection.split('-').slice(1).map(opt => opt.trim())
    };
  } catch (error) {
    console.error('Error optimizing code:', error);
    throw new Error('Failed to optimize code: ' + error.message);
  }
}

app.post('/upload-file', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;

  try {
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log('File content:', fileContent); // Log file content for debugging

    // Optimize code
    const optimizedResult = await optimizeCode(fileContent);
    console.log('Optimization result:', optimizedResult); // Log optimization result for debugging

    // Remove the temporary file
    fs.unlinkSync(filePath);

    // Send response
    res.json({ output: optimizedResult });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file', details: error.message });
  }
});

app.post('/optimize-code', async (req, res) => {
  const { code } = req.body;

  if (!code || code.trim() === '') {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    const optimizedResult = await optimizeCode(code);
    res.json({ output: optimizedResult });
  } catch (error) {
    console.error('Error optimizing code:', error);
    res.status(500).json({ error: 'Failed to optimize code', details: error.message });
  }
});

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


app.get('/ping', (req, res) => {
  res.status(200).setDefaultEncoding('Server is awake!');
})

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
