import React, { useState, useEffect, useRef } from 'react';
import { useTimeline } from '../context/TimelineContext';
import '../styles/Home.css';

const Home = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I\'m here to help you track your child\'s health. Tell me about any symptoms, behaviors, or concerns you\'ve noticed, and I\'ll help you document them.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId] = useState('default');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [showTimelineNotification, setShowTimelineNotification] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatWindowRef = useRef(null);
  const { addEvent } = useTimeline();

  useEffect(() => {
    checkConnection();
  }, []);

  // auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // function to check if ollama is connected
  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      setIsConnected(data.ollama === 'connected');
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError('Cannot connect to server. Make sure the backend is running.');
    }
  };

  // function to send a message
  const sendMessage = async (messageText = null) => {
    const userMessage = (messageText || input.trim());
    if (userMessage === '') return;

    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    if (!messageText) setInput('');
    setIsTyping(true);
    setError(null);

    // try to send a message
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId: conversationId,
          model: 'llama3.2'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      
      console.log('📦 Received from server:', data);
      
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: data.response }
      ]);

      // if there's a timeline event, add it to the timeline
      if (data.timelineEvent) {
        console.log('✅ Adding timeline event:', data.timelineEvent);
        addEvent(data.timelineEvent);
        setShowTimelineNotification(true);
        setTimeout(() => setShowTimelineNotification(false), 5000);
      } else {
        console.log('⚠️  No timeline event in response');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to get response. Please check if Ollama is running and the server is connected.');
      setMessages(prev => [
        ...prev,
        { 
          sender: 'bot', 
          text: 'Sorry, I encountered an error. Please make sure Ollama is running and try again.' 
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Convert audio blob to WAV and transcribe
  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    setError(null);

    try {
      // Convert to WAV format
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Convert to WAV
      const wavBlob = audioBufferToWav(audioBuffer);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');

      const response = await fetch('http://localhost:3001/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Transcription API error:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to transcribe audio');
      }

      const data = await response.json();
      
      if (data.transcription) {
        // Send transcribed text to chat
        await sendMessage(data.transcription);
      } else {
        setError('No speech detected in recording.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Convert AudioBuffer to WAV Blob
  const audioBufferToWav = (buffer) => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  // trash to delete the conversation
  const clearConversation = async () => {
    try {
      await fetch(`http://localhost:3001/api/chat/${conversationId}`, {
        method: 'DELETE'
      });
      setMessages([
        { sender: 'bot', text: 'Hi! I am BabyCheck AI. Ask me anything about your baby! I can also help you track important health events and milestones.' }
      ]);
    } catch (err) {
      console.error('Error clearing conversation:', err);
    }
  };

  return (
    <div className="home-container">
      <div className="header-section">
        <h1 className="home-title">ChildClickCare</h1>
        <p className="home-subtitle">Keeping tabs on your child's health</p>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {isConnected ? 'Ollama Connected' : 'Ollama Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      {showTimelineNotification && (
        <div className="timeline-notification">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Event added to timeline!
        </div>
      )}

      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.sender}`}>
            <div className="message-content">
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message bot">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <button 
          className="clear-btn"
          onClick={clearConversation}
          title="Clear conversation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        
        <div className="chat-input">
          <button
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isConnected || isTyping || isTranscribing}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isTranscribing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            ) : isRecording ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"></rect>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </button>
          <input
            type="text"
            placeholder="Describe symptoms, behaviors, or concerns..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={!isConnected || isTyping || isTranscribing}
          />
          <button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || !isConnected || isTyping || isTranscribing}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;