import React, { useState } from 'react';
import { Header } from './components/Header';
import { IsometricMap } from './components/IsometricMap';
import { WorkflowBoard } from './components/WorkflowBoard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { NewTaskModal } from './components/NewTaskModal';
import { FocusSprintModal } from './components/FocusSprintModal';
import { MeetingRoomModal } from './components/MeetingRoomModal';
import { LoungeModal } from './components/LoungeModal';
import { NoticeModal } from './components/NoticeModal';
import { GoogleDriveHub } from './components/GoogleDriveHub';
import { 
  WORKFLOW_STAGES, 
  OFFICE_ZONES, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_TASKS,
  INITIAL_AGENDA,
  INITIAL_KUDOS,
  INITIAL_NOTICES
} from './data/mockData';
import { 
  OfficeZone, 
  TeamMember, 
  WorkflowStageId, 
  WorkflowTask, 
  MeetingAgendaItem, 
  LoungeKudo, 
  SprintNotice 
} from './types/workflow';
import { DriveFile } from './services/googleDrive';
import { soundFx } from './utils/audio';

export default function App() {
  const [activeView, setActiveView] = useState<'map' | 'workflow' | 'drive' | 'focus' | 'meeting' | 'lounge'>('map');
  const [tasks, setTasks] = useState<WorkflowTask[]>(INITIAL_TASKS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [currentUser, setCurrentUser] = useState<TeamMember>(INITIAL_TEAM_MEMBERS[0]);
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  
  // Modals
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskStage, setNewTaskStage] = useState<WorkflowStageId>('in_progress');
  const [activeSpecialModal, setActiveSpecialModal] = useState<'focus' | 'meeting' | 'lounge' | 'notice' | null>(null);

  // Ambience and Lighting
  const [isAmbienceActive, setIsAmbienceActive] = useState(false);
  const [lightingMode, setLightingMode] = useState<'day' | 'sunset' | 'night'>('day');

  // Interactive Room Data
  const [agenda, setAgenda] = useState<MeetingAgendaItem[]>(INITIAL_AGENDA);
  const [kudos, setKudos] = useState<LoungeKudo[]>(INITIAL_KUDOS);
  const [notices, setNotices] = useState<SprintNotice[]>(INITIAL_NOTICES);

  // Sound ambience toggle
  const handleToggleAmbience = () => {
    const newState = soundFx.toggleAmbience();
    setIsAmbienceActive(newState);
  };

  // Move task to a stage
  const handleMoveTaskStage = (taskId: string, targetStage: WorkflowStageId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const targetZone = WORKFLOW_STAGES.find((s) => s.id === targetStage)?.officeZone || t.zone;
          return { ...t, stage: targetStage, zone: targetZone };
        }
        return t;
      })
    );
  };

  // Update existing task
  const handleUpdateTask = (updated: WorkflowTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  // Create new task
  const handleCreateTask = (newTask: WorkflowTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Open new task modal pre-seeded with stage
  const handleOpenNewTaskWithStage = (stageId: WorkflowStageId) => {
    setNewTaskStage(stageId);
    setIsNewTaskOpen(true);
  };

  // Move current user to a zone on the map
  const handleMoveCurrentUser = (zoneId: OfficeZone['id']) => {
    soundFx.playKeyClick();
    setCurrentUser((prev) => ({ ...prev, currentZone: zoneId }));
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === currentUser.id ? { ...m, currentZone: zoneId } : m))
    );
  };

  // Handle zone click on isometric map
  const handleSelectZone = (zone: OfficeZone) => {
    handleMoveCurrentUser(zone.id);

    // Direct actions based on the zone clicked:
    switch (zone.id) {
      case 'window_desk':
        setActiveSpecialModal('focus');
        break;
      case 'meeting_booth':
        setActiveSpecialModal('meeting');
        break;
      case 'sofa_lounge':
        setActiveSpecialModal('lounge');
        break;
      case 'notice_board':
        setActiveSpecialModal('notice');
        break;
      case 'pantry':
        soundFx.playKeyClick();
        alert('☕ 탕비실 바에서 시원한 아이스 아메리카노를 내렸습니다! (카페인 100% 충전 완료)');
        break;
      case 'center_desk':
      default:
        // Jump to workflow view or open first task
        setActiveView('workflow');
        break;
    }
  };

  // Convert meeting agenda item to a workflow task
  const handleConvertAgendaToTask = (title: string) => {
    const newTask: WorkflowTask = {
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      title,
      description: '회의실 안건에서 생성된 신규 스프린트 기획 태스크입니다.',
      stage: 'planning',
      zone: 'meeting_booth',
      priority: 'high',
      assigneeId: currentUser.id,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ['Meeting', 'Planning'],
      subtasks: [
        { id: `st-${Date.now()}-1`, title: '상세 스펙 문서 작성', completed: false },
        { id: `st-${Date.now()}-2`, title: '실무 팀원 피드백 확인', completed: false },
      ],
      createdAt: new Date().toISOString().split('T')[0],
      commentsCount: 0,
      estimatedHours: 4,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Add idea task from Lounge
  const handleAddIdeaTask = (ideaTitle: string) => {
    const newTask: WorkflowTask = {
      id: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      title: ideaTitle,
      description: '소파 힐링 라운지에서 제안된 신규 기능 아이디어입니다.',
      stage: 'ideation',
      zone: 'sofa_lounge',
      priority: 'medium',
      assigneeId: currentUser.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ['Ideation', 'Lounge'],
      subtasks: [
        { id: `st-${Date.now()}-1`, title: '기능 타당성 조사', completed: false },
        { id: `st-${Date.now()}-2`, title: '스프린트 백로그 포함 여부 결정', completed: false },
      ],
      createdAt: new Date().toISOString().split('T')[0],
      commentsCount: 0,
      estimatedHours: 3,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Link Drive File to a workflow task
  const handleAttachFileToTask = (taskId: string, file: DriveFile) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const currentAttachments = t.driveAttachments || [];
          if (currentAttachments.some((a) => a.id === file.id)) {
            return t;
          }
          return {
            ...t,
            driveAttachments: [
              ...currentAttachments,
              {
                id: file.id,
                name: file.name,
                webViewLink: file.webViewLink || 'https://drive.google.com',
                iconLink: file.iconLink,
                mimeType: file.mimeType,
              },
            ],
          };
        }
        return t;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewTask={() => {
          setNewTaskStage('in_progress');
          setIsNewTaskOpen(true);
        }}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        teamMembers={teamMembers}
        isAmbienceActive={isAmbienceActive}
        onToggleAmbience={handleToggleAmbience}
        lightingMode={lightingMode}
        setLightingMode={setLightingMode}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* View Switcher Container */}
        {activeView === 'map' && (
          <IsometricMap
            zones={OFFICE_ZONES}
            tasks={tasks}
            teamMembers={teamMembers}
            currentUser={currentUser}
            onSelectZone={handleSelectZone}
            onMoveCurrentUserToZone={handleMoveCurrentUser}
            lightingMode={lightingMode}
          />
        )}

        {activeView === 'workflow' && (
          <WorkflowBoard
            stages={WORKFLOW_STAGES}
            tasks={tasks}
            teamMembers={teamMembers}
            onSelectTask={(task) => setSelectedTask(task)}
            onMoveTaskStage={handleMoveTaskStage}
            onOpenNewTaskWithStage={handleOpenNewTaskWithStage}
          />
        )}

        {activeView === 'drive' && (
          <GoogleDriveHub
            tasks={tasks}
            onAttachFileToTask={handleAttachFileToTask}
          />
        )}

        {activeView === 'focus' && (
          <div className="py-4">
            <FocusSprintModal
              tasks={tasks}
              onClose={() => setActiveView('map')}
              isAmbienceActive={isAmbienceActive}
              onToggleAmbience={handleToggleAmbience}
            />
          </div>
        )}

        {activeView === 'meeting' && (
          <div className="py-4">
            <MeetingRoomModal
              agenda={agenda}
              teamMembers={teamMembers}
              onClose={() => setActiveView('map')}
              onUpdateAgenda={setAgenda}
              onConvertToTask={handleConvertAgendaToTask}
            />
          </div>
        )}

        {activeView === 'lounge' && (
          <div className="py-4">
            <LoungeModal
              kudos={kudos}
              teamMembers={teamMembers}
              currentUser={currentUser}
              onClose={() => setActiveView('map')}
              onAddKudo={(newKudo) => setKudos((prev) => [newKudo, ...prev])}
              onAddIdeaTask={handleAddIdeaTask}
            />
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          stages={WORKFLOW_STAGES}
          teamMembers={teamMembers}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {isNewTaskOpen && (
        <NewTaskModal
          stages={WORKFLOW_STAGES}
          zones={OFFICE_ZONES}
          teamMembers={teamMembers}
          initialStageId={newTaskStage}
          onClose={() => setIsNewTaskOpen(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* Zone Specific Modals triggered from Isometric Map */}
      {activeSpecialModal === 'focus' && (
        <FocusSprintModal
          tasks={tasks}
          onClose={() => setActiveSpecialModal(null)}
          isAmbienceActive={isAmbienceActive}
          onToggleAmbience={handleToggleAmbience}
        />
      )}

      {activeSpecialModal === 'meeting' && (
        <MeetingRoomModal
          agenda={agenda}
          teamMembers={teamMembers}
          onClose={() => setActiveSpecialModal(null)}
          onUpdateAgenda={setAgenda}
          onConvertToTask={handleConvertAgendaToTask}
        />
      )}

      {activeSpecialModal === 'lounge' && (
        <LoungeModal
          kudos={kudos}
          teamMembers={teamMembers}
          currentUser={currentUser}
          onClose={() => setActiveSpecialModal(null)}
          onAddKudo={(newKudo) => setKudos((prev) => [newKudo, ...prev])}
          onAddIdeaTask={handleAddIdeaTask}
        />
      )}

      {activeSpecialModal === 'notice' && (
        <NoticeModal
          notices={notices}
          tasks={tasks}
          onClose={() => setActiveSpecialModal(null)}
          onAddNotice={(newNotice) => setNotices((prev) => [newNotice, ...prev])}
          onSelectTask={(task) => {
            setActiveSpecialModal(null);
            setSelectedTask(task);
          }}
        />
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TeamPlay World</span>
            <span>·</span>
            <span>가상 오피스 워크플로우 플랫폼</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>스프린트 2.0 라이브</span>
            <span>·</span>
            <span className="tabular-nums">온라인 팀원 5/5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
