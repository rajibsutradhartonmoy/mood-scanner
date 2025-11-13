import { useState, useEffect } from 'react';
import { useWebcam } from '../hooks/useWebcam';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { initializeGemini, generateMoodSummary, isGeminiInitialized } from '../services/geminiService';
import type { EmotionType } from '../types/mood';

const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: 'bg-yellow-400',
  sad: 'bg-blue-400',
  angry: 'bg-red-400',
  surprised: 'bg-purple-400',
  neutral: 'bg-gray-400',
  fearful: 'bg-orange-400',
  disgusted: 'bg-green-400'
};

const EMOTION_EMOJI: Record<EmotionType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
  neutral: '😐',
  fearful: '😨',
  disgusted: '🤢'
};

export const MoodScanner = () => {
  const { videoRef, isStreaming, error: webcamError, startWebcam, stopWebcam } = useWebcam();
  const { isInitialized, moodAnalysis, error: detectionError } = useFaceDetection(videoRef, isStreaming);

  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [moodHistory, setMoodHistory] = useState<string[]>([]);

  useEffect(() => {
    if (moodAnalysis && moodAnalysis.primaryEmotion !== 'neutral') {
      setMoodHistory(prev => {
        const newHistory = [...prev, moodAnalysis.primaryEmotion];
        return newHistory.slice(-10); // Keep last 10 moods
      });
    }
  }, [moodAnalysis]);

  const handleStartScanning = async () => {
    await startWebcam();
  };

  const handleStopScanning = () => {
    stopWebcam();
    setAiSummary(null);
  };

  const handleGeminiApiKeySubmit = () => {
    if (geminiApiKey.trim()) {
      try {
        initializeGemini(geminiApiKey);
        setShowApiKeyInput(false);
      } catch (error) {
        alert('Failed to initialize Gemini AI. Please check your API key.');
      }
    }
  };

  const handleGenerateSummary = async () => {
    if (!moodAnalysis || !isGeminiInitialized()) {
      if (!isGeminiInitialized()) {
        setShowApiKeyInput(true);
      }
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const summary = await generateMoodSummary(
        moodAnalysis.primaryEmotion,
        moodAnalysis.confidence,
        moodAnalysis.expressions,
        moodHistory
      );
      setAiSummary(summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate AI summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Mood Scanner
          </h1>
          <p className="text-gray-300">Real-time facial expression analysis powered by AI</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Feed Section */}
          <div className="space-y-4">
            <div className="bg-black/30 backdrop-blur rounded-2xl p-6 shadow-2xl">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📷</div>
                      <p className="text-gray-300">Camera not active</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {!isStreaming ? (
                  <button
                    onClick={handleStartScanning}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Start Scanning
                  </button>
                ) : (
                  <button
                    onClick={handleStopScanning}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Stop Scanning
                  </button>
                )}
              </div>

              {(webcamError || detectionError) && (
                <div className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-200">{webcamError || detectionError}</p>
                </div>
              )}

              {!isInitialized && isStreaming && (
                <div className="mt-4 bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                  <p className="text-yellow-200">Initializing face detection...</p>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Section */}
          <div className="space-y-4">
            {/* Primary Mood Display */}
            <div className="bg-black/30 backdrop-blur rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Current Mood</h2>
              {moodAnalysis ? (
                <div className="text-center">
                  <div className="text-8xl mb-4">
                    {EMOTION_EMOJI[moodAnalysis.primaryEmotion as EmotionType]}
                  </div>
                  <h3 className="text-3xl font-bold capitalize mb-2">
                    {moodAnalysis.primaryEmotion}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-sm text-gray-400">Confidence:</div>
                    <div className="text-lg font-semibold">
                      {(moodAnalysis.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {isStreaming ? 'Analyzing...' : 'Start scanning to detect mood'}
                </div>
              )}
            </div>

            {/* Expression Breakdown */}
            {moodAnalysis && (
              <div className="bg-black/30 backdrop-blur rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold mb-4">Expression Breakdown</h2>
                <div className="space-y-3">
                  {Object.entries(moodAnalysis.expressions)
                    .sort(([, a], [, b]) => b - a)
                    .map(([emotion, value]) => (
                      <div key={emotion}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize flex items-center gap-2">
                            <span>{EMOTION_EMOJI[emotion as EmotionType]}</span>
                            {emotion}
                          </span>
                          <span className="font-semibold">{(value * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${EMOTION_COLORS[emotion as EmotionType]} transition-all duration-300`}
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* AI Summary Section */}
            <div className="bg-black/30 backdrop-blur rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-4">AI Mood Summary</h2>

              {!isGeminiInitialized() && !showApiKeyInput && (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Configure Gemini AI for natural language summaries</p>
                  <button
                    onClick={() => setShowApiKeyInput(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200"
                  >
                    Setup Gemini AI
                  </button>
                </div>
              )}

              {showApiKeyInput && (
                <div className="space-y-3">
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="Enter Gemini API Key"
                    className="w-full bg-black/40 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleGeminiApiKeySubmit}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setShowApiKeyInput(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Get your API key from{' '}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              )}

              {isGeminiInitialized() && !showApiKeyInput && (
                <>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={!moodAnalysis || isGeneratingSummary}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl mb-4"
                  >
                    {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
                  </button>

                  {aiSummary && (
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-white leading-relaxed">{aiSummary}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <footer className="text-center mt-8 text-gray-400 text-sm">
          <p>All processing happens locally in your browser. Your video never leaves your device.</p>
        </footer>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};
