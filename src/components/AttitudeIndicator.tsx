// src/components/AttitudeIndicator.tsx
import React, { useRef, useEffect } from 'react';

interface AttitudeIndicatorProps {
  pitch: number;
  roll: number;
  yaw: number;
}

const AttitudeIndicator: React.FC<AttitudeIndicatorProps> = ({ pitch, roll, yaw }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#4dabf7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw horizon
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(roll);
    ctx.translate(0, pitch * 10); // Scale pitch for visibility

    // Sky (blue)
    ctx.fillStyle = '#1a4b8c';
    ctx.fillRect(-radius, -radius, radius * 2, radius);

    // Ground (brown)
    ctx.fillStyle = '#5e3a1e';
    ctx.fillRect(-radius, 0, radius * 2, radius);

    // Horizon line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-radius, 0);
    ctx.lineTo(radius, 0);
    ctx.stroke();

    ctx.restore();

    // Draw center cross
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();

    // Draw yaw indicator
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
    ctx.strokeStyle = '#4dabf7';
    ctx.stroke();

    const yawX = centerX + Math.sin(yaw) * radius * 0.2;
    const yawY = centerY - Math.cos(yaw) * radius * 0.2;
    ctx.beginPath();
    ctx.arc(yawX, yawY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff9f1c';
    ctx.fill();

    // Draw labels
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '12px Arial';
    ctx.fillText('R', centerX + radius * 0.7, centerY - 5);
    ctx.fillText('P', centerX + 5, centerY - radius * 0.7);
    ctx.fillText('Y', centerX, centerY + radius * 0.7 + 15);

  }, [pitch, roll, yaw]);

  return (
    <div className="attitude-indicator">
      <h4>Attitude Indicator</h4>
      <div className="readouts">
        <span>Pitch: {(pitch * 180/Math.PI).toFixed(1)}°</span>
        <span>Roll: {(roll * 180/Math.PI).toFixed(1)}°</span>
        <span>Yaw: {(yaw * 180/Math.PI).toFixed(1)}°</span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={200} 
        height={200}
      />
    </div>
  );
};

export default AttitudeIndicator;