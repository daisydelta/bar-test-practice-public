"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

interface PracticeTimerProps {
  initialMinutes?: number;
  onTimeUpdate?: (secondsElapsed: number) => void;
}

export function PracticeTimer({
  initialMinutes = 15,
  onTimeUpdate,
}: PracticeTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialMinutes * 60
  );
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          const next = prev - 1;
          return next <= 0 ? 0 : next;
        });

        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(elapsedSeconds);
    }
  }, [elapsedSeconds, onTimeUpdate]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const isLowTime = remainingSeconds > 0 && remainingSeconds <= 120;
  const isTimeUp = remainingSeconds === 0;

  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs text-xs font-medium">
      <Clock
        className={`w-3.5 h-3.5 ${
          isLowTime ? "text-red-500 animate-pulse" : "text-slate-500"
        }`}
        aria-hidden="true"
      />

      <span className="text-slate-500">Timer:</span>

      <span
        className={`font-mono text-sm font-semibold ${
          isTimeUp
            ? "text-red-600"
            : isLowTime
            ? "text-red-600 font-bold"
            : "text-slate-900"
        }`}
      >
        {isTimeUp ? "TIME'S UP" : formattedTime}
      </span>

      <button
        type="button"
        onClick={() => setIsRunning((prev) => !prev)}
        className="ml-1 text-slate-500 hover:text-slate-800 p-0.5 rounded transition-colors"
        title={isRunning ? "Pause timer" : "Resume timer"}
      >
        {isRunning ? (
          <Pause className="w-3 h-3" aria-hidden="true" />
        ) : (
          <Play className="w-3 h-3 text-emerald-600" aria-hidden="true" />
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setRemainingSeconds(initialMinutes * 60);
          setElapsedSeconds(0);
          setIsRunning(true);
        }}
        className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
        title="Reset timer"
      >
        <RotateCcw className="w-3 h-3" aria-hidden="true" />
      </button>
    </div>
  );
}
