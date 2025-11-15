import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';
import mic from 'mic';
import wav from 'wav';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SAMPLE_RATE = 16000; // 16kHz is good for speech
const CHANNELS = 1; // Mono
const API_URL = 'http://localhost:3001/api/transcribe';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🎤 Speech-to-Text Test Script');
  console.log('==============================\n');
  
  // Ask for recording duration
  const durationInput = await askQuestion('How many seconds to record? (default: 5): ');
  const RECORDING_DURATION = (parseInt(durationInput) || 5) * 1000;
  
  console.log(`\n⏺️  Recording for ${RECORDING_DURATION / 1000} seconds...`);
  console.log('📢 Start speaking now!\n');
  
  // Countdown
  for (let i = 3; i > 0; i--) {
    process.stdout.write(`\r${i}... `);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('\r🎙️  Recording!     \n');

  // Create output file
  const outputFile = path.join(__dirname, 'test-recording.wav');
  const fileWriter = new wav.FileWriter(outputFile, {
    sampleRate: SAMPLE_RATE,
    channels: CHANNELS,
    bitDepth: 16
  });

  // Create mic instance
  let micInstance;
  try {
    micInstance = mic({
      rate: SAMPLE_RATE,
      channels: CHANNELS,
      device: 'default',
      exitOnSilence: 0
    });
  } catch (error) {
    console.error('❌ Error initializing microphone:', error.message);
    console.error('\n💡 Make sure your microphone is connected and permissions are granted.');
    rl.close();
    process.exit(1);
  }

  const micInputStream = micInstance.getAudioStream();

  // Pipe audio to WAV file
  micInputStream.pipe(fileWriter);

  // Handle errors
  micInputStream.on('error', (err) => {
    console.error('\n❌ Recording error:', err.message);
    rl.close();
    process.exit(1);
  });

  fileWriter.on('error', (err) => {
    console.error('\n❌ File write error:', err.message);
    rl.close();
    process.exit(1);
  });

  // Start recording
  micInstance.start();

  // Stop recording after duration
  setTimeout(() => {
    console.log('\n⏹️  Recording stopped. Processing...\n');
    
    micInstance.stop();
    fileWriter.end();
    
    // Wait a bit for file to finish writing
    setTimeout(async () => {
      try {
        // Check if file exists
        if (!fs.existsSync(outputFile)) {
          throw new Error('Recording file was not created');
        }
        
        const stats = fs.statSync(outputFile);
        console.log(`✅ Audio file created: ${outputFile}`);
        console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
        
        // Read the audio file
        const audioBuffer = fs.readFileSync(outputFile);
        
        // Create FormData
        const formData = new FormData();
        formData.append('audio', audioBuffer, {
          filename: 'test-recording.wav',
          contentType: 'audio/wav'
        });
        
        console.log('📤 Sending to API...\n');
        
        // Send to API
        const response = await fetch(API_URL, {
          method: 'POST',
          body: formData,
          headers: formData.getHeaders()
        });
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
            console.error('\n❌ Server Error Response:');
            console.error('Status:', response.status);
            console.error('Error:', JSON.stringify(errorData, null, 2));
          } catch (e) {
            const text = await response.text();
            console.error('\n❌ Server Error (non-JSON):');
            console.error('Status:', response.status);
            console.error('Response:', text);
            throw new Error(`API returned ${response.status}: ${text}`);
          }
          const errorMsg = errorData.error || errorData.details || `API returned ${response.status}`;
          throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        console.log('✅ Transcription successful!\n');
        console.log('📝 Transcribed text:');
        console.log('─'.repeat(50));
        console.log(data.transcription || '(No transcription returned)');
        console.log('─'.repeat(50));
        
        // Clean up
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile);
          console.log('\n🧹 Cleaned up temporary file');
        }
        
        rl.close();
        
      } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Full error:', error);
        if (error.stack) {
          console.error('Stack trace:', error.stack);
        }
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile);
        }
        rl.close();
        process.exit(1);
      }
    }, 500);
    
  }, RECORDING_DURATION);

  // Handle process exit
  process.on('SIGINT', () => {
    console.log('\n\n⚠️  Recording interrupted');
    if (micInstance) {
      micInstance.stop();
    }
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    rl.close();
    process.exit(0);
  });
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});

