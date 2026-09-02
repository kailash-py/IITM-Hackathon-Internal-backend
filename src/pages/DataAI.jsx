import { fmt } from '../risk.js';

const STAGES = [
  ['Data', 'Ingest 6 sources'],
  ['Preprocess', 'Clean, align, project to one grid'],
  ['Features', '82 engineered features per habitation'],
  ['Model', 'Gradient-boosted ensemble + rules'],
  ['Risk score', 'Composite 0–100 with confidence'],
  ['Vulnerability', 'Demography and structure fragility'],
  ['Decision engine', 'Gate thresholds → P1–P4'],
  ['Action', 'Task, alert, dispatch, proposal'],
];

const DATA_SOURCES = [
  ['IMD rainfall and nowcast', '12 min', 'Live API', 'low'],
  ['Alaknanda river gauge', '8 min', 'Live API', 'low'],
  ['GSI landslide susceptibility', '2025-Q4', 'Static layer', 'mod'],
  ['Census 2011 + 2024 projection', '2024', 'Static layer', 'mod'],
  ['OpenStreetMap road network', '3 days', 'Sync', 'low'],
  ['Field verification records', '1 h', 'In-app', 'low'],
];

const MODEL_CARD = [
  ['Version', 'v2.4.1'],
  ['Trained', '21 Aug 2026'],
  ['Training records', '214 labelled habitation-events'],
  ['Architecture', 'Gradient-boosted trees + physical rule layer'],
  ['Explainer', 'SHAP contributions per prediction'],
  ['Refresh', 'Weekly, or on 20 new field labels'],
  ['Data freshness score', '98%'],
];

const LIMITATIONS = [
  'Seasonal labour movement is invisible to the population layer, so summer exposure is probably understated.',
  'No structural survey covers 61% of buildings. Fragility is inferred from material class.',
  'Cloudburst nowcasting has a useful horizon of roughly 90 minutes. Beyond that the model is guessing.',
  'The model has never seen a glacial lake outburst in its training data. It would score one as an ordinary flood.',
  'Rule layer thresholds come from BIS and NDMA norms, which are national. Local geology can differ sharply.',
];

export default function DataAI({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Transparency</div>
          <h1 className="h-page">Data and AI</h1>
          <p>Everything the model is built from, and everything it cannot see. An officer who cannot answer "where did this number come from" will not defend the system when it is questioned.</p>
        </div>
        <span className="chip c-low">Model healthy</span>
      </div>

      {/* Pipeline */}
      <div className="card" style={{ marginBottom: 12 }}>
        <header><span className="h-sec">Pipeline</span></header>
        <div className="bd">
          <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            {STAGES.map((s, i) => (
              <div key={i} style={{
                flex: 1,
                minWidth: 112,
                padding: '11px 9px',
                background: i < 5 ? 'var(--panel2)' : 'var(--accent-ink)',
                border: `1px solid ${i < 5 ? 'var(--line)' : 'var(--accent-dim)'}`,
                borderRight: i === STAGES.length - 1 ? `1px solid var(--accent-dim)` : 'none',
              }}>
                <div className="eyebrow" style={{ color: i < 5 ? 'var(--dim)' : 'var(--accent)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, margin: '2px 0 2px' }}>{s[0]}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{s[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three-column grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(288px,1fr))' }}>
        {/* Data sources */}
        <div className="card">
          <header><span className="h-sec">Data sources</span></header>
          <div style={{ padding: 0 }}>
            {DATA_SOURCES.map(([n, age, kind, c], i) => (
              <div key={i} style={{ padding: '9px 12px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{n}</div>
                  <div className="eyebrow">{kind}</div>
                </div>
                <span className={`chip c-${c}`}>{age}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Model card */}
        <div className="card">
          <header><span className="h-sec">Model card</span></header>
          <div className="bd">
            {MODEL_CARD.map(([k, v]) => (
              <div className="kv" key={k}>
                <span className="k">{k}</span>
                <span className="v">{v}</span>
              </div>
            ))}
            <div className="note warn" style={{ marginTop: 10 }}>
              214 training records is a small dataset for a model that influences relocation. Confidence intervals are wide on rare hazard types, and the model should not be used outside Uttarakhand hill districts without retraining.
            </div>
          </div>
        </div>

        {/* Known limitations */}
        <div className="card">
          <header><span className="h-sec">Known limitations</span></header>
          <div className="bd">
            {LIMITATIONS.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px dashed var(--line)' }}>
                <span style={{ color: 'var(--mod)' }}>!</span>
                <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
