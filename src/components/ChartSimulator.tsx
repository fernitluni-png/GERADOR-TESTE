import React, { useState, useEffect, useMemo } from "react";
import { Play, Pause, RotateCcw, TrendingUp, Info } from "lucide-react";

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartSimulatorProps {
  code: string;
  overlay: boolean;
  scriptName: string;
}

export function ChartSimulator({ code, overlay, scriptName }: ChartSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [candles, setCandles] = useState<Candle[]>([]);

  // Generate initial simulated price candles
  useEffect(() => {
    const initialCandles: Candle[] = [];
    let price = 100.0;
    const now = Date.now();
    for (let i = 40; i >= 0; i--) {
      const change = (Math.random() - 0.49) * 1.8;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * 0.8;
      const low = Math.min(open, close) - Math.random() * 0.8;
      const volume = Math.floor(Math.random() * 500 + 100);
      price = close;
      initialCandles.push({
        time: new Date(now - i * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });
    }
    setCandles(initialCandles);
  }, []);

  // Live simulation tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.48) * 1.2;
        const open = last.close;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 0.5;
        const low = Math.min(open, close) - Math.random() * 0.5;
        const newCandle: Candle = {
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2)),
          volume: Math.floor(Math.random() * 400 + 100),
        };
        return [...prev.slice(1), newCandle];
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute mock indicator lines based on script code keywords
  const indicatorData = useMemo(() => {
    if (candles.length === 0) return { maFast: [], maSlow: [], osc: [], signals: [] };

    // Simple moving averages
    const ma9: number[] = [];
    const ma21: number[] = [];
    const osc: number[] = [];
    const signals: { index: number; type: "call" | "put"; price: number }[] = [];

    for (let i = 0; i < candles.length; i++) {
      // 9 MA
      const slice9 = candles.slice(Math.max(0, i - 8), i + 1);
      const avg9 = slice9.reduce((acc, c) => acc + c.close, 0) / slice9.length;
      ma9.push(Number(avg9.toFixed(2)));

      // 21 MA
      const slice21 = candles.slice(Math.max(0, i - 20), i + 1);
      const avg21 = slice21.reduce((acc, c) => acc + c.close, 0) / slice21.length;
      ma21.push(Number(avg21.toFixed(2)));

      // Simulated oscillator (like RSI / MACD)
      const diff = (avg9 - avg21) * 3;
      const oscVal = 50 + diff * 8;
      osc.push(Number(Math.max(10, Math.min(90, oscVal)).toFixed(1)));

      // Signal triggers
      if (i > 2) {
        if (ma9[i] > ma21[i] && ma9[i - 1] <= ma21[i - 1]) {
          signals.push({ index: i, type: "call", price: candles[i].low - 0.4 });
        } else if (ma9[i] < ma21[i] && ma9[i - 1] >= ma21[i - 1]) {
          signals.push({ index: i, type: "put", price: candles[i].high + 0.4 });
        }
      }
    }

    return { maFast: ma9, maSlow: ma21, osc, signals };
  }, [candles]);

  // Min / Max for SVG chart scaling
  const { minPrice, maxPrice } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 90, maxPrice: 110 };
    let min = Infinity;
    let max = -Infinity;
    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });
    const pad = (max - min) * 0.1 || 1;
    return { minPrice: min - pad, maxPrice: max + pad };
  }, [candles]);

  const svgWidth = 720;
  const mainHeight = overlay ? 280 : 200;
  const subHeight = overlay ? 0 : 90;
  const totalHeight = mainHeight + subHeight;

  const candleWidth = 10;
  const gap = svgWidth / Math.max(candles.length, 1);

  const getY = (val: number) => {
    const range = maxPrice - minPrice || 1;
    return mainHeight - ((val - minPrice) / range) * (mainHeight - 30) - 15;
  };

  const getOscY = (val: number) => {
    // 0 to 100 scaled to subHeight
    const top = mainHeight + 10;
    const h = subHeight - 20;
    return top + h - (val / 100) * h;
  };

  return (
    <div id="qcs-chart-simulator" className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">{scriptName || "Simulador IQ Option"}</span>
          <span
            className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
              overlay
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
            }`}
          >
            {overlay ? "overlay = true (Gráfico Principal)" : "overlay = false (Painel Separado)"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all text-xs ${
              isPlaying
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pausar Ticks
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Simular Ticks
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCandles((prev) => [...prev]);
            }}
            title="Resetar visualização"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative p-2 bg-[#0b0f19] flex justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${totalHeight}`}
          className="w-full h-auto max-h-[360px] select-none"
        >
          <defs>
            <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          {[0.25, 0.5, 0.75].map((pct, i) => (
            <line
              key={i}
              x1="0"
              y1={mainHeight * pct}
              x2={svgWidth}
              y2={mainHeight * pct}
              stroke="#1e293b"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Candle Bars */}
          {candles.map((candle, i) => {
            const x = i * gap + gap / 2;
            const isBull = candle.close >= candle.open;
            const yHigh = getY(candle.high);
            const yLow = getY(candle.low);
            const yOpen = getY(candle.open);
            const yClose = getY(candle.close);
            const yBodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2);
            const color = isBull ? "#10b981" : "#ef4444";

            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={yBodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx="1"
                />
              </g>
            );
          })}

          {/* Overlay Indicators: EMAs & Moving Averages */}
          {overlay && indicatorData.maFast.length > 0 && (
            <>
              <polyline
                fill="none"
                stroke="#00e5ff"
                strokeWidth="2"
                points={indicatorData.maFast
                  .map((val, idx) => `${idx * gap + gap / 2},${getY(val)}`)
                  .join(" ")}
              />
              <polyline
                fill="none"
                stroke="#ff9100"
                strokeWidth="2"
                points={indicatorData.maSlow
                  .map((val, idx) => `${idx * gap + gap / 2},${getY(val)}`)
                  .join(" ")}
              />
            </>
          )}

          {/* Signals (Shapes / Arrows) */}
          {indicatorData.signals.map((sig, idx) => {
            const x = sig.index * gap + gap / 2;
            const y = getY(sig.price);

            if (sig.type === "call") {
              return (
                <g key={idx} transform={`translate(${x}, ${y + 10})`}>
                  <polygon points="0,-8 -6,4 6,4" fill="#00e676" />
                  <text
                    x="0"
                    y="14"
                    fill="#00e676"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    CALL
                  </text>
                </g>
              );
            } else {
              return (
                <g key={idx} transform={`translate(${x}, ${y - 12})`}>
                  <polygon points="0,8 -6,-4 6,-4" fill="#ff1744" />
                  <text
                    x="0"
                    y="-8"
                    fill="#ff1744"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    PUT
                  </text>
                </g>
              );
            }
          })}

          {/* Sub-window Oscillator (When overlay = false) */}
          {!overlay && (
            <g>
              {/* Divider */}
              <line
                x1="0"
                y1={mainHeight}
                x2={svgWidth}
                y2={mainHeight}
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* Reference Levels 70 and 30 */}
              <line
                x1="0"
                y1={getOscY(70)}
                x2={svgWidth}
                y2={getOscY(70)}
                stroke="#ef4444"
                strokeOpacity="0.4"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text x="8" y={getOscY(70) - 2} fill="#ef4444" fontSize="8">
                70 Sobrecompra
              </text>

              <line
                x1="0"
                y1={getOscY(30)}
                x2={svgWidth}
                y2={getOscY(30)}
                stroke="#10b981"
                strokeOpacity="0.4"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text x="8" y={getOscY(30) + 9} fill="#10b981" fontSize="8">
                30 Sobrevenda
              </text>

              {/* Subwindow Indicator Line */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                points={indicatorData.osc
                  .map((val, idx) => `${idx * gap + gap / 2},${getOscY(val)}`)
                  .join(" ")}
              />

              {/* Mini Histogram Bars */}
              {indicatorData.osc.map((val, idx) => {
                const x = idx * gap + gap / 2;
                const hVal = val - 50;
                const yBase = getOscY(50);
                const yTop = getOscY(val);
                const isPos = hVal >= 0;
                return (
                  <rect
                    key={idx}
                    x={x - 2}
                    y={isPos ? yTop : yBase}
                    width="4"
                    height={Math.max(Math.abs(yTop - yBase), 1)}
                    fill={isPos ? "#22c55e" : "#ef4444"}
                    opacity="0.45"
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Simulator Bottom Bar */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {overlay
              ? "Modo Overlay: Indicador renderizado diretamente sobre as velas de preço na IQ Option."
              : "Modo Painel Separado: Indicador renderizado na subjanela abaixo do gráfico na IQ Option."}
          </span>
        </div>
        <span className="font-mono text-slate-500">Último Fechamento: {candles[candles.length - 1]?.close || 100.0}</span>
      </div>
    </div>
  );
}
