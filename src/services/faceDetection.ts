import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import type { FacialExpression } from '../types/mood';

let faceLandmarker: FaceLandmarker | null = null;

export const initializeFaceDetection = async () => {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU'
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1
    });

    return faceLandmarker;
  } catch (error) {
    console.error('Failed to initialize face detection:', error);
    throw error;
  }
};

export const analyzeFacialExpression = (result: FaceLandmarkerResult): FacialExpression => {
  // Initialize default neutral expression
  const expression: FacialExpression = {
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    neutral: 1,
    fearful: 0,
    disgusted: 0
  };

  if (!result.faceBlendshapes || result.faceBlendshapes.length === 0) {
    return expression;
  }

  const blendshapes = result.faceBlendshapes[0].categories;

  // Map MediaPipe blendshapes to emotions
  const blendshapeMap: { [key: string]: number } = {};
  blendshapes.forEach(shape => {
    blendshapeMap[shape.categoryName] = shape.score;
  });

  // Calculate emotion probabilities based on blendshapes
  // Happy: mouth smile, cheek squint
  expression.happy = Math.min(1, (
    (blendshapeMap['mouthSmileLeft'] || 0) * 0.3 +
    (blendshapeMap['mouthSmileRight'] || 0) * 0.3 +
    (blendshapeMap['cheekSquintLeft'] || 0) * 0.2 +
    (blendshapeMap['cheekSquintRight'] || 0) * 0.2
  ) * 2.5);

  // Sad: mouth frown, inner brow raised
  expression.sad = Math.min(1, (
    (blendshapeMap['mouthFrownLeft'] || 0) * 0.4 +
    (blendshapeMap['mouthFrownRight'] || 0) * 0.4 +
    (blendshapeMap['browInnerUp'] || 0) * 0.2
  ) * 2);

  // Surprised: eyes wide, jaw open, brows up
  expression.surprised = Math.min(1, (
    (blendshapeMap['eyeWideLeft'] || 0) * 0.3 +
    (blendshapeMap['eyeWideRight'] || 0) * 0.3 +
    (blendshapeMap['jawOpen'] || 0) * 0.2 +
    (blendshapeMap['browOuterUpLeft'] || 0) * 0.1 +
    (blendshapeMap['browOuterUpRight'] || 0) * 0.1
  ) * 2);

  // Angry: brows down, mouth stretched
  expression.angry = Math.min(1, (
    (blendshapeMap['browDownLeft'] || 0) * 0.4 +
    (blendshapeMap['browDownRight'] || 0) * 0.4 +
    (blendshapeMap['mouthStretchLeft'] || 0) * 0.1 +
    (blendshapeMap['mouthStretchRight'] || 0) * 0.1
  ) * 2.5);

  // Disgusted: nose sneer, upper lip raised
  expression.disgusted = Math.min(1, (
    (blendshapeMap['noseSneerLeft'] || 0) * 0.4 +
    (blendshapeMap['noseSneerRight'] || 0) * 0.4 +
    (blendshapeMap['mouthUpperUpLeft'] || 0) * 0.1 +
    (blendshapeMap['mouthUpperUpRight'] || 0) * 0.1
  ) * 2.5);

  // Fearful: eyes wide, brows raised, mouth slightly open
  expression.fearful = Math.min(1, (
    (blendshapeMap['eyeWideLeft'] || 0) * 0.25 +
    (blendshapeMap['eyeWideRight'] || 0) * 0.25 +
    (blendshapeMap['browInnerUp'] || 0) * 0.25 +
    (blendshapeMap['jawOpen'] || 0) * 0.1 +
    (blendshapeMap['mouthFrownLeft'] || 0) * 0.075 +
    (blendshapeMap['mouthFrownRight'] || 0) * 0.075
  ) * 2);

  // Calculate neutral as inverse of all other emotions
  const totalEmotions = expression.happy + expression.sad + expression.angry +
                        expression.surprised + expression.fearful + expression.disgusted;
  expression.neutral = Math.max(0, 1 - totalEmotions);

  return expression;
};

export const detectFace = async (video: HTMLVideoElement): Promise<FaceLandmarkerResult | null> => {
  if (!faceLandmarker || !video || video.readyState !== 4) {
    return null;
  }

  try {
    const timestamp = performance.now();
    const result = faceLandmarker.detectForVideo(video, timestamp);
    return result;
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
};

export const getFaceLandmarker = () => faceLandmarker;
