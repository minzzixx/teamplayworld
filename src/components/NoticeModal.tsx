import React, { useState } from 'react';
import { 
  X, 
  Pin, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Plus, 
  FileText 
} from 'lucide-react';
import { SprintNotice, WorkflowTask } from '../types/workflow';
import { soundFx } from '../utils/audio';

interface NoticeModalProps {
  notices: SprintNotice[];
  tasks: WorkflowTask[];
  onClose: () => void;
  onAddNotice: (notice: SprintNotice) => void;
  onSelectTask: (task: WorkflowTask) => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  notices,
  tasks,
  onClose,
  onAddNotice,
  onSelectTask,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedTasks = tasks.filter((t) => t.stage === 'completed');
  const completionRate = Math.round((completedTasks.length / (tasks.length || 1)) * 100);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    soundFx.playChime(true);
    const newNotice: SprintNotice = {
      id: `nt-${Date.now()}`,
      title: newTitle.trim(),
      author: '팀 리드',
      date: new Date().toISOString().split('T')[0],
      pinned: false,
      content: newContent.trim(),
    };

    onAddNotice(newNotice);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-100">
                <span>입구 파티션 공지보드</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <h2 className="text-base font-bold">스프린트 성과 & 공지 허브</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Sprint Velocity KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-400">스프린트 달성률</span>
              <p className="text-xl font-extrabold text-emerald-600 mt-1 tabular-nums">
                {completionRate}%
              </p>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-400">배포 완료 태스크</span>
              <p className="text-xl font-extrabold text-slate-800 mt-1 tabular-nums">
                {completedTasks.length} / {tasks.length} 개
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">모든 테스트 통과</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-400">진행 중인 집중 작업</span>
              <p className="text-xl font-extrabold text-blue-600 mt-1 tabular-nums">
                {tasks.filter((t) => t.stage === 'in_progress').length} 개
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">메인 & 창가 데스크</span>
            </div>
          </div>

          {/* Notices List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">팀 공식 공지사항</h3>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {isAdding ? '취소' : '+ 새 공지 작성'}
              </button>
            </div>

            {/* Add notice form */}
            {isAdding && (
              <form onSubmit={handleCreateNotice} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <input
                  type="text"
                  required
                  placeholder="공지 제목 입력..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <textarea
                  rows={3}
                  required
                  placeholder="공지 내용 작성..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                  >
                    공지 등록
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    notice.pinned
                      ? 'bg-amber-50/50 border-amber-200 shadow-2xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {notice.pinned && <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />}
                      <h4 className="text-xs font-bold text-slate-900">{notice.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {notice.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {notice.content}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>작성자: {notice.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Tasks Highlight */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900">배포 완료된 최근 태스크 목록</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {completedTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    soundFx.playKeyClick();
                    onSelectTask(t);
                  }}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{t.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 tabular-nums">
                    {t.dueDate} 완료
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
