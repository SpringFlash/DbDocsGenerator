import { useState } from "react";
import type { ReportData, InterrogationItem } from "../types";

const darkStyle: React.CSSProperties = {
  backgroundColor: "#1e1e1e",
  color: "#d4d4d4",
};

const inputStyle: React.CSSProperties = {
  backgroundColor: "#2d2d2d",
  color: "#d4d4d4",
  border: "1px solid #444",
  padding: "6px 8px",
  borderRadius: 4,
  width: "100%",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 4,
  color: "#9cdcfe",
  fontSize: 13,
};

const fieldStyle: React.CSSProperties = {
  marginBottom: 12,
};

const sectionStyle: React.CSSProperties = {
  border: "1px solid #444",
  borderRadius: 6,
  padding: 16,
  marginBottom: 16,
  backgroundColor: "#252526",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#0e639c",
  color: "#fff",
  border: "none",
  padding: "6px 14px",
  borderRadius: 4,
  cursor: "pointer",
};

const removeButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#8b1a1a",
  marginLeft: 8,
};

const emptyItem = (): InterrogationItem => ({
  text: "",
  timestampFrom: "",
  timestampTo: "",
  youtubeLink: "",
});

const initialData: ReportData = {
  reportNumber: 0,
  agentId: "",
  organizationName: "",
  date: "",
  items: [emptyItem()],
  evidenceData: {
    evidence: "",
    evidenceViolation: "",
    evidenceServers: "",
    identityPerson: "",
  },
};

export function ReportForm() {
  const [data, setData] = useState<ReportData>(initialData);

  function setField<K extends keyof ReportData>(key: K, value: ReportData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function setEvidenceField(key: keyof ReportData["evidenceData"], value: string) {
    setData((prev) => ({
      ...prev,
      evidenceData: { ...prev.evidenceData, [key]: value },
    }));
  }

  function setItemField(index: number, key: keyof InterrogationItem, value: string) {
    setData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, items };
    });
  }

  function addItem() {
    setData((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(index: number) {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  return (
    <div style={darkStyle}>
      {/* Basic info */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, color: "#ce9178" }}>Report Info</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Report Number</label>
            <input
              type="number"
              style={inputStyle}
              value={data.reportNumber || ""}
              onChange={(e) => setField("reportNumber", Number(e.target.value))}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              style={inputStyle}
              value={data.date}
              onChange={(e) => setField("date", e.target.value)}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Agent ID</label>
            <input
              type="text"
              style={inputStyle}
              value={data.agentId}
              onChange={(e) => setField("agentId", e.target.value)}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Organization Name</label>
            <input
              type="text"
              style={inputStyle}
              value={data.organizationName}
              onChange={(e) => setField("organizationName", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Interrogation items */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, color: "#ce9178" }}>Interrogation Items</h3>

        {data.items.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #3c3c3c",
              borderRadius: 4,
              padding: 12,
              marginBottom: 12,
              backgroundColor: "#1e1e1e",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "#858585", fontSize: 13 }}>Item #{index + 1}</span>
              {data.items.length > 1 && (
                <button style={removeButtonStyle} onClick={() => removeItem(index)}>
                  Remove
                </button>
              )}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Text</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                value={item.text}
                onChange={(e) => setItemField(index, "text", e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12 }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Timestamp From</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="00:00"
                  value={item.timestampFrom}
                  onChange={(e) => setItemField(index, "timestampFrom", e.target.value)}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Timestamp To</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="00:00"
                  value={item.timestampTo}
                  onChange={(e) => setItemField(index, "timestampTo", e.target.value)}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>YouTube Link</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={item.youtubeLink}
                  onChange={(e) => setItemField(index, "youtubeLink", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <button style={buttonStyle} onClick={addItem}>
          + Add Item
        </button>
      </div>

      {/* Evidence */}
      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, color: "#ce9178" }}>Evidence</h3>

        {(
          [
            ["evidence", "Evidence URL"],
            ["evidenceViolation", "Evidence Violation URL"],
            ["evidenceServers", "Evidence Servers URL"],
            ["identityPerson", "Identity Person URL"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} style={fieldStyle}>
            <label style={labelStyle}>{label}</label>
            <input
              type="text"
              style={inputStyle}
              value={data.evidenceData[key]}
              onChange={(e) => setEvidenceField(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Submit */}
      <button style={{ ...buttonStyle, opacity: 0.5, cursor: "not-allowed", padding: "10px 20px" }} disabled>
        Generate DOCX
      </button>
    </div>
  );
}
