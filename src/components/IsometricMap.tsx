import React, { useState } from 'react';
import { 
  Maximize2, 
  Sparkles, 
  Users, 
  Flame, 
  Coffee, 
  Laptop, 
  CheckCircle2, 
  MapPin, 
  ChevronRight,
  Info
} from 'lucide-react';
import { OfficeZone, TeamMember, WorkflowTask } from '../types/workflow';
import { soundFx } from '../utils/audio';

interface IsometricMapProps {
  zones: OfficeZone[];
  tasks: WorkflowTask[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
  onSelectZone: (zone: OfficeZone) => void;
  onMoveCurrentUserToZone: (zoneId: OfficeZone['id']) => void;
  lightingMode: 'day' | 'sunset' | 'night';
}

export const IsometricMap: React.FC<IsometricMapProps> = ({
  zones,
  tasks,
  teamMembers,
  currentUser,
  onSelectZone,
  onMoveCurrentUserToZone,
  lightingMode,
}) => {
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Lighting overlay styles
  const lightingStyle = {
    day: 'bg-transparent',
    sunset: 'bg-amber-500/10 mix-blend-color-burn',
    night: 'bg-indigo-950/25 mix-blend-multiply',
  }[lightingMode];

  const getZoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'Users': return <Users className="w-4 h-4 text-sky-600" />;
      case 'Flame': return <Flame className="w-4 h-4 text-amber-600" />;
      case 'Coffee': return <Coffee className="w-4 h-4 text-purple-600" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default: return <MapPin className="w-4 h-4 text-slate-600" />;
    }
  };

  // Specific position coordinates mapped accurately to the 1000x680 illustration
  const zoneCoordsMap: Record<string, { top: string; left: string; width: string; height: string }> = {
    meeting_booth: { top: '3%', left: '38%', width: '25%', height: '37%' },
    window_desk: { top: '23%', left: '7%', width: '31%', height: '31%' },
    center_desk: { top: '44%', left: '32%', width: '32%', height: '37%' },
    sofa_lounge: { top: '53%', left: '3%', width: '32%', height: '39%' },
    pantry: { top: '10%', left: '64%', width: '30%', height: '48%' },
    notice_board: { top: '56%', left: '63%', width: '32%', height: '38%' },
  };

  return (
    <div className="space-y-4">
      {/* Top Banner info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-base font-bold text-slate-900">팀플레이월드 가상 오피스</h2>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">실시간 협업 맵</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            오피스 구역을 클릭하여 해당 구역의 워크플로우 태스크, 뽀모도로 포커스 타이머, 또는 회의실을 실행하세요.
          </p>
        </div>

        {/* Quick Location Badge */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
          <span className="text-slate-400">현재 위치:</span>
          <span className="font-semibold text-slate-800">
            {zones.find((z) => z.id === currentUser.currentZone)?.title || '메인 협업 데스크'}
          </span>
        </div>
      </div>

      {/* Main Isometric Virtual Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md">
        
        {/* The Base Pixel Art Asset */}
        <div className="relative w-full aspect-[16/10.5] sm:aspect-[16/10.2] overflow-hidden">
          <img
            src="/assets/aistudio/______________e8f77273.png"
            alt="TeamPlay World Isometric Office"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none pointer-events-none"
            style={{ imageRendering: 'auto' }}
          />

          {/* Ambience Lighting Filter Layer */}
          <div className={`absolute inset-0 transition-colors duration-700 pointer-events-none ${lightingStyle}`} />

          {/* Interactive Zone Hotspots Overlay */}
          {zones.map((zone) => {
            const coords = zoneCoordsMap[zone.id] || { top: '50%', left: '50%', width: '20%', height: '20%' };
            const isHovered = hoveredZoneId === zone.id;
            const zoneTasks = tasks.filter((t) => t.zone === zone.id || (zone.stageId && t.stage === zone.stageId));
            const zoneMembers = teamMembers.filter((m) => m.currentZone === zone.id);
            const isCurrentZone = currentUser.currentZone === zone.id;

            return (
              <div
                key={zone.id}
                style={{
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                  height: coords.height,
                }}
                onMouseEnter={() => setHoveredZoneId(zone.id)}
                onMouseLeave={() => setHoveredZoneId(null)}
                onClick={() => {
                  soundFx.playKeyClick();
                  onSelectZone(zone);
                }}
                className={`absolute cursor-pointer transition-all duration-300 rounded-xl group ${
                  isHovered 
                    ? 'ring-2 ring-blue-500 bg-blue-500/15 shadow-lg z-20' 
                    : isCurrentZone 
                    ? 'ring-1 ring-blue-400/80 bg-blue-500/5 z-10' 
                    : 'hover:bg-slate-900/5'
                }`}
              >
                {/* Floating Zone Pill Anchor */}
                <div 
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shadow-sm border ${
                    isHovered
                      ? 'bg-blue-600 text-white border-blue-600 scale-105 z-30'
                      : 'bg-white/95 text-slate-800 border-slate-200/90 hover:bg-white'
                  }`}
                >
                  {getZoneIcon(zone.iconName)}
                  <span>{zone.title}</span>
                  {zoneTasks.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isHovered ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {zoneTasks.length}
                    </span>
                  )}
                </div>

                {/* Team Members In this Zone (Mini Avatars Floating) */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 flex-wrap pointer-events-none">
                  {zoneMembers.map((member) => (
                    <div
                      key={member.id}
                      title={`${member.name} (${member.role})`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs border bg-white ${
                        member.id === currentUser.id ? 'ring-2 ring-blue-500 border-blue-300' : 'border-slate-300'
                      }`}
                    >
                      {member.avatarEmoji}
                    </div>
                  ))}
                </div>

                {/* Hover Quick Action Tooltip Card */}
                {isHovered && (
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 w-48 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-2.5 text-left z-40 pointer-events-none">
                    <p className="text-[11px] font-bold text-slate-900">{zone.title}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{zone.description}</p>
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-blue-600">
                      <span>{zoneTasks.length}개 태스크 대기</span>
                      <span className="flex items-center">
                        열기 <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Zone Navigator Grid (Accessibility & Direct Access) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {zones.map((zone) => {
          const zoneTasks = tasks.filter((t) => t.zone === zone.id || (zone.stageId && t.stage === zone.stageId));
          const zoneMembers = teamMembers.filter((m) => m.currentZone === zone.id);
          const isCurrent = currentUser.currentZone === zone.id;

          return (
            <div
              key={zone.id}
              onClick={() => {
                soundFx.playKeyClick();
                onSelectZone(zone);
              }}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                isCurrent 
                  ? 'bg-blue-50/70 border-blue-300 shadow-xs' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                  {getZoneIcon(zone.iconName)}
                </div>
                <span className="text-xs font-bold text-slate-500 tabular-nums">
                  {zoneTasks.length}개
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 truncate">{zone.title}</h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{zone.subtitle}</p>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  {zoneMembers.length > 0 ? `${zoneMembers.length}명 참여` : '빈 자리'}
                </span>
                {isCurrent ? (
                  <span className="text-blue-600 font-semibold text-[10px]">내 자리</span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playKeyClick();
                      onMoveCurrentUserToZone(zone.id);
                    }}
                    className="text-[10px] text-slate-500 hover:text-blue-600 font-medium hover:underline"
                  >
                    이동
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
