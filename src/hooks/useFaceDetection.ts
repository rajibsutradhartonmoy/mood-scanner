import { useEffect, useState, useRef } from 'react';
import { initializeFaceDetection, detectFace, analyzeFacialExpression } from '../services/faceDetection';
import type { MoodAnalysis, FacialExpression } from '../types/mood';

export const useFaceDetection = (videoRef: React.RefObject<HTMLVideoElement | null>, isActive: boolean) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isActiveRef = useRef(isActive);

  // Keep ref in sync with isActive prop
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeFaceDetection();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        setError('Failed to initialize face detection');
        console.error(err);
      }
    };

    initialize();
  }, []);

  const getPrimaryEmotion = (expressions: FacialExpression): { emotion: string; confidence: number } => {
    const emotions = Object.entries(expressions) as [string, number][];
    const sorted = emotions.sort((a, b) => b[1] - a[1]);
    return {
      emotion: sorted[0][0],
      confidence: sorted[0][1]
    };
  };

  useEffect(() => {
    if (!isActive || !isInitialized) {
      return;
    }

    const detectLoop = async () => {
      if (!isActiveRef.current || !videoRef.current) {
        return;
      }

      try {
        const result = await detectFace(videoRef.current);

        if (result && result.faceLandmarks.length > 0) {
          const expressions = analyzeFacialExpression(result);
          const { emotion, confidence } = getPrimaryEmotion(expressions);

          setMoodAnalysis({
            primaryEmotion: emotion,
            confidence,
            expressions
          });
        }
      } catch (err) {
        console.error('Detection loop error:', err);
      }

      if (isActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectLoop);
      }
    };

    detectLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isInitialized, videoRef]);

  return {
    isInitialized,
    moodAnalysis,
    error
  };
};
