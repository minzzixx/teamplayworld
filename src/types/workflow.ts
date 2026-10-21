export type WorkflowStageId = 'ideation' | 'planning' | 'in_progress' | 'review' | 'completed';

export interface WorkflowStage {
  id: WorkflowStageId;
  name: string;
  description: string;
  color: string;
  accentBg: string;
  officeZone: OfficeZoneId;
}

export type OfficeZoneId = 'center_desk' | 'meeting_booth' | 'window_desk' | 'sofa_lounge' | 'pantry' | 'notice_board';

export interface OfficeZone {
  id: OfficeZoneId;
  title: string;
  subtitle: string;
  description: string;
  stageId?: WorkflowStageId;
  // Position percentages on the 1000x680 isometric map canvas
  coords: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    w: number; // width %
    h: number; // height %
  };
  iconName: string;
  badge: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarBg: string;
  avatarEmoji: string;
  currentZone: OfficeZoneId;
  statusMessage: string;
  isOnline: boolean;
  tasksCount: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DriveAttachment {
  id: string;
  name: string;
  webViewLink: string;
  iconLink?: string;
  mimeType: string;
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  stage: WorkflowStageId;
  zone: OfficeZoneId;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string;
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  commentsCount: number;
  estimatedHours: number;
  driveAttachments?: DriveAttachment[];
}

export interface MeetingAgendaItem {
  id: string;
  title: string;
  presenter: string;
  durationMin: number;
  status: 'pending' | 'in_progress' | 'done';
}

export interface LoungeKudo {
  id: string;
  from: string;
  to: string;
  message: string;
  timeAgo: string;
  emoji: string;
}

export interface SprintNotice {
  id: string;
  title: string;
  author: string;
  date: string;
  pinned: boolean;
  content: string;
}
