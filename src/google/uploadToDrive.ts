// src/google/uploadToDrive.ts

const SCOPES = "https://www.googleapis.com/auth/drive.file";

let tokenClient: google.accounts.oauth2.TokenClient | null = null;

export function initGoogleAuth(clientId: string): void {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: () => {},
  });
}

export async function uploadToDrive(
  blob: Blob,
  fileName: string
): Promise<string> {
  const accessToken = await getAccessToken();

  const metadata = {
    name: fileName,
    mimeType: "application/vnd.google-apps.document",
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", blob);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  const data = await response.json();
  return `https://docs.google.com/document/d/${data.id}/edit`;
}

function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Google Auth not initialized"));
      return;
    }
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error));
        return;
      }
      resolve(response.access_token);
    };
    tokenClient.requestAccessToken();
  });
}
