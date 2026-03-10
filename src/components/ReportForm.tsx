import type { ReportData, InterrogationItem } from "../types";

const basePath = import.meta.env.BASE_URL + "assets/";

interface Props {
  data: ReportData;
  onChange: (data: ReportData) => void;
}

export function ReportForm({ data, onChange }: Props) {
  function setField<K extends keyof ReportData>(key: K, value: ReportData[K]) {
    onChange({ ...data, [key]: value });
  }

  function setEvidenceField(
    key: keyof ReportData["evidenceData"],
    value: string
  ) {
    onChange({
      ...data,
      evidenceData: { ...data.evidenceData, [key]: value },
    });
  }

  function setItemField(
    index: number,
    key: keyof InterrogationItem,
    value: string
  ) {
    const items = [...data.items];
    items[index] = { ...items[index], [key]: value };
    onChange({ ...data, items });
  }

  function addItem() {
    onChange({
      ...data,
      items: [
        ...data.items,
        { text: "", timestampFrom: "", timestampTo: "", youtubeLink: "" },
      ],
    });
  }

  function removeItem(index: number) {
    onChange({
      ...data,
      items: data.items.filter((_, i) => i !== index),
    });
  }

  return (
    <>
      {/* ── LSPD Logo (header) ── */}
      <img
        src={basePath + "image4.png"}
        alt="LSPD Detective Bureau"
        className="doc-image doc-image--logo"
      />

      {/* ── Divider ── */}
      <img
        src={basePath + "image2.png"}
        alt=""
        className="doc-image doc-image--divider"
      />

      {/* ── Title ── */}
      <div className="doc-title">Interrogation</div>
      <div className="doc-title" style={{ marginBottom: 20 }}>
        Report №
        <input
          type="number"
          className="inline-field inline-field--number"
          value={data.reportNumber || ""}
          onChange={(e) => setField("reportNumber", Number(e.target.value))}
          placeholder="—"
        />
      </div>

      {/* ── Intro ── */}
      <p className="doc-para">
        Я, агент{" "}
        <input
          type="text"
          className="inline-field inline-field--agent"
          style={{ fontWeight: 700 }}
          value={data.agentId}
          onChange={(e) => setField("agentId", e.target.value)}
          placeholder="DB-XXXXXX"
        />
        , спешу доложить вышестоящим лицам, об успешно проведенной специальной
        операции, в ходе которой был проведен допрос одного из членов
      </p>

      <p className="doc-para doc-bold">
        очень странного цирка &ldquo;
        <input
          type="text"
          className="inline-field inline-field--org"
          style={{ fontWeight: 700 }}
          value={data.organizationName}
          onChange={(e) => setField("organizationName", e.target.value)}
          placeholder="Название организации"
        />
        &rdquo;, в процессе которого мне удалось узнать следующую информацию:
      </p>

      {/* ── Interrogation Items ── */}
      {data.items.map((item, index) => (
        <div className="interrogation-item" key={index}>
          {data.items.length > 1 && (
            <button
              className="item-remove"
              onClick={() => removeItem(index)}
              title="Удалить пункт"
            >
              ×
            </button>
          )}

          <div className="item-header">
            <span className="item-number">{index + 1}.</span>
          </div>

          <textarea
            className="inline-field--text"
            value={item.text}
            onChange={(e) => setItemField(index, "text", e.target.value)}
            placeholder="Гражданин признался, что..."
            rows={2}
          />

          <div className="item-timestamp">
            <span className="item-timestamp-bracket">[</span>
            <input
              type="text"
              className="inline-field inline-field--timestamp"
              value={item.timestampFrom}
              onChange={(e) =>
                setItemField(index, "timestampFrom", e.target.value)
              }
              placeholder="00:00"
            />
            <span>-</span>
            <input
              type="text"
              className="inline-field inline-field--timestamp"
              value={item.timestampTo}
              onChange={(e) =>
                setItemField(index, "timestampTo", e.target.value)
              }
              placeholder="00:00"
            />
            <span className="item-timestamp-bracket">]</span>
            <input
              type="text"
              className="inline-field inline-field--link"
              value={item.youtubeLink}
              onChange={(e) =>
                setItemField(index, "youtubeLink", e.target.value)
              }
              placeholder="https://youtube.com/..."
              style={{ marginLeft: 8 }}
            />
          </div>
        </div>
      ))}

      <button className="add-item-btn" onClick={addItem}>
        <span style={{ fontSize: 16 }}>+</span> Добавить пункт допроса
      </button>

      {/* ── Evidence ── */}
      <div className="evidence-line">
        <span className="evidence-label">Evidence:</span>{" "}
        <span className="evidence-link-display">[Video]</span>{" "}
        <input
          type="text"
          className="inline-field inline-field--link"
          value={data.evidenceData.evidence}
          onChange={(e) => setEvidenceField("evidence", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="evidence-line">
        <span className="evidence-label">Evidence of a violation:</span>{" "}
        <span className="evidence-link-display">[video]</span>{" "}
        <input
          type="text"
          className="inline-field inline-field--link"
          value={data.evidenceData.evidenceViolation}
          onChange={(e) => setEvidenceField("evidenceViolation", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="evidence-line">
        <span className="evidence-label">Evidence Servers:</span>{" "}
        <span className="evidence-link-display">[video]</span>{" "}
        <input
          type="text"
          className="inline-field inline-field--link"
          value={data.evidenceData.evidenceServers}
          onChange={(e) => setEvidenceField("evidenceServers", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="evidence-line">
        <span className="evidence-label">The identity of the person:</span>{" "}
        <span className="evidence-link-display">[photo]</span>{" "}
        <input
          type="text"
          className="inline-field inline-field--link"
          value={data.evidenceData.identityPerson}
          onChange={(e) => setEvidenceField("identityPerson", e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* ── SEALED (right-aligned) ── */}
      <img
        src={basePath + "image3.png"}
        alt="SEALED"
        className="doc-image doc-image--sealed"
      />

      {/* ── Footer ── */}
      <div className="doc-footer">
        <div>
          Date:{" "}
          <input
            type="date"
            className="inline-field inline-field--date"
            value={data.date}
            onChange={(e) => setField("date", e.target.value)}
          />
        </div>
        <div className="doc-bold">{data.agentId || "DB-XXXXXX"}</div>
      </div>

      {/* ── TOP SECRET (left-aligned footer) ── */}
      <img
        src={basePath + "image1.png"}
        alt="TOP SECRET"
        className="doc-image doc-image--top-secret"
      />
    </>
  );
}
