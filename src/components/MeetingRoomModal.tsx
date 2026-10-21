import React, { useState } from 'react';
import { 
  X, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus, 
  FileText, 
  Heart,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { MeetingAgendaItem, TeamMember } from '../types/workflow';
import { soundFx } from '../utils/audio';

interface MeetingRoomModalProps {
  agenda: MeetingAgendaItem[];
  teamMembers: TeamMember[];
  onClose: () => void;
  onUpdateAgenda: (updated: MeetingAgendaItem[]) => void;
  onConvertToTask: (title: string) => void;
}

export const MeetingRoomModal: React.FC<MeetingRoomModalProps> = ({
  agenda,
  teamMembers,
  onClose,
  onUpdateAgenda,
  onConvertToTask,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPresenter, setNewPresenter] = useState(teamMembers[0]?.name || '');
  const [newDuration, setNewDuration] = useState(15);
  const [meetingNotes, setMeetingNotes] = useState(
    '1. 2.0 릴리즈 핵심 일정: 이번 주 금요일 배포 목표.\n2. 워크플로우 맵의 인터랙션 반응 속도 최적화 요망.\n3. QA 테스트 시나리오에 엣지 케이스 포함 필요.'
  );

  const handleToggleStatus = (id: string) => {
    soundFx.playKeyClick();
    const updated: MeetingAgendaItem[] = agenda.map((item) => {
      if (item.id === id) {
        const nextStatus: MeetingAgendaItem['status'] =
          item.status === 'pending'
            ? 'in_progress'
            : item.status === 'in_progress'
            ? 'done'
            : 'pending';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    onUpdateAgenda(updated);
  };

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    soundFx.playKeyClick();
    const newItem: MeetingAgendaItem = {
      id: `ag-${Date.now()}`,
      title: newTitle.trim(),
      presenter: newPresenter,
      durationMin: newDuration,
      status: 'pending',
    };
    onUpdateAgenda([...agenda, newItem]);
    setNewTitle('');
  };

  const meetingParticipants = teamMembers.filter((m) => m.currentZone === 'meeting_booth');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        
        {/* Banner with "TEAM PROJECT ♥" like the poster on the glass */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white text-xs text-center border border-white/30 leading-tight">
              TEAM<br/>PROJ
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-100">
                <span>통유리 회의실</span>
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
              </div>
              <h2 className="text-base font-bold">스프린트 기획 & 스크럼 룸</h2>
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
          
          {/* Active Participants in Meeting */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">현재 회의실 참여자</span>
            </div>
            <div className="flex items-center gap-1.5">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  title={`${member.name} (${member.role})`}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 ${
                    member.currentZone === 'meeting_booth'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span>{member.avatarEmoji}</span>
                  <span className="text-[11px]">{member.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">회의 안건 (Agenda)</h3>
              <span className="text-xs text-slate-400">
                클릭하여 진행 상태를 전환하세요
              </span>
            </div>

            <div className="space-y-2">
              {agenda.map((item) => {
                const statusBadge = {
                  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  in_progress: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
                  pending: 'bg-slate-100 text-slate-600 border-slate-200',
                }[item.status];

                const statusText = {
                  done: '완료됨',
                  in_progress: '진행 중',
                  pending: '대기 중',
                }[item.status];

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleStatus(item.id)}
                    className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${statusBadge}`}>
                        {statusText}
                      </div>
                      <div className="truncate">
                        <p className={`text-xs font-bold text-slate-900 truncate ${item.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          발표: {item.presenter} · 예상 {item.durationMin}분
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConvertToTask(item.title);
                        alert(`'${item.title}' 안건이 워크플로우 기획 단계에 등록되었습니다!`);
                      }}
                      title="워크플로우 태스크로 등록"
                      className="px-2 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                    >
                      + 태스크화
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Agenda Item Form */}
            <form onSubmit={handleAddAgenda} className="flex flex-col sm:flex-row items-stretch gap-2 pt-2">
              <input
                type="text"
                placeholder="새 회의 안건 입력..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <select
                value={newPresenter}
                onChange={(e) => setNewPresenter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name.split(' ')[0]}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shrink-0"
              >
                안건 추가
              </button>
            </form>
          </div>

          {/* Shared Meeting Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>실시간 스크럼 회의록 & 액션 아이템</span>
            </div>
            <textarea
              rows={4}
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            회의 종료 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
