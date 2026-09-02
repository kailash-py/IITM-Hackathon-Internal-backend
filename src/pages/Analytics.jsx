import { band, bandColor, priColor, fmt } from '../risk.js';
import { HABS, SITES } from '../demoData.js';

function Spark({ values, color }) {
  const mx = Math.max(...values);
  const mn = Math.min(...values);
  const pts = values.map((v, i) =>
    `${(i / (values.length - 1)) * 300},${56 - ((v - mn) / (mx - mn || 1)) * 48}`
  ).join(' ');

  return (
    <svg viewBox="0 0 300 60" style={{ width: '100%', height: 58 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
      <polyline points={`0,60 ${pts} 300,60`} fill={color} opacity=".1" />
    </svg>
  );
}

function Bars({ data }) {
  const mx = Math.max(...data.map(d => d[1]));
  return data.map((d, i) => (
    <div style={{ marginBottom: 7 }} key={i}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span>{d[0]}</span>
        <span className="num" style={{ fontWeight: 600 }}>{d[1]}</span>
      </div>
      <div className="bar" style={{ marginTop: 3 }}>
        <i style={{ width: `${(d[1] / mx) * 100}%`, background: d[2] || 'var(--accent)' }} />
      </div>
    </div>
  ));
}

export default function Analytics({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 12 · learn</div>
          <h1 className="h-page">Analytics</h1>
          <p>Two things worth watching: whether the district is getting safer, and whether the model deserves to be trusted.</p>
        </div>
        <button className="btn" onClick={() => go('reports')}>Export</button>
      </div>

      <div className="tabs">
        <button className="on">District</button>
        <button onClick={() => go('dataai')}>Model</button>
        <button onClick={() => go('reports')}>Reports</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))' }}>
        {/* Mean district risk */}
        <div className="card">
          <header>
            <span className="h-sec">Mean district risk, 12 weeks</span>
            <span className="chip c-high">+14</span>
          </header>
          <div className="bd">
            <Spark values={[48, 46, 49, 52, 51, 55, 58, 57, 62, 66, 71, 74]} color="var(--high)" />
            <div className="eyebrow">Rising through the monsoon build-up. Peak is typically week 14.</div>
          </div>
        </div>

        {/* Population exposed */}
        <div className="card">
          <header>
            <span className="h-sec">Population exposed</span>
            <span className="chip c-crit">12,010</span>
          </header>
          <div className="bd">
            <Spark values={[6200, 6400, 6900, 7400, 7800, 8600, 9100, 9400, 10200, 10800, 11400, 12010]} color="var(--crit)" />
            <div className="eyebrow">People inside high or critical polygons, district total.</div>
          </div>
        </div>

        {/* Median rescue response */}
        <div className="card">
          <header>
            <span className="h-sec">Median rescue response</span>
            <span className="chip c-low">−9 min</span>
          </header>
          <div className="bd">
            <Spark values={[44, 43, 45, 41, 40, 38, 39, 36, 34, 33, 31, 29]} color="var(--low)" />
            <div className="eyebrow">Minutes from dispatch to on-site, rolling median.</div>
          </div>
        </div>

        {/* Risk distribution */}
        <div className="card">
          <header><span className="h-sec">Risk distribution</span></header>
          <div className="bd">
            <Bars data={[
              ['Critical 85+', HABS.filter(h => h.risk >= 85).length, 'var(--crit)'],
              ['High 70–84', HABS.filter(h => h.risk >= 70 && h.risk < 85).length, 'var(--high)'],
              ['Moderate 50–69', HABS.filter(h => h.risk >= 50 && h.risk < 70).length, 'var(--mod)'],
              ['Low under 50', HABS.filter(h => h.risk < 50).length, 'var(--low)'],
            ]} />
          </div>
        </div>

        {/* Priority distribution */}
        <div className="card">
          <header><span className="h-sec">Relocation priority</span></header>
          <div className="bd">
            <Bars data={['P1', 'P2', 'P3', 'P4'].map(p => [
              p + ' · ' + HABS.filter(h => h.pri === p).length + ' habitations',
              HABS.filter(h => h.pri === p).reduce((a, h) => a + h.pop, 0),
              priColor(p),
            ])} />
          </div>
        </div>

        {/* Safe-site utilisation */}
        <div className="card">
          <header><span className="h-sec">Safe-site utilisation</span></header>
          <div className="bd">
            <Bars data={SITES.map(s => [
              s.n,
              Math.round((s.used / s.cap) * 100),
              s.used / s.cap > 0.55 ? 'var(--high)' : 'var(--low)',
            ])} />
            <div className="eyebrow">Percent of places occupied. Above 55% suitability starts to fall.</div>
          </div>
        </div>

        {/* Operational counters */}
        <div className="card">
          <header><span className="h-sec">Operational counters</span></header>
          <div className="bd">
            {[
              ['Alerts issued, 30 days', '23'],
              ['Mean delivery rate', '90%'],
              ['Families reunited', '2 of 3'],
              ['Verification tasks closed', '1 of 4'],
              ['Proposals approved', '1'],
              ['Median approval turnaround', '19 min'],
            ].map(([k, v]) => (
              <div className="kv" key={k}>
                <span className="k">{k}</span>
                <span className="v">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Model performance */}
        <div className="card">
          <header>
            <span className="h-sec">Model performance</span>
            <span className="chip c-info">v2.4.1</span>
          </header>
          <div className="bd">
            {[
              ['Precision', '0.81'],
              ['Recall', '0.83'],
              ['F1', '0.82'],
              ['Brier score', '0.11'],
              ['Calibration slope', '0.94'],
            ].map(([k, v]) => (
              <div className="kv" key={k}>
                <span className="k">{k}</span>
                <span className="v">{v}</span>
              </div>
            ))}
            <div className="note warn" style={{ marginTop: 9 }}>
              Recall matters more than precision here. A missed high-risk habitation costs lives; a false alarm costs a wasted field visit. The threshold is set accordingly, and that is a policy choice, not a technical one.
            </div>
          </div>
        </div>

        {/* Confusion matrix */}
        <div className="card">
          <header>
            <span className="h-sec">Confusion matrix</span>
            <span className="eyebrow">held-out, n=214</span>
          </header>
          <div className="bd">
            <table style={{ textAlign: 'center' }}>
              <thead>
                <tr><th></th><th>Pred high</th><th>Pred low</th></tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ textAlign: 'left' }}>Actual high</th>
                  <td className="n" style={{ background: 'var(--low-bg)', color: 'var(--low)', fontWeight: 700 }}>54</td>
                  <td className="n" style={{ background: 'var(--crit-bg)', color: '#FF8080', fontWeight: 700 }}>11</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left' }}>Actual low</th>
                  <td className="n" style={{ background: 'var(--mod-bg)', color: 'var(--mod)', fontWeight: 700 }}>13</td>
                  <td className="n" style={{ background: 'var(--low-bg)', color: 'var(--low)', fontWeight: 700 }}>136</td>
                </tr>
              </tbody>
            </table>
            <div className="eyebrow" style={{ marginTop: 8 }}>
              11 missed high-risk cases. Each one is reviewed by hand and fed back as a training label.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
