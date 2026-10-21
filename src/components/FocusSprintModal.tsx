import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Volume2, 
  VolumeX, 
  CheckCircle,
  Coffee,
  Sparkles,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkflowTask } from '../types/workflow';
import { soundFx } from '../utils/audio';

interface FocusSprintModalProps {
  tasks: WorkflowTask[];
  onClose: () => void;
  onCompleteTask?: (taskId: string) => void;
  isAmbienceActive: boolean;
  onToggleAmbience: () => void;
}

export const FocusSprintModal: React.FC<FocusSprintModalProps> = ({
  tasks,
  onClose,
  onCompleteTask,
  isAmbienceActive,
  onToggleAmbience,
}) => {
  const inProgressTasks = tasks.filter((t) => t.stage === 'in_progress');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(inProgressTasks[0]?.id || '');
  
  // Pomodoro timer state
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(2);

  const totalTime = timerMode === 'work' ? 25 * 60 : 5 * 60;
  const progressPercent = Math.round(((totalTime - timeLeft) / totalTime) * 100);

  useEffect(() => {
    let timer: number | null = null;
    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      soundFx.playChime(true);
      confetti({ particleCount: 50, spread: 60 });
      if (timerMode === 'work') {
        setCompletedSessions((c) => c + 1);
        setTimerMode('break');
        setTimeLeft(5 * 60);
      } else {
        setTimerMode('work');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, timerMode]);

  const handleToggleTimer = () => {
    soundFx.playKeyClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    soundFx.playKeyClick();
    setIsRunning(false);
    setTimeLeft(timerMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const handleSwitchMode = (mode: 'work' | 'break') => {
    soundFx.playKeyClick();
    setTimerMode(mode);
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl">
        
        {/* Scenic Window Header Preview */}
        <div className="relative h-28 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 p-4 flex flex-col justify-between text-white overflow-hidden">
          {/* Subtle cherry blossom city skyline aesthetic backdrop */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
          
          <div className="relative flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/20 backdrop-blur-xs">
                <Flame className="w-4 h-4 text-amber-200" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-100">
                창가 포커스 존 · 딥워크 룸
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10">
            <h2 className="text-base font-bold">도심 창가 뽀모도로 포커스 타이머</h2>
            <p className="text-[11px] text-sky-100">
              탁 트인 벚꽃 도심 전망을 보며 25분 집중 스프린트를 시작하세요.
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          
          {/* Mode Tabs */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => handleSwitchMode('work')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  timerMode === 'work' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                집중 작업 (25분)
              </button>
              <button
                onClick={() => handleSwitchMode('break')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  timerMode === 'break' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                휴식 (5분)
              </button>
            </div>
          </div>

          {/* Big Circular Clock Display */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* SVG Ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-100"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-500 ${
                    timerMode === 'work' ? 'stroke-blue-600' : 'stroke-emerald-500'
                  }`}
                  strokeWidth="6"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Time Numbers */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs font-medium text-slate-400 mt-1">
                  {timerMode === 'work' ? 'Sprint In-Progress' : 'Refresh Break'}
                </span>
              </div>
            </div>

            {/* Play/Pause/Reset Controls */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleReset}
                title="타이머 리셋"
                className="p-2.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleTimer}
                className={`px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-sm text-white transition-all ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : timerMode === 'work'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> 일시정지
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> 스프린트 시작
                  </>
                )}
              </button>

              <button
                onClick={onToggleAmbience}
                title={isAmbienceActive ? '오피스 사운드 끄기' : '소프트 오피스 앰비언트 켜기'}
                className={`p-2.5 rounded-full border transition-colors ${
                  isAmbienceActive
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
              >
                {isAmbienceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active Task Selector */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-500">현재 집중 태스크 연동:</span>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.stage}] {t.title}
                </option>
              ))}
            </select>

            {activeTask && (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                목표: {activeTask.description}
              </p>
            )}
          </div>

          {/* Sessions Stat */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>오늘 완료한 뽀모도로 세션</span>
            <span className="font-bold text-slate-800 tabular-nums">
              🍅 {completedSessions}회 완료 (총 {completedSessions * 25}분)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
