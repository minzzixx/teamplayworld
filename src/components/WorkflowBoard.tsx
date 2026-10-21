import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Search, 
  Clock, 
  CheckSquare, 
  AlertCircle, 
  Filter,
  Check,
  User,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeamMember, WorkflowStage, WorkflowStageId, WorkflowTask } from '../types/workflow';
import { soundFx } from '../utils/audio';

interface WorkflowBoardProps {
  stages: WorkflowStage[];
  tasks: WorkflowTask[];
  teamMembers: TeamMember[];
  onSelectTask: (task: WorkflowTask) => void;
  onMoveTaskStage: (taskId: string, targetStage: WorkflowStageId) => void;
  onOpenNewTaskWithStage?: (stageId: WorkflowStageId) => void;
}

export const WorkflowBoard: React.FC<WorkflowBoardProps> = ({
  stages,
  tasks,
  teamMembers,
  onSelectTask,
  onMoveTaskStage,
  onOpenNewTaskWithStage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAssignee = selectedAssignee === 'all' || task.assigneeId === selectedAssignee;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;

    return matchesSearch && matchesAssignee && matchesPriority;
  });

  const getPriorityStyle = (priority: WorkflowTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'high':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'medium':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'low':
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getPriorityLabel = (priority: WorkflowTask['priority']) => {
    switch (priority) {
      case 'urgent': return '긴급';
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
    }
  };

  const handleAdvance = (e: React.MouseEvent, task: WorkflowTask) => {
    e.stopPropagation();
    const currentIndex = stages.findIndex((s) => s.id === task.stage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1].id;
      if (nextStage === 'completed') {
        soundFx.playChime(true);
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.6 },
        });
      } else {
        soundFx.playKeyClick();
      }
      onMoveTaskStage(task.id, nextStage);
    }
  };

  const handleRewind = (e: React.MouseEvent, task: WorkflowTask) => {
    e.stopPropagation();
    const currentIndex = stages.findIndex((s) => s.id === task.stage);
    if (currentIndex > 0) {
      soundFx.playKeyClick();
      const prevStage = stages[currentIndex - 1].id;
      onMoveTaskStage(task.id, prevStage);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Workflow Process Flow Banner (Mechanism-to-Outcome Chain) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">팀플레이 워크플로우 파이프라인</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              아이디어 제안에서 기획 회의, 집중 구현, 동료 리뷰를 거쳐 최종 배포까지 이어지는 5단계 표준 흐름
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>총 {tasks.length}개 작업</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-emerald-600">
              {tasks.filter((t) => t.stage === 'completed').length}개 완료 (
              {Math.round((tasks.filter((t) => t.stage === 'completed').length / (tasks.length || 1)) * 100)}%)
            </span>
          </div>
        </div>

        {/* Visual Workflow Steps Chain */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-4">
          {stages.map((stage, idx) => {
            const count = tasks.filter((t) => t.stage === stage.id).length;
            return (
              <div 
                key={stage.id} 
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
              >
                <div 
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[10px]"
                  style={{ backgroundColor: stage.color }}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{stage.name.split('. ')[1] || stage.name}</p>
                  <p className="text-[11px] text-slate-400 tabular-nums">{count}개 진행 중</p>
                </div>
                {idx < stages.length - 1 && (
                  <ArrowRight className="hidden lg:block w-3 h-3 text-slate-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="태스크명, 설명 또는 태그 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">전체 담당자</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.avatarEmoji} {m.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">전체 우선순위</option>
            <option value="urgent">긴급 (Urgent)</option>
            <option value="high">높음 (High)</option>
            <option value="medium">보통 (Medium)</option>
            <option value="low">낮음 (Low)</option>
          </select>
        </div>
      </div>

      {/* Workflow Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {stages.map((stage, stageIndex) => {
          const stageTasks = filteredTasks.filter((t) => t.stage === stage.id);

          return (
            <div
              key={stage.id}
              className="bg-slate-100/90 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-h-[480px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    {stage.name}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 tabular-nums px-2 py-0.5 bg-white rounded-md border border-slate-200 shadow-2xs">
                  {stageTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-0.5">
                {stageTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl text-center p-3 text-slate-400">
                    <p className="text-xs font-medium">대기 중인 태스크 없음</p>
                    <button
                      onClick={() => onOpenNewTaskWithStage?.(stage.id)}
                      className="mt-2 text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      + 첫 태스크 등록
                    </button>
                  </div>
                ) : (
                  stageTasks.map((task) => {
                    const assignee = teamMembers.find((m) => m.id === task.assigneeId);
                    const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                    const totalSubtasks = task.subtasks.length;
                    const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          soundFx.playKeyClick();
                          onSelectTask(task);
                        }}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                      >
                        {/* Top: Priority & Code */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityStyle(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                            {task.id}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1.5">
                          {task.title}
                        </h4>

                        {/* Description Preview */}
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                          {task.description}
                        </p>

                        {/* Subtasks Progress Bar if any */}
                        {totalSubtasks > 0 && (
                          <div className="mb-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span className="flex items-center gap-1 font-medium">
                                <CheckSquare className="w-3 h-3 text-slate-400" />
                                서브태스크
                              </span>
                              <span className="tabular-nums font-semibold">
                                {completedSubtasks}/{totalSubtasks} ({subtaskPercent}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  subtaskPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${subtaskPercent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mb-3 text-[10px] text-slate-500">
                            {task.tags.map((tag) => (
                              <span key={tag} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer: Assignee & Stage Navigator buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          {/* Assignee Avatar */}
                          <div className="flex items-center gap-1.5" title={assignee?.name}>
                            <span className="text-xs">{assignee?.avatarEmoji || '👤'}</span>
                            <span className="text-[11px] font-medium text-slate-700 truncate max-w-[70px]">
                              {assignee?.name.split(' ')[0] || '미배정'}
                            </span>
                          </div>

                          {/* Quick Workflow Stage Mover Arrows */}
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {stageIndex > 0 && (
                              <button
                                title="이전 단계로 이동"
                                onClick={(e) => handleRewind(e, task)}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {stageIndex < stages.length - 1 && (
                              <button
                                title="다음 워크플로우 단계로 승급"
                                onClick={(e) => handleAdvance(e, task)}
                                className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[10px] transition-colors"
                              >
                                <span>다음</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                            {stageIndex === stages.length - 1 && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> 완료됨
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Add Button at bottom of column */}
              <button
                onClick={() => onOpenNewTaskWithStage?.(stage.id)}
                className="mt-3 w-full py-2 flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white/60 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>태스크 추가</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
