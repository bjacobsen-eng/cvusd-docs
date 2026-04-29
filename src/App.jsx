import { useState } from "react";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY; // Replace with your Anthropic API key

const DOCUMENT_TYPES = [
  { id: "conference_summary", label: "Conference Summary" },
  { id: "written_reprimand", label: "Written Reprimand" },
  { id: "notice_of_unprofessional_conduct", label: "Notice of Unprofessional Conduct" },
  { id: "improvement_plan", label: "Plan of Assistance / Improvement Plan" },
];

const EMPLOYEE_TYPES = [
  { id: "certificated", label: "Certificated" },
  { id: "classified", label: "Classified" },
];

const initialForm = {
  documentType: "",
  employeeType: "",
  employeeName: "",
  employeeTitle: "",
  supervisorName: "",
  supervisorTitle: "",
  districtName: "",
  incidentDate: "",
  meetingDate: "",
  facts: "",
  rules: "",
  impact: "",
  suggestions: "",
  consequences: "",
  priorHistory: "",
  tone: "formal",
};

export default function FRISKGenerator() {
  const [form, setForm] = useState(initialForm);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const buildPrompt = () => {
    const docLabel = DOCUMENT_TYPES.find((d) => d.id === form.documentType)?.label || form.documentType;
    return `You are an expert school district HR attorney and labor relations specialist. Generate a professional, legally defensible ${docLabel} using the FRISK documentation framework.

FRISK stands for:
- F: Facts (specific, observable, documented facts — no opinions or conclusions)
- R: Rule (the specific policy, contract article, Ed Code, or expectation violated)
- I: Impact (how the conduct harmed students, staff, operations, or the district)
- S: Suggestions (clear directives for corrective action going forward)
- K: Consequences (what will happen if conduct continues)

DOCUMENT DETAILS:
- Document Type: ${docLabel}
- Employee Type: ${form.employeeType}
- Employee Name: ${form.employeeName}
- Employee Title: ${form.employeeTitle}
- Supervisor/Author: ${form.supervisorName}, ${form.supervisorTitle}
- Site / Department: ${form.districtName}
- Incident Date(s): ${form.incidentDate}
- Meeting/Conference Date: ${form.meetingDate}
- Prior Discipline History: ${form.priorHistory || "None on record"}
- Tone: ${form.tone === "formal" ? "Formal and measured" : "Direct and firm"}

FACTS PROVIDED:
${form.facts}

RULES/POLICIES VIOLATED:
${form.rules}

IMPACT:
${form.impact}

SUGGESTIONS FOR CORRECTION:
${form.suggestions}

CONSEQUENCES IF CONDUCT CONTINUES:
${form.consequences}

INSTRUCTIONS:
1. Write the complete ${docLabel} as a finished, ready-to-use document
2. Use formal district HR language throughout
3. Embed FRISK framework naturally — do NOT use FRISK as visible section headers
4. Be specific and factual; avoid vague language
5. Include an opening paragraph, a body with each FRISK element woven in professionally, and a closing paragraph
6. End with signature lines for the supervisor and employee (for receipt acknowledgment)
7. Format with clear paragraph breaks
8. Do not add any preamble or explanation — output the document only`;
  };

  const generate = async () => {
    setLoading(true);
    setOutput("");
    try {
      const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);
const response = await fetch("/api-proxy/v1/messages", {
  signal: controller.signal,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: buildPrompt() }],
  }),
});
clearTimeout(timeout);
      const data = await response.json();
      if (data.error) {
        setOutput("API Error: " + data.error.message);
        setStep(3);
        return;
      }
      const text = data.content?.map((b) => b.text || "").join("") || "No output generated.";
      setOutput(text);
      setStep(3);
    } catch (err) {
      setOutput("Error: " + err.message + " | " + JSON.stringify(err));
      setStep(3);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setForm(initialForm);
    setOutput("");
    setStep(1);
  };

  const isStep1Complete = form.documentType && form.employeeType && form.districtName && form.employeeName && form.employeeTitle && form.supervisorName && form.supervisorTitle;
  const isStep2Complete = form.facts && form.rules && form.impact && form.suggestions && form.consequences;

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f5f0e8", color: "#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0e8; }
        .app { font-family: 'Source Sans 3', sans-serif; }
        .header { background: #1a1a2e; color: #f5f0e8; padding: 32px 40px; border-bottom: 4px solid #c9a84c; }
        .header-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .header-sub { font-size: 13px; color: #a8a8c0; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; font-family: 'Source Sans 3', sans-serif; font-weight: 300; }
        .frisk-badge { display: inline-flex; gap: 6px; margin-top: 14px; }
        .frisk-letter { background: #c9a84c; color: #1a1a2e; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; font-family: 'Source Sans 3', sans-serif; }
        .frisk-letter.dim { background: #2d2d4a; color: #6b6b8a; }
        .content { max-width: 860px; margin: 0 auto; padding: 40px 24px; }
        .steps { display: flex; gap: 0; margin-bottom: 36px; }
        .step-item { flex: 1; display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #e8e0d0; border-right: 1px solid #d4c8b0; cursor: default; transition: background 0.2s; }
        .step-item:last-child { border-right: none; }
        .step-item.active { background: #1a1a2e; color: #f5f0e8; }
        .step-item.done { background: #2d4a2d; color: #a8d4a8; }
        .step-num { width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .step-item.active .step-num { background: #c9a84c; color: #1a1a2e; }
        .step-item.done .step-num { background: #4a8a4a; color: white; }
        .step-label { font-size: 13px; font-weight: 500; }
        .card { background: white; border: 1px solid #d4c8b0; border-radius: 2px; padding: 32px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .card-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 6px; }
        .card-desc { font-size: 13px; color: #6b6b8a; margin-bottom: 24px; line-height: 1.5; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .field { margin-bottom: 0; }
        label { display: block; font-size: 12px; font-weight: 600; color: #4a4a6a; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
        input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid #d4c8b0; border-radius: 2px; font-size: 14px; font-family: 'Source Sans 3', sans-serif; color: #1a1a2e; background: #faf8f4; transition: border-color 0.15s, box-shadow 0.15s; outline: none; }
        input:focus, select:focus, textarea:focus { border-color: #c9a84c; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); background: white; }
        textarea { resize: vertical; min-height: 90px; line-height: 1.5; }
        .frisk-section { border-left: 3px solid #c9a84c; padding-left: 16px; margin-bottom: 20px; }
        .frisk-section-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
        .frisk-hint { font-size: 12px; color: #8a7a5a; margin-bottom: 10px; line-height: 1.4; }
        .btn { padding: 12px 28px; border: none; border-radius: 2px; font-size: 14px; font-weight: 600; font-family: 'Source Sans 3', sans-serif; cursor: pointer; transition: all 0.15s; letter-spacing: 0.3px; }
        .btn-primary { background: #1a1a2e; color: #f5f0e8; }
        .btn-primary:hover:not(:disabled) { background: #c9a84c; color: #1a1a2e; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-secondary { background: transparent; color: #1a1a2e; border: 1px solid #d4c8b0; }
        .btn-secondary:hover { background: #f5f0e8; }
        .btn-gold { background: #c9a84c; color: #1a1a2e; }
        .btn-gold:hover { background: #b8963e; }
        .btn-row { display: flex; gap: 12px; align-items: center; justify-content: flex-end; margin-top: 24px; }
        .doc-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .doc-type-btn { padding: 16px; border: 2px solid #d4c8b0; border-radius: 2px; background: #faf8f4; cursor: pointer; text-align: left; transition: all 0.15s; font-family: 'Source Sans 3', sans-serif; color: #1a1a2e; }
        .doc-type-btn:hover { border-color: #c9a84c; background: white; }
        .doc-type-btn.selected { border-color: #1a1a2e; background: #1a1a2e; color: #f5f0e8; }
        .doc-type-label { font-size: 14px; font-weight: 600; color: #1a1a2e; }
        .doc-type-btn.selected .doc-type-label { color: #f5f0e8; }
        .emp-type-grid { display: flex; gap: 12px; }
        .emp-type-btn { flex: 1; padding: 12px; border: 2px solid #d4c8b0; border-radius: 2px; background: #faf8f4; cursor: pointer; text-align: center; transition: all 0.15s; font-family: 'Source Sans 3', sans-serif; font-size: 14px; font-weight: 600; color: #1a1a2e; }
        .emp-type-btn:hover { border-color: #c9a84c; }
        .emp-type-btn.selected { border-color: #1a1a2e; background: #1a1a2e; color: #f5f0e8; }
        .output-box { background: #faf8f4; border: 1px solid #d4c8b0; border-radius: 2px; padding: 40px; font-family: 'Georgia', serif; font-size: 14px; line-height: 1.8; white-space: pre-wrap; color: #1a1a2e; min-height: 300px; }
        .output-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .output-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; }
        .generating { display: flex; align-items: center; gap: 12px; padding: 60px; justify-content: center; font-size: 15px; color: #6b6b8a; }
        .spinner { width: 24px; height: 24px; border: 2px solid #d4c8b0; border-top-color: #c9a84c; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .disclaimer { font-size: 12px; color: #8a7a5a; background: #f0ead8; border: 1px solid #d4c8b0; padding: 12px 16px; border-radius: 2px; margin-top: 16px; line-height: 1.5; }
        .tone-row { display: flex; gap: 10px; }
        .tone-btn { flex: 1; padding: 9px; border: 1px solid #d4c8b0; border-radius: 2px; background: #faf8f4; cursor: pointer; text-align: center; font-family: 'Source Sans 3', sans-serif; font-size: 13px; font-weight: 500; color: #1a1a2e; transition: all 0.15s; }
        .tone-btn.selected { border-color: #1a1a2e; background: #1a1a2e; color: #f5f0e8; }
        .divider { border: none; border-top: 1px solid #e4dcd0; margin: 24px 0; }
      `}</style>

      <div className="app">
        <div className="header">
          <div className="header-title">C-VUSD Discipline Documentation</div>
          <div className="header-sub">AI-Powered HR Document Generator · Covina-Valley Unified School District</div>
          <div className="frisk-badge">
            {["F","R","I","S","K"].map((l, i) => (
              <div key={l} className={`frisk-letter ${step === 1 && i > 1 ? "dim" : ""}`} title={["Facts","Rule","Impact","Suggestions","Consequences"][i]}>
                {l}
              </div>
            ))}
          </div>
        </div>

        <div className="content">
          <div className="steps">
            {[
              { n: 1, label: "Document Setup" },
              { n: 2, label: "FRISK Details" },
              { n: 3, label: "Generated Document" },
            ].map(({ n, label }) => (
              <div key={n} className={`step-item ${step === n ? "active" : step > n ? "done" : ""}`}>
                <div className="step-num">{step > n ? "✓" : n}</div>
                <div className="step-label">{label}</div>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <div className="card">
                <div className="card-title">Document Type</div>
                <div className="card-desc">Select the type of disciplinary or corrective action document to generate.</div>
                <div className="doc-type-grid">
                  {DOCUMENT_TYPES.map((d) => (
                    <button key={d.id} className={`doc-type-btn ${form.documentType === d.id ? "selected" : ""}`} onClick={() => update("documentType", d.id)}>
                      <div className="doc-type-label">{d.label}</div>
                    </button>
                  ))}
                </div>

                <hr className="divider" />

                <div style={{ marginBottom: 16 }}>
                  <label>Employee Type</label>
                  <div className="emp-type-grid">
                    {EMPLOYEE_TYPES.map((e) => (
                      <button key={e.id} className={`emp-type-btn ${form.employeeType === e.id ? "selected" : ""}`} onClick={() => update("employeeType", e.id)}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field" style={{ marginBottom: 16 }}>
                  <label>Site / Department</label>
                  <input value={form.districtName} onChange={e => update("districtName", e.target.value)} placeholder="e.g. Covina Elementary School, Maintenance & Operations" />
                </div>
              </div>

              <div className="card">
                <div className="card-title">Personnel Information</div>
                <div className="card-desc">Enter the employee and issuing administrator details.</div>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="field">
                    <label>Employee Name</label>
                    <input value={form.employeeName} onChange={e => update("employeeName", e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="field">
                    <label>Employee Title / Classification</label>
                    <input value={form.employeeTitle} onChange={e => update("employeeTitle", e.target.value)} placeholder="e.g. Teacher, Custodian II" />
                  </div>
                  <div className="field">
                    <label>Supervisor / Author Name</label>
                    <input value={form.supervisorName} onChange={e => update("supervisorName", e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="field">
                    <label>Supervisor Title</label>
                    <input value={form.supervisorTitle} onChange={e => update("supervisorTitle", e.target.value)} placeholder="e.g. Principal, Director of Personnel" />
                  </div>
                  <div className="field">
                    <label>Incident / Conduct Date(s)</label>
                    <input value={form.incidentDate} onChange={e => update("incidentDate", e.target.value)} placeholder="e.g. March 12, 2025" />
                  </div>
                  <div className="field">
                    <label>Conference / Meeting Date</label>
                    <input value={form.meetingDate} onChange={e => update("meetingDate", e.target.value)} placeholder="e.g. March 19, 2025" />
                  </div>
                </div>

                <hr className="divider" />

                <div className="field" style={{ marginBottom: 16 }}>
                  <label>Prior Discipline History (optional)</label>
                  <input value={form.priorHistory} onChange={e => update("priorHistory", e.target.value)} placeholder="e.g. Verbal warning issued October 2024 for similar conduct" />
                </div>

                <div className="field">
                  <label>Document Tone</label>
                  <div className="tone-row">
                    <button className={`tone-btn ${form.tone === "formal" ? "selected" : ""}`} onClick={() => update("tone", "formal")}>Formal & Measured</button>
                    <button className={`tone-btn ${form.tone === "firm" ? "selected" : ""}`} onClick={() => update("tone", "firm")}>Direct & Firm</button>
                  </div>
                </div>
              </div>

              <div className="btn-row">
                <button className="btn btn-primary" disabled={!isStep1Complete} onClick={() => setStep(2)}>
                  Continue to FRISK Details →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="card">
                <div className="card-title">FRISK Documentation Details</div>
                <div className="card-desc">
                  Provide the raw details for each FRISK element. The AI will transform these into polished, legally defensible language — write in plain notes, not formal prose.
                </div>

                <div className="frisk-section">
                  <div className="frisk-section-title">F — Facts</div>
                  <div className="frisk-hint">Specific, observable, documented facts only. Dates, times, witnesses, direct quotes, what was seen or heard. No opinions or characterizations.</div>
                  <textarea value={form.facts} onChange={e => update("facts", e.target.value)} placeholder="e.g. On March 12, 2025 at approximately 10:15am, employee was observed by Principal Smith leaving classroom unsupervised for 22 minutes while 28 students remained. Three students were found in the hallway by campus security." rows={5} />
                </div>

                <div className="frisk-section">
                  <div className="frisk-section-title">R — Rule / Policy Violated</div>
                  <div className="frisk-hint">Cite the specific policy, Ed Code section, contract article, board policy, or written expectation that was violated.</div>
                  <textarea value={form.rules} onChange={e => update("rules", e.target.value)} placeholder="e.g. Ed Code 44807 (duty of supervision); Board Policy 4119.21; CBA Article 12, Section 3 (duty day responsibilities)" rows={3} />
                </div>

                <div className="frisk-section">
                  <div className="frisk-section-title">I — Impact</div>
                  <div className="frisk-hint">How did this conduct harm students, staff, the school, or the district? Be specific about actual or potential harm.</div>
                  <textarea value={form.impact} onChange={e => update("impact", e.target.value)} placeholder="e.g. Students were left unsupervised creating safety risk; three students were found unsupervised in hallway; campus security had to be diverted from other duties" rows={3} />
                </div>

                <div className="frisk-section">
                  <div className="frisk-section-title">S — Suggestions for Correction</div>
                  <div className="frisk-hint">Clear, specific, achievable directives for what the employee must do differently. These should be actionable, not vague.</div>
                  <textarea value={form.suggestions} onChange={e => update("suggestions", e.target.value)} placeholder="e.g. Employee shall ensure classroom is never left unsupervised; if emergency, employee must first contact office for coverage; employee shall review duty of supervision expectations with principal within 5 business days" rows={4} />
                </div>

                <div className="frisk-section">
                  <div className="frisk-section-title">K — Consequences</div>
                  <div className="frisk-hint">What will happen if this conduct continues or recurs? Be honest but not inflammatory.</div>
                  <textarea value={form.consequences} onChange={e => update("consequences", e.target.value)} placeholder="e.g. Further incidents of this nature may result in additional disciplinary action up to and including suspension or dismissal" rows={3} />
                </div>
              </div>

              <div className="btn-row">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-gold" disabled={!isStep2Complete || loading} onClick={generate}>
                  {loading ? "Generating…" : "Generate Document ✦"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="card">
                <div className="output-header">
                  <div className="output-title">
                    {DOCUMENT_TYPES.find(d => d.id === form.documentType)?.label}
                    <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 13, fontWeight: 400, color: "#8a7a5a", marginLeft: 12 }}>
                      {form.employeeName} · {form.districtName}
                    </span>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }} onClick={copyToClipboard}>
                    {copied ? "✓ Copied" : "Copy Text"}
                  </button>
                </div>

                {loading ? (
                  <div className="generating">
                    <div className="spinner" />
                    Drafting your document using FRISK framework…
                  </div>
                ) : (
                  <div className="output-box">{output}</div>
                )}

                <div className="disclaimer">
                  ⚠ This document is AI-generated and intended as a drafting aid. All documents should be reviewed by a qualified HR professional or legal counsel before issuance. Verify all citations to Education Code, board policy, and collective bargaining agreements prior to use.
                </div>
              </div>

              <div className="btn-row">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>← Edit Details</button>
                <button className="btn btn-secondary" onClick={reset}>Start New Document</button>
                <button className="btn btn-gold" onClick={generate}>Regenerate ↺</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
