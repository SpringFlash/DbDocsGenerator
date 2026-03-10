import { useState } from "react";
import { saveAs } from "file-saver";
import { ReportForm } from "./components/ReportForm";
import { loadAssets } from "./docx/loadAssets";
import { generateReport } from "./docx/generateReport";
import { initGoogleAuth, uploadToDrive } from "./google/uploadToDrive";
import type { ReportData } from "./types";
import "./styles.css";

const basePath = import.meta.env.BASE_URL + "assets/";

export default function App() {
  const [data, setData] = useState<ReportData>({
    reportNumber: 0,
    agentId: "",
    organizationName: "",
    date: "",
    items: [{ text: "", timestampFrom: "", timestampTo: "", youtubeLink: "" }],
    evidenceData: {
      evidence: "",
      evidenceViolation: "",
      evidenceServers: "",
      identityPerson: "",
    },
  });
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [googleDocsUrl, setGoogleDocsUrl] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
    | string
    | undefined;

  async function handleGenerate() {
    setGenerating(true);
    try {
      const assets = await loadAssets();
      const blob = await generateReport(data, assets);
      saveAs(blob, `Report №${data.reportNumber}.docx`);
    } finally {
      setGenerating(false);
    }
  }

  async function handleUploadToDrive() {
    setUploading(true);
    setGoogleDocsUrl(null);
    try {
      const assets = await loadAssets();
      const blob = await generateReport(data, assets);
      initGoogleAuth(googleClientId!);
      const url = await uploadToDrive(blob, `Report №${data.reportNumber}.docx`);
      setGoogleDocsUrl(url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="toolbar-logo">
          <img src={basePath + "image4.png"} alt="LSPD" />
          <div>
            <div className="toolbar-title">Редактор отчётов DB</div>
            <div className="toolbar-subtitle">Детективное бюро</div>
          </div>
        </div>

        <div className="toolbar-spacer" />

        {googleDocsUrl && (
          <a
            href={googleDocsUrl}
            target="_blank"
            rel="noreferrer"
            className="toolbar-link"
          >
            Открыть в Google Docs ↗
          </a>
        )}

        {googleClientId && (
          <button
            className="toolbar-btn toolbar-btn--secondary"
            disabled={uploading}
            onClick={handleUploadToDrive}
          >
            {uploading ? "Загрузка..." : "↑ Google Docs"}
          </button>
        )}

        <button
          className="toolbar-btn toolbar-btn--primary"
          disabled={generating}
          onClick={handleGenerate}
        >
          {generating ? "Генерация..." : "↓ Скачать .docx"}
        </button>
      </div>

      {/* ── Paper ── */}
      <div className="paper-container">
        <div className="paper">
          <ReportForm data={data} onChange={setData} />
        </div>
      </div>
    </>
  );
}
