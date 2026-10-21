export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  modifiedTime?: string;
  size?: string;
  thumbnailLink?: string;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3/files';

/**
 * Fetch files from Google Drive
 */
export async function fetchDriveFiles(
  token: string,
  options?: {
    query?: string;
    mimeType?: string;
    pageSize?: number;
  }
): Promise<DriveFile[]> {
  const params = new URLSearchParams();
  params.set('pageSize', (options?.pageSize || 30).toString());
  params.set(
    'fields',
    'files(id,name,mimeType,iconLink,webViewLink,webContentLink,modifiedTime,size,thumbnailLink,owners)'
  );
  params.set('orderBy', 'modifiedTime desc');

  const queryParts: string[] = ['trashed = false'];
  if (options?.query && options.query.trim()) {
    queryParts.push(`name contains '${options.query.trim().replace(/'/g, "\\'")}'`);
  }
  if (options?.mimeType && options.mimeType !== 'all') {
    if (options.mimeType === 'docs') {
      queryParts.push("mimeType = 'application/vnd.google-apps.document'");
    } else if (options.mimeType === 'sheets') {
      queryParts.push("mimeType = 'application/vnd.google-apps.spreadsheet'");
    } else if (options.mimeType === 'slides') {
      queryParts.push("mimeType = 'application/vnd.google-apps.presentation'");
    } else if (options.mimeType === 'folders') {
      queryParts.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (options.mimeType === 'images') {
      queryParts.push("mimeType contains 'image/'");
    } else if (options.mimeType === 'pdf') {
      queryParts.push("mimeType = 'application/pdf'");
    }
  }

  params.set('q', queryParts.join(' and '));

  const response = await fetch(`${DRIVE_API_BASE}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Drive 요청 실패 (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Create a new Google Doc on Google Drive
 */
export async function createDriveDocument(
  token: string,
  title: string
): Promise<DriveFile> {
  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.document',
  };

  const response = await fetch(DRIVE_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || '새 문서 생성에 실패했습니다.');
  }

  return response.json();
}

/**
 * Create a new Google Sheet on Google Drive
 */
export async function createDriveSheet(
  token: string,
  title: string
): Promise<DriveFile> {
  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.spreadsheet',
  };

  const response = await fetch(DRIVE_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || '새 스프레드시트 생성에 실패했습니다.');
  }

  return response.json();
}

/**
 * Upload a local file into Google Drive using multipart upload
 */
export async function uploadDriveFile(
  token: string,
  file: File
): Promise<DriveFile> {
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;
  const mediaPartHeader = `${delimiter}Content-Type: ${
    file.type || 'application/octet-stream'
  }\r\n\r\n`;

  // Concatenate parts into Uint8Array
  const encoder = new TextEncoder();
  const part1 = encoder.encode(metadataPart + mediaPartHeader);
  const part2 = new Uint8Array(fileData);
  const part3 = encoder.encode(closeDelimiter);

  const body = new Uint8Array(part1.length + part2.length + part3.length);
  body.set(part1, 0);
  body.set(part2, part1.length);
  body.set(part3, part1.length + part2.length);

  const response = await fetch(
    `${DRIVE_UPLOAD_BASE}?uploadType=multipart&fields=id,name,mimeType,webViewLink,iconLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || '파일 업로드에 실패했습니다.');
  }

  return response.json();
}

/**
 * Delete a file from Google Drive
 * CAUTION: Caller MUST ensure user confirmed the deletion beforehand!
 */
export async function deleteDriveFile(token: string, fileId: string): Promise<void> {
  const response = await fetch(`${DRIVE_API_BASE}/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || '파일 삭제에 실패했습니다.');
  }
}
