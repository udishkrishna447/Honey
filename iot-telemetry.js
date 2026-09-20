/**
 * HoneyChain - IoT Hive Telemetry & Environmental Monitoring System
 * Real-time multi-sensor simulation for KVIC Smart Bee Boxes.
 * Sensors: Internal Brood Temp, Humidity, Load Cell (Weight), Audio Frequency (Acoustic), CO2/VOC, Solar Battery.
 */

class HiveTelemetrySimulator {
  constructor(hiveId = 'KVIC-BOX-NIL-4082') {
    this.hiveId = hiveId;
    this.mode = 'normal'; // 'normal', 'preswarm', 'heatwave', 'nectar_peak', 'queenless'
    this.historyLength = 30;
    this.listeners = [];

    // Current State
    this.state = {
      timestamp: new Date().toISOString(),
      temperature: 34.2, // Celsius (optimal: 32 - 35°C)
      ambientTemp: 28.5,
      humidity: 58.4,    // % (optimal: 50 - 65%)
      weightKg: 32.4,    // kg (gross hive weight)
      acousticHz: 215,   // Hz (150-250 Hz normal worker hum)
      acousticDecibel: 64, // dB
      co2Ppm: 580,       // ppm (400-800 normal)
      solarBattery: 94,  // %
      loraRssi: -78,     // dBm
      queenStatus: 'Active & Egg Laying',
      swarmRiskScore: 12 // 0 - 100%
    };

    // Time-series history buffers
    this.history = {
      labels: [],
      temperature: [],
      humidity: [],
      weightKg: [],
      acousticHz: []
    };

    // Pre-fill history
    const now = Date.now();
    for (let i = this.historyLength; i >= 0; i--) {
      const time = new Date(now - i * 3000);
      this.history.labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      this.history.temperature.push(33.8 + (Math.random() * 0.8 - 0.4));
      this.history.humidity.push(58 + (Math.random() * 4 - 2));
      this.history.weightKg.push(32.0 + (30 - i) * 0.02 + (Math.random() * 0.1));
      this.history.acousticHz.push(210 + Math.floor(Math.random() * 20));
    }

    this.timer = null;
    this.isStreaming = true;
    this.startStreaming();
  }

  setMode(mode) {
    this.mode = mode;
    this.updateReadings();
  }

  startStreaming(intervalMs = 2500) {
    if (this.timer) clearInterval(this.timer);
    this.isStreaming = true;
    this.timer = setInterval(() => {
      this.updateReadings();
      this.notify();
    }, intervalMs);
  }

  stopStreaming() {
    if (this.timer) clearInterval(this.timer);
    this.isStreaming = false;
  }

  updateReadings() {
    const jitter = (range) => (Math.random() * range * 2) - range;

    switch (this.mode) {
      case 'preswarm':
        // Pre-swarm: Frequency skyrockets to 450-550 Hz, acoustic volume rises, temperature elevates slightly
        this.state.acousticHz = Math.min(560, Math.max(430, 490 + Math.floor(jitter(35))));
        this.state.acousticDecibel = 78 + Math.floor(jitter(4));
        this.state.temperature = +(36.2 + jitter(0.4)).toFixed(1);
        this.state.humidity = +(62.0 + jitter(2)).toFixed(1);
        this.state.weightKg = +(this.state.weightKg - 0.05 + jitter(0.02)).toFixed(2);
        this.state.co2Ppm = 940 + Math.floor(jitter(50));
        this.state.queenStatus = 'Virgin Queen Piping / Colony Preparing to Swarm';
        this.state.swarmRiskScore = 91;
        break;

      case 'heatwave':
        // Overheating: Temp breaches 38°C, bees fanning frantically
        this.state.temperature = +(38.6 + jitter(0.6)).toFixed(1);
        this.state.ambientTemp = +(41.2 + jitter(0.8)).toFixed(1);
        this.state.humidity = +(38.0 + jitter(2)).toFixed(1);
        this.state.acousticHz = 310 + Math.floor(jitter(25)); // Heavy fanning acoustic
        this.state.acousticDecibel = 74 + Math.floor(jitter(3));
        this.state.co2Ppm = 720 + Math.floor(jitter(40));
        this.state.queenStatus = 'Heat Stressed (Brood at Risk)';
        this.state.swarmRiskScore = 48;
        break;

      case 'nectar_peak':
        // Rapid weight increase as foragers bring fresh nectar
        this.state.temperature = +(34.4 + jitter(0.3)).toFixed(1);
        this.state.humidity = +(56.5 + jitter(1.5)).toFixed(1);
        this.state.weightKg = +(this.state.weightKg + 0.12 + Math.random() * 0.05).toFixed(2);
        this.state.acousticHz = 220 + Math.floor(jitter(15));
        this.state.acousticDecibel = 66 + Math.floor(jitter(2));
        this.state.co2Ppm = 610 + Math.floor(jitter(30));
        this.state.queenStatus = 'Active & Expanding Brood';
        this.state.swarmRiskScore = 22;
        break;

      case 'queenless':
        // Queenless: low, chaotic, roaring sound with lack of rhythmic hum
        this.state.acousticHz = 115 + Math.floor(jitter(25));
        this.state.acousticDecibel = 58 + Math.floor(jitter(4));
        this.state.temperature = +(31.8 + jitter(0.5)).toFixed(1);
        this.state.humidity = +(67.0 + jitter(3)).toFixed(1);
        this.state.co2Ppm = 510 + Math.floor(jitter(30));
        this.state.queenStatus = 'ALERT: No Queen Detected (Colony Roar)';
        this.state.swarmRiskScore = 5;
        break;

      case 'normal':
      default:
        // Healthy equilibrium
        this.state.temperature = +(34.3 + jitter(0.3)).toFixed(1);
        this.state.ambientTemp = +(28.2 + jitter(0.5)).toFixed(1);
        this.state.humidity = +(58.5 + jitter(1.5)).toFixed(1);
        this.state.weightKg = +(this.state.weightKg + (Math.random() * 0.04 - 0.01)).toFixed(2);
        this.state.acousticHz = 215 + Math.floor(jitter(15));
        this.state.acousticDecibel = 63 + Math.floor(jitter(2));
        this.state.co2Ppm = 585 + Math.floor(jitter(25));
        this.state.queenStatus = 'Active & Healthy Brood Nest';
        this.state.swarmRiskScore = 14;
        break;
    }

    this.state.timestamp = new Date().toISOString();
    this.state.solarBattery = Math.max(45, Math.min(100, Math.round(94 + jitter(2))));

    // Update history buffers
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.history.labels.push(timeLabel);
    this.history.temperature.push(this.state.temperature);
    this.history.humidity.push(this.state.humidity);
    this.history.weightKg.push(this.state.weightKg);
    this.history.acousticHz.push(this.state.acousticHz);

    if (this.history.labels.length > this.historyLength) {
      this.history.labels.shift();
      this.history.temperature.shift();
      this.history.humidity.shift();
      this.history.weightKg.shift();
      this.history.acousticHz.shift();
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state, this.history);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state, this.history));
  }
}

// Canvas-based real-time Spectrogram / Waveform Renderer
class HiveAcousticVisualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    if (!canvasElement) return;
    this.ctx = canvasElement.getContext('2d');
    this.animationId = null;
    this.phase = 0;
    this.currentFrequency = 215;
    this.start();
  }

  setFrequency(hz) {
    this.currentFrequency = hz;
  }

  start() {
    const draw = () => {
      if (!this.canvas || !this.ctx) return;
      const width = this.canvas.width;
      const height = this.canvas.height;
      const ctx = this.ctx;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw frequency spectrum wave
      const centerY = height / 2;
      const normalizedFreq = this.currentFrequency / 500; // normalize
      const amplitude = Math.min(height * 0.4, 15 + normalizedFreq * 35);
      
      // Gradient wave line
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      if (this.currentFrequency > 420) {
        // Warning: High Swarm Frequency (Amber/Red)
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#ef4444');
      } else if (this.currentFrequency < 140) {
        // Warning: Queenless Drop (Purple/Blue)
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#a855f7');
      } else {
        // Optimal Green / Golden Honey
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#10b981');
      }

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = gradient;

      for (let x = 0; x < width; x++) {
        const angle = (x * 0.04 * (this.currentFrequency / 100)) + this.phase;
        // Superimpose harmonics
        const y = centerY +
          Math.sin(angle) * amplitude * 0.7 +
          Math.sin(angle * 2.1) * amplitude * 0.25 +
          Math.cos(angle * 3.3) * amplitude * 0.15 +
          (Math.random() * 3 - 1.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Overlay frequency badge text
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 13px "DM Mono", monospace';
      ctx.fillText(`${this.currentFrequency} Hz · ${this.currentFrequency > 420 ? 'PRE-SWARM PIPING' : this.currentFrequency < 140 ? 'QUEENLESS ROAR' : 'STEADY FORAGING HUM'}`, 14, 24);

      this.phase += 0.08 + (normalizedFreq * 0.08);
      this.animationId = requestAnimationFrame(draw);
    };

    draw();
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}

// Canvas-based real-time Line Chart renderer for Telemetry Trends
class SimpleTelemetryChart {
  constructor(canvasElement, label, color = '#f59e0b', unit = '°C') {
    this.canvas = canvasElement;
    if (!canvasElement) return;
    this.ctx = canvasElement.getContext('2d');
    this.label = label;
    this.color = color;
    this.unit = unit;
  }

  render(dataPoints, labels) {
    if (!this.canvas || !this.ctx || !dataPoints || dataPoints.length < 2) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const padding = { top: 20, right: 15, bottom: 25, left: 35 };

    ctx.clearRect(0, 0, width, height);

    // Min and Max
    const minVal = Math.min(...dataPoints) * 0.95;
    const maxVal = Math.max(...dataPoints) * 1.05 || 1;
    const range = maxVal - minVal || 1;

    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (plotH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = (maxVal - (range / 3) * i).toFixed(1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px "DM Mono", monospace';
      ctx.fillText(val, 4, y + 3);
    }

    // Gradient fill under curve
    const areaGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    areaGradient.addColorStop(0, this.color + '44');
    areaGradient.addColorStop(1, this.color + '00');

    // Draw curve
    ctx.beginPath();
    const stepX = plotW / (dataPoints.length - 1);
    dataPoints.forEach((val, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + (1 - (val - minVal) / range) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Area close
    ctx.lineTo(padding.left + (dataPoints.length - 1) * stepX, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Current latest point dot
    const lastX = padding.left + (dataPoints.length - 1) * stepX;
    const lastY = padding.top + (1 - (dataPoints[dataPoints.length - 1] - minVal) / range) * plotH;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

if (typeof window !== 'undefined') {
  window.HiveTelemetrySimulator = HiveTelemetrySimulator;
  window.HiveAcousticVisualizer = HiveAcousticVisualizer;
  window.SimpleTelemetryChart = SimpleTelemetryChart;
}
