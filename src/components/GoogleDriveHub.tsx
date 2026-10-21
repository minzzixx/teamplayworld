import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Table, 
  Presentation, 
  Folder, 
  Image as ImageIcon, 
  File, 
  ExternalLink, 
  Trash2, 
  Upload, 
  Plus, 
  Search, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Link as LinkIcon, 
  HardDrive,
  LogOut,
  User as UserIcon,
  X
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  logout 
} from '../services/googleAuth';
import { 
  DriveFile, 
  fetchDriveFiles, 
  createDriveDocument, 
  createDriveSheet, 
  uploadDriveFile, 
  deleteDriveFile 
} from '../services/googleDrive';
import { WorkflowTask } from '../types/workflow';
import { soundFx } from '../utils/audio';

interface GoogleDriveHubProps {
  tasks: WorkflowTask[];
  onAttachFileToTask: (taskId: string, file: DriveFile) => void;
}

export const GoogleDriveHub: React.FC<GoogleDriveHubProps> = ({
  tasks,
  onAttachFileToTask,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Create file modals
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Task link selector modal
  const [selectedFileForLink, setSelectedFileForLink] = useState<DriveFile | null>(null);
  const [targetTaskId, setTargetTaskId] = useState<string>(tasks[0]?.id || '');

  // Delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        loadFiles(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      soundFx.playKeyClick();
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        await loadFiles(result.accessToken);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.';
      setErrorMessage(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    soundFx.playKeyClick();
    await logout();
    setUser(null);
    setToken(null);
    setFiles([]);
  };

  const loadFiles = async (currentToken?: string) => {
    const activeToken = currentToken || token;
    if (!activeToken) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchDriveFiles(activeToken, {
        query: searchQuery,
        mimeType: filterType,
      });
      setFiles(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Drive 파일 목록을 불러오지 못했습니다.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when filter changes
  useEffect(() => {
    if (token) {
      loadFiles(token);
    }
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      loadFiles(token);
    }
  };

  // Create Doc
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newFileName.trim()) return;

    setIsCreating(true);
    try {
      soundFx.playChime(true);
      const newDoc = await createDriveDocument(token, newFileName.trim());
      setIsCreateDocOpen(false);
      setNewFileName('');
      await loadFiles(token);
      if (newDoc.webViewLink) {
        window.open(newDoc.webViewLink, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '문서 생성 실패');
    } finally {
      setIsCreating(false);
    }
  };

  // Create Sheet
  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newFileName.trim()) return;

    setIsCreating(true);
    try {
      soundFx.playChime(true);
      const newSheet = await createDriveSheet(token, newFileName.trim());
      setIsCreateSheetOpen(false);
      setNewFileName('');
      await loadFiles(token);
      if (newSheet.webViewLink) {
        window.open(newSheet.webViewLink, '_blank', 'noopener,noreferrer');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '스프레드시트 생성 실패');
    } finally {
      setIsCreating(false);
    }
  };

  // Upload local file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsLoading(true);
    try {
      soundFx.playChime(true);
      await uploadDriveFile(token, file);
      await loadFiles(token);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '파일 업로드 실패');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Destructive delete with explicit confirmation (MANDATORY)
  const confirmDeleteFile = async () => {
    if (!token || !fileToDelete) return;

    setIsDeleting(true);
    try {
      soundFx.playKeyClick();
      await deleteDriveFile(token, fileToDelete.id);
      setFileToDelete(null);
      await loadFiles(token);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '파일 삭제 실패');
    } finally {
      setIsDeleting(false);
    }
  };

  // Link file to selected task
  const handleLinkFile = () => {
    if (!selectedFileForLink || !targetTaskId) return;
    soundFx.playKeyClick();
    onAttachFileToTask(targetTaskId, selectedFileForLink);
    setSelectedFileForLink(null);
    alert(`'${selectedFileForLink.name}' 파일이 태스크에 성공적으로 연동되었습니다!`);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (mimeType.includes('spreadsheet')) {
      return <Table className="w-5 h-5 text-emerald-600" />;
    }
    if (mimeType.includes('presentation')) {
      return <Presentation className="w-5 h-5 text-amber-500" />;
    }
    if (mimeType.includes('folder')) {
      return <Folder className="w-5 h-5 text-sky-500 fill-sky-100" />;
    }
    if (mimeType.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-purple-600" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <HardDrive className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Google Drive 팀 파일 허브</h2>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-blue-600">스프린트 문서 연동</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Google Drive와 직접 연동하여 스프린트 기획서, 기획 회의록, 디자인 시안 및 스프레드시트를 팀플레이월드 태스크와 원클릭으로 연결하세요.
          </p>
        </div>

        {/* User Account / Auth Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5 p-1.5 pl-3 bg-slate-50 border border-slate-200 rounded-xl">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-7 h-7 rounded-full border border-slate-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {user.displayName?.[0] || 'G'}
                </div>
              )}
              <div className="text-left text-xs pr-2">
                <p className="font-bold text-slate-800 leading-tight">{user.displayName || 'Google 사용자'}</p>
                <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="로그아웃"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Sign in with Google (GSI Material Button) */
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{isLoggingIn ? 'Google 연결 중...' : 'Google 계정으로 로그인'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* When Not Logged In Prompt */}
      {!user ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Google Drive 연결 필요</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Google Drive 파일에 접근하고 태스크에 문서를 연동하려면 Google 계정으로 로그인하세요.
            </p>
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <span>Google Drive 연결하기</span>
          </button>
        </div>
      ) : (
        /* Authenticated Drive Workspace */
        <div className="space-y-4">
          
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Google Drive 파일 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </form>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  setNewFileName('새 스프린트 기획서');
                  setIsCreateDocOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 문서 (Doc)</span>
              </button>

              <button
                onClick={() => {
                  setNewFileName('새 스프린트 트래커');
                  setIsCreateSheetOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 시트 (Sheet)</span>
              </button>

              {/* Upload file */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>파일 업로드</span>
              </button>

              {/* Refresh */}
              <button
                onClick={() => loadFiles()}
                title="목록 새로고침"
                className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Type Filters Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: '전체 파일' },
              { id: 'docs', label: 'Google 문서' },
              { id: 'sheets', label: '스프레드시트' },
              { id: 'slides', label: '프레젠테이션' },
              { id: 'pdf', label: 'PDF 문서' },
              { id: 'images', label: '이미지' },
              { id: 'folders', label: '폴더' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Files Grid / List */}
          {isLoading ? (
            <div className="h-60 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-xs">Google Drive 파일을 동기화하는 중...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-center p-6 space-y-2">
              <HardDrive className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">표시할 Google Drive 파일이 없습니다.</p>
              <p className="text-[11px] text-slate-400">
                상단의 버튼을 눌러 새 문서를 작성하거나 로컬 파일을 업로드해보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top file meta */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate leading-tight" title={file.name}>
                          {file.name}
                        </h4>
                      </div>

                      {/* Delete button (opens confirmation dialog) */}
                      <button
                        onClick={() => setFileToDelete(file)}
                        title="Google Drive에서 파일 삭제"
                        className="text-slate-300 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 opacity-0 group-hover:opacity-100 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="text-[11px] text-slate-400 space-y-0.5 mb-3">
                      <p>
                        수정일: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('ko-KR') : '-'}
                      </p>
                      {file.owners?.[0] && (
                        <p className="truncate">소유자: {file.owners[0].displayName}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    {/* Link to task */}
                    <button
                      onClick={() => setSelectedFileForLink(file)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>태스크에 연동</span>
                    </button>

                    {/* Open in Drive */}
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 transition-colors"
                      >
                        <span>드라이브 열기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Doc Modal */}
      {isCreateDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">새 Google 문서 생성</h3>
              <button onClick={() => setIsCreateDocOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDocument} className="space-y-3">
              <input
                type="text"
                required
                placeholder="문서 제목을 입력하세요..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateDocOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  {isCreating ? '생성 중...' : '문서 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Sheet Modal */}
      {isCreateSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">새 Google 스프레드시트 생성</h3>
              <button onClick={() => setIsCreateSheetOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSheet} className="space-y-3">
              <input
                type="text"
                required
                placeholder="스프레드시트 제목 입력..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSheetOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  {isCreating ? '생성 중...' : '시트 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link File to Task Dialog */}
      {selectedFileForLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">태스크에 Drive 파일 연결</h3>
              <button onClick={() => setSelectedFileForLink(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
              <span className="text-slate-400 text-[11px]">선택된 파일:</span>
              <p className="font-bold text-slate-800 truncate">{selectedFileForLink.name}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">연결할 워크플로우 태스크 선택:</label>
              <select
                value={targetTaskId}
                onChange={(e) => setTargetTaskId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.id}] {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFileForLink(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleLinkFile}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                연결하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY: Explicit User Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Google Drive 파일 삭제 확인</h3>
                <p className="text-xs text-slate-500 mt-0.5">이 작업은 취소할 수 없습니다.</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-slate-700 space-y-1">
              <p>
                정말로 Google Drive에서 <strong className="text-rose-700 font-bold">"{fileToDelete.name}"</strong> 파일을 영구 삭제하시겠습니까?
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                {isDeleting ? '삭제 중...' : '파일 삭제 확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
