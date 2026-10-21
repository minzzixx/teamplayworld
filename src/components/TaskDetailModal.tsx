import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  CheckSquare, 
  Calendar, 
  Clock, 
  User, 
  Check, 
  Plus, 
  AlertCircle,
  Tag,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeamMember, WorkflowStage, WorkflowStageId, WorkflowTask } from '../types/workflow';
import { soundFx } from '../utils/audio';

interface TaskDetailModalProps {
  task: WorkflowTask | null;
  stages: WorkflowStage[];
  teamMembers: TeamMember[];
  onClose: () => void;
  onUpdateTask: (updated: WorkflowTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  stages,
  teamMembers,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  if (!task) return null;

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const currentStage = stages.find((s) => s.id === task.stage);
  const assignee = teamMembers.find((m) => m.id === task.assigneeId);

  const handleToggleSubtask = (subtaskId: string) => {
    soundFx.playKeyClick();
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    soundFx.playKeyClick();
    const newSt = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    onUpdateTask({ ...task, subtasks: [...task.subtasks, newSt] });
    setNewSubtaskTitle('');
  };

  const handleStageChange = (newStage: WorkflowStageId) => {
    if (newStage === 'completed' && task.stage !== 'completed') {
      soundFx.playChime(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      soundFx.playKeyClick();
    }
    onUpdateTask({ ...task, stage: newStage });
  };

  const completedCount = task.subtasks.filter((s) => s.completed).length;
  const totalCount = task.subtasks.length;
  const subtaskProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 tabular-nums">
              {task.id}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {currentStage?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('이 태스크를 삭제하시겠습니까?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              title="태스크 삭제"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Title & Description */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
              {task.title}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {task.description || '상세 설명이 등록되지 않았습니다.'}
            </p>
          </div>

          {/* Workflow Stage Pipeline Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">워크플로우 단계 이동</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-xl">
              {stages.map((stage) => {
                const isActive = task.stage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => handleStageChange(stage.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all text-center truncate ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {stage.name.split('. ')[1] || stage.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Assignee */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">담당자</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base">{assignee?.avatarEmoji || '👤'}</span>
                <span className="text-xs font-bold text-slate-800">{assignee?.name || '미배정'}</span>
              </div>
            </div>

            {/* Priority */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">우선순위</span>
              <p className="text-xs font-bold text-slate-800">
                {task.priority === 'urgent' && '긴급 (Urgent)'}
                {task.priority === 'high' && '높음 (High)'}
                {task.priority === 'medium' && '보통 (Medium)'}
                {task.priority === 'low' && '낮음 (Low)'}
              </p>
            </div>

            {/* Due Date & Estimate */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">마감 기한</span>
              <p className="text-xs font-bold text-slate-800 tabular-nums">
                {task.dueDate} ({task.estimatedHours}h 예상)
              </p>
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900">서브태스크 체크리스트</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 tabular-nums">
                {completedCount} / {totalCount} 완료 ({subtaskProgress}%)
              </span>
            </div>

            {/* Subtask list */}
            <div className="space-y-2">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleToggleSubtask(st.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    st.completed 
                      ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through' 
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                    st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="flex-1 font-medium">{st.title}</span>
                </div>
              ))}

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="새 서브태스크 입력 후 Enter..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shrink-0"
                >
                  추가
                </button>
              </form>
            </div>
          </div>

          {/* Google Drive Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">연결된 Google Drive 문서 및 파일</h3>
              </div>
              <span className="text-xs text-slate-400">
                {task.driveAttachments?.length || 0}개 파일
              </span>
            </div>

            {task.driveAttachments && task.driveAttachments.length > 0 ? (
              <div className="space-y-1.5">
                {task.driveAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 bg-blue-50/50 border border-blue-200/70 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-blue-600 font-bold">📄</span>
                      <a
                        href={att.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-800 hover:text-blue-600 truncate underline"
                      >
                        {att.name}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={att.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 text-[10px] font-semibold text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        드라이브 열기
                      </a>
                      <button
                        onClick={() => {
                          const updatedAttachments = task.driveAttachments?.filter((a) => a.id !== att.id);
                          onUpdateTask({ ...task, driveAttachments: updatedAttachments });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="연동 해제"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                연결된 Drive 파일이 없습니다. 상단 'Google Drive' 탭에서 파일을 선택해 태스크에 연결할 수 있습니다.
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">태그</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {task.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
