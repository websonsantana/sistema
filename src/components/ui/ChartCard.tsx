import { useEffect, useRef } from "react";

interface ChartCardProps {
  title: string;
  type: 'line' | 'bar' | 'doughnut';
  data: any[];
  className?: string;
}

export function ChartCard({ title, type, data, className = "" }: ChartCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Simple chart rendering
    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    if (type === 'line') {
      drawLineChart(ctx, data, width, height, padding);
    } else if (type === 'bar') {
      drawBarChart(ctx, data, width, height, padding);
    } else if (type === 'doughnut') {
      drawDoughnutChart(ctx, data, width, height);
    }
  }, [data, type]);

  return (
    <div className={`bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative h-64">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

function drawLineChart(ctx: CanvasRenderingContext2D, data: any[], width: number, height: number, padding: number) {
  if (!data.length) return;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...data.map(d => d.revenue || d.value || 0));
  
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 3;
  ctx.beginPath();

  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.revenue || point.value || 0) / maxValue) * chartHeight;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Draw points
  ctx.fillStyle = '#6366f1';
  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.revenue || point.value || 0) / maxValue) * chartHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBarChart(ctx: CanvasRenderingContext2D, data: any[], width: number, height: number, padding: number) {
  if (!data.length) return;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...data.map(d => d.value || 0));
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;

  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  data.forEach((item, index) => {
    const barHeight = ((item.value || 0) / maxValue) * chartHeight;
    const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
    const y = padding + chartHeight - barHeight;

    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y, barWidth, barHeight);
  });
}

function drawDoughnutChart(ctx: CanvasRenderingContext2D, data: any[], width: number, height: number) {
  if (!data.length) return;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;
  const innerRadius = radius * 0.6;

  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  let currentAngle = -Math.PI / 2;

  data.forEach((item, index) => {
    const sliceAngle = ((item.value || 0) / total) * Math.PI * 2;
    
    ctx.fillStyle = colors[index % colors.length];
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
    ctx.closePath();
    ctx.fill();

    currentAngle += sliceAngle;
  });
}
