import React, { useState } from 'react';
import { 
  X, 
  Coffee, 
  Heart, 
  Smile, 
  Send, 
  Sparkles, 
  Lightbulb, 
  Plus,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LoungeKudo, TeamMember } from '../types/workflow';
import { soundFx } from '../utils/audio';

interface LoungeModalProps {
  kudos: LoungeKudo[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onClose: () => void;
  onAddKudo: (kudo: LoungeKudo) => void;
  onAddIdeaTask: (ideaTitle: string) => void;
}

export const LoungeModal: React.FC<LoungeModalProps> = ({
  kudos,
  teamMembers,
  currentUser,
  onClose,
  onAddKudo,
  onAddIdeaTask,
}) => {
  const [recipient, setRecipient] = useState(teamMembers[1]?.name || '');
  const [message, setMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💖');
  const [ideaText, setIdeaText] = useState('');
  const [activeTab, setActiveTab] = useState<'kudos' | 'ideation'>('kudos');

  const handleSendKudo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    soundFx.playChime(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });

    const newKudo: LoungeKudo = {
      id: `kd-${Date.now()}`,
      from: currentUser.name,
      to: recipient,
      message: message.trim(),
      timeAgo: '방금 전',
      emoji: selectedEmoji,
    };

    onAddKudo(newKudo);
    setMessage('');
  };

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    soundFx.playKeyClick();
    onAddIdeaTask(ideaText.trim());
    setIdeaText('');
    alert('새 아이디어가 워크플로우 1단계(아이디어 발의)에 등록되었습니다! 💡');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
        
        {/* Cozy Pastel Blue & Cream Header */}
        <div className="bg-gradient-to-r from-blue-100 via-sky-100 to-indigo-100 p-5 text-slate-800 flex items-center justify-between border-b border-blue-200/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-blue-200">
              🐱
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                <span>고양이 소파 & 힐링 라운지</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <h2 className="text-base font-bold text-slate-900">팀 칭찬 보드 & 아이디어 룸</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-600 transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('kudos')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'kudos' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            동료 칭찬 보드 (Kudos Wall)
            {activeTab === 'kudos' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ideation')}
            className={`pb-3 text-xs font-bold transition-all relative ${
              activeTab === 'ideation' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            자유 아이디어 발의 (Ideation)
            {activeTab === 'ideation' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5">
          {activeTab === 'kudos' ? (
            <>
              {/* Kudos Feed */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {kudos.map((kudo) => (
                  <div
                    key={kudo.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3 hover:bg-white hover:shadow-xs transition-all"
                  >
                    <span className="text-2xl shrink-0 p-1 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      {kudo.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          {kudo.from} → <span className="text-blue-600">{kudo.to}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {kudo.timeAgo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {kudo.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Send Kudo Form */}
              <form onSubmit={handleSendKudo} className="p-4 bg-blue-50/50 border border-blue-200/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">팀원에게 응원 메시지 남기기</span>
                  <div className="flex items-center gap-1">
                    {['💖', '🌸', '☕', '⚡', '🚀', '🍰'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setSelectedEmoji(em)}
                        className={`w-6 h-6 rounded-md text-xs flex items-center justify-center transition-transform ${
                          selectedEmoji === em ? 'scale-125 bg-white shadow-xs' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        To: {m.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    required
                    placeholder="따뜻한 감사나 칭찬 한마디를 적어보세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>칭찬 전달</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Ideation form */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">새로운 기능 아이디어 제안</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  라운지 소파에서 떠오른 반짝이는 아이디어를 자유롭게 남겨보세요. 바로 워크플로우 1단계(아이디어 발의)로 이동합니다.
                </p>
              </div>

              <form onSubmit={handleCreateIdea} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="예: 팀원들의 일일 집중 시간을 시각화하는 위젯 추가 아이디어..."
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>아이디어 등록하기</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>🐱 하얀 고양이 쿠션이 팀원들을 응원합니다</span>
          <button
            onClick={onClose}
            className="font-semibold text-slate-800 hover:underline"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
