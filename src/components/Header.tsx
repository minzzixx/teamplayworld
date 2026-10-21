import React from 'react';
import { Volume2, VolumeX, Sun, Sunset, Moon, Plus, Sparkles, Building2 } from 'lucide-react';
import { TeamMember } from '../types/workflow';

interface HeaderProps {
  activeView: 'map' | 'workflow' | 'focus' | 'meeting' | 'lounge';
  setActiveView: (view: 'map' | 'workflow' | 'focus' | 'meeting' | 'lounge') => void;
  onOpenNewTask: () => void;
  currentUser: TeamMember;
  setCurrentUser: (member: TeamMember) => void;
  teamMembers: TeamMember[];
  isAmbienceActive: boolean;
  onToggleAmbience: () => void;
  lightingMode: 'day' | 'sunset' | 'night';
  setLightingMode: (mode: 'day' | 'sunset' | 'night') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenNewTask,
  currentUser,
  setCurrentUser,
  teamMembers,
  isAmbienceActive,
  onToggleAmbience,
  lightingMode,
  setLightingMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <span 
            onClick={() => setActiveView('map')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap cursor-pointer hover:text-blue-600 transition-colors"
          >
            TeamPlay World
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean Single-Line Controls) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveView('map')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              activeView === 'map' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            오피스 맵
            {activeView === 'map' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveView('workflow')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              activeView === 'workflow' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            워크플로우 보드
            {activeView === 'workflow' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveView('focus')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              activeView === 'focus' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            창가 포커스존
            {activeView === 'focus' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveView('meeting')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              activeView === 'meeting' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            프로젝트 회의실
            {activeView === 'meeting' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveView('lounge')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              activeView === 'lounge' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            힐링 라운지
            {activeView === 'lounge' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Lighting Mode Picker */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-slate-600">
            <button
              title="주간 모드"
              onClick={() => setLightingMode('day')}
              className={`p-1.5 rounded-md transition-all ${
                lightingMode === 'day' ? 'bg-white text-amber-500 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              title="석양 모드"
              onClick={() => setLightingMode('sunset')}
              className={`p-1.5 rounded-md transition-all ${
                lightingMode === 'sunset' ? 'bg-white text-orange-500 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              title="야간 모드"
              onClick={() => setLightingMode('night')}
              className={`p-1.5 rounded-md transition-all ${
                lightingMode === 'night' ? 'bg-white text-indigo-500 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Cozy Sound Ambience Toggle */}
          <button
            onClick={onToggleAmbience}
            title={isAmbienceActive ? '오피스 앰비언트 음소거' : '오피스 타이핑/배경음 켜기'}
            className={`p-2 rounded-lg border transition-all ${
              isAmbienceActive 
                ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            {isAmbienceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors">
              <span>{currentUser.avatarEmoji}</span>
              <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 hidden group-hover:block hover:block z-50">
              <div className="px-2 py-1 text-xs font-semibold text-slate-400">팀원 아바타 전환</div>
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setCurrentUser(member)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${
                    currentUser.id === member.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{member.avatarEmoji}</span>
                  <div className="truncate">
                    <p className="font-semibold leading-tight">{member.name}</p>
                    <p className="text-[11px] text-slate-400">{member.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA: Add Task */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">새 태스크</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Tab Navigation */}
      <div className="flex md:hidden border-t border-slate-100 px-4 py-1.5 overflow-x-auto gap-2 bg-slate-50/80">
        <button
          onClick={() => setActiveView('map')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeView === 'map' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
          }`}
        >
          오피스 맵
        </button>
        <button
          onClick={() => setActiveView('workflow')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeView === 'workflow' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
          }`}
        >
          워크플로우
        </button>
        <button
          onClick={() => setActiveView('focus')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeView === 'focus' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
          }`}
        >
          포커스존
        </button>
        <button
          onClick={() => setActiveView('meeting')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeView === 'meeting' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
          }`}
        >
          회의실
        </button>
        <button
          onClick={() => setActiveView('lounge')}
          className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
            activeView === 'lounge' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
          }`}
        >
          라운지
        </button>
      </div>
    </header>
  );
};
