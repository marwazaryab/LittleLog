import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import FormData from 'form-data';

// Load environment variables
const envResult = dotenv.config();
if (envResult.error) {
  console.warn('Warning: .env file not found or error loading it:', envResult.error.message);
} else {
  console.log('Environment variables loaded from .env file');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({ 
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// OpenAI Whisper API configuration
const OPENAI_API_KEY = process.env.API_KEY_STT?.trim();
const OPENAI_WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';

if (!OPENAI_API_KEY) {
  console.warn('⚠️  Warning: API_KEY_STT not found in .env file');
} else {
  console.log('✅ OpenAI API key loaded');
  console.log('Key length:', OPENAI_API_KEY.length);
  console.log('Key starts with:', OPENAI_API_KEY.substring(0, 7) + '...');
  console.log('Key ends with:', '...' + OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4));
}

// ollama API endpoint
const OLLAMA_API = 'http://localhost:11434/api/chat';

// convo history
const conversationHistories = new Map();

// prompt to ollama
const SYSTEM_PROMPT = `You are ChildClickCare AI. For EVERY health-related message, you MUST output TIMELINE_EVENT first.

MANDATORY FORMAT (use EXACTLY this):
TIMELINE_EVENT: {"title":"Brief Title","description":"What user reported with any details available","tags":["tag1","tag2"],"severity":"low"}

Your friendly response here.

RULES:
1. Create TIMELINE_EVENT immediately with whatever info you have - do NOT ask for more details first
2. If user says "fever" - create event for fever even if temp unknown
3. If user says "allergic reaction" - create event immediately, then ask follow-up questions
4. NEVER say you will create an event - JUST CREATE IT using the exact JSON format above

SEVERITY:
- "low": mild symptoms, normal milestones
- "medium": moderate concerns, persistent issues
- "high": serious, needs immediate medical attention

EXAMPLE - User: "allergic reaction"
TIMELINE_EVENT: {"title":"Possible Allergic Reaction","description":"Parent reported possible allergic reaction. Awaiting more details on symptoms and trigger.","tags":["Allergic Reaction","Emergency"],"severity":"high"}

I understand you're concerned about a possible allergic reaction. Please tell me: What did your child eat or come in contact with? Are there symptoms like hives, swelling, or breathing difficulty? If severe, call 911 immediately.

EXAMPLE - User: "baby has fever"
TIMELINE_EVENT: {"title":"Fever Reported","description":"Parent reported fever. Temperature and other symptoms to be confirmed.","tags":["Fever","Temperature"],"severity":"medium"}

I'm here to help with your baby's fever. What temperature did you measure? How is your baby behaving - are they eating and playing normally?

DO NOT TALK ABOUT creating events - JUST CREATE THEM using the exact format.`;


// chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId = 'default', model = 'llama3.2' } = req.body;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (!conversationHistories.has(conversationId)) {
      conversationHistories.set(conversationId, [{ role: 'system', content: SYSTEM_PROMPT }]);
    }
    const history = conversationHistories.get(conversationId);

    history.push({ role: 'user', content: message });

    const ollamaResponse = await fetch(OLLAMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: history, stream: false }),
    });

    if (!ollamaResponse.ok) throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);

    const data = await ollamaResponse.json();
    const aiMessage = data.message.content;

    console.log('🤖 AI Response (full):', aiMessage);
    console.log('═'.repeat(80));

    // extract timeline event - try multiple patterns
    let timelineEvent = null;
    let cleanedResponse = aiMessage;
    
    // Try to find TIMELINE_EVENT pattern (case insensitive)
    let timelineMatch = aiMessage.match(/TIMELINE_EVENT:\s*(\{[\s\S]*?\})/i);
    
    // If not found, try to find any JSON that looks like a timeline event
    if (!timelineMatch) {
      console.log('⚠️  No TIMELINE_EVENT: prefix found, searching for JSON object...');
      const jsonMatches = aiMessage.match(/\{[\s\S]*?"title"[\s\S]*?"description"[\s\S]*?\}/g);
      if (jsonMatches && jsonMatches.length > 0) {
        console.log('📋 Found potential timeline JSON without prefix');
        timelineMatch = [null, jsonMatches[jsonMatches.length - 1]]; // Use last match
      }
    } else {
      console.log('📋 Found TIMELINE_EVENT with prefix');
    }
    
    if (timelineMatch && timelineMatch[1]) {
      console.log('📋 Attempting to parse:', timelineMatch[1]);
      try {
        timelineEvent = JSON.parse(timelineMatch[1]);
        timelineEvent.id = uuidv4();
        
        // Always use current date/time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timelineEvent.date = `${year}-${month}-${day} ${hours}:${minutes}`;
        
        // Ensure required fields exist
        if (!timelineEvent.title || !timelineEvent.description) {
          console.error('❌ Missing required fields (title or description)');
          timelineEvent = null;
        } else {
          // Set defaults for optional fields
          timelineEvent.tags = timelineEvent.tags || [];
          timelineEvent.severity = timelineEvent.severity || 'medium';
          
          cleanedResponse = aiMessage.replace(/TIMELINE_EVENT:\s*\{[\s\S]*?\}/i, '').trim();
          console.log('✅ Timeline event created:', JSON.stringify(timelineEvent, null, 2));
        }
      } catch (e) {
        console.error('❌ Failed to parse timeline event:', e.message);
        console.error('Raw match:', timelineMatch[1]);
        timelineEvent = null;
      }
    } else {
      console.log('⚠️  No TIMELINE_EVENT found in response');
    }
    
    console.log('═'.repeat(80));

    history.push({ role: 'assistant', content: cleanedResponse });

    // keep last 20 messages
    if (history.length > 21) history.splice(1, 2);

    res.json({ response: cleanedResponse, conversationId, timelineEvent });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get response from AI', details: error.message });
  }
});

// clear conversation
app.delete('/api/chat/:conversationId', (req, res) => {
  conversationHistories.delete(req.params.conversationId);
  res.json({ message: 'Conversation history cleared' });
});

// health check
app.get('/api/health', async (req, res) => {
  try {
    const ollamaCheck = await fetch('http://localhost:11434/api/tags');
    res.json({ status: 'ok', ollama: ollamaCheck.ok ? 'connected' : 'disconnected' });
  } catch {
    res.json({ status: 'ok', ollama: 'disconnected' });
  }
});

// models
app.get('/api/models', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch models', details: error.message });
  }
});

// Speech-to-Text endpoint using OpenAI Whisper
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        hint: 'Make sure API_KEY_STT is set in your .env file'
      });
    }

    console.log('📤 Sending audio to OpenAI Whisper API...');
    console.log('File:', req.file.filename);
    console.log('Size:', (req.file.size / 1024).toFixed(2), 'KB');
    console.log('Using API key:', OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET');

    // Read the audio file
    const audioFile = fs.createReadStream(req.file.path);
    
    // Create FormData for OpenAI API
    const formData = new FormData();
    formData.append('file', audioFile, {
      filename: req.file.originalname || 'audio.wav',
      contentType: 'audio/wav'
    });
    formData.append('model', 'whisper-1');
    // Note: language parameter is optional - removed for auto-detection

    // Get form data headers
    const headers = {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      ...formData.getHeaders()
    };
    
    console.log('Request headers:', {
      'Authorization': `Bearer ${OPENAI_API_KEY.substring(0, 10)}...`,
      'Content-Type': headers['content-type']
    });

    // Send to OpenAI Whisper API
    const openaiResponse = await fetch(OPENAI_WHISPER_URL, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      // Clean up uploaded file before throwing error
      fs.unlinkSync(req.file.path);
      
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || data.error || `OpenAI API returned ${openaiResponse.status}`);
    }

    // Clean up uploaded file after successful response
    fs.unlinkSync(req.file.path);
    console.log('✅ Transcription successful');
    
    if (!data.text) {
      return res.status(400).json({ error: 'No transcription returned from API' });
    }

    res.json({ transcription: data.text });
  } catch (error) {
    console.error('Speech-to-Text error:', error);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to transcribe audio', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const buildPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(buildPath));

// Serve index.html for all non-API routes (SPA fallback)
// This runs after static files, so it only catches routes that don't match static files
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(buildPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

// start server 
  app.listen(PORT, () => {
  console.log(`🚀 BabyCheck AI Server running on http://localhost:${PORT}`);
  console.log(`📡 Make sure Ollama is running on http://localhost:11434`);
});
