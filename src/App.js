import React, { useRef, useEffect } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import './App.css';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    // Adicionar a linha abaixo para definir o contexto do canvas
    canvasCtxRef.current = canvasElement.getContext('2d');
    const canvasCtx = canvasCtxRef.current;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
        console.log("Câmera iniciada com sucesso!");
      } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
      }
    };

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      console.log("Resultados do FaceMesh:", results);
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          for (const landmark of landmarks) {
            canvasCtx.beginPath();
            canvasCtx.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 2, 0, 2 * Math.PI);
            canvasCtx.fillStyle = 'red';
            canvasCtx.fill();
          }
        }
      }
      canvasCtx.restore();
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        console.log("Frame capturado!");
        await faceMesh.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    videoElement.addEventListener('loadedmetadata', () => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
    });

    camera.start();
    startCamera();
  }, []);

  return (
    <div>
      <h1>Hubb HOF - Demo</h1>
      <div style={{ position: 'relative' }}>
        <video ref={videoRef} autoPlay playsInline></video>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default App;
