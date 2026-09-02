import { useState } from 'react';
import { band, bandName, bandColor, priColor, priBand, fmt, safeCap, overload } from '../risk.js';
import { HABS, CAPDET } from '../demoData.js';

const Meter = ({ v, color }) => (
  <div className="meter">
    <div className="bar">
      <i style={{ width: `${v}%`, background: color || bandColor(v) }} />
    </div>
    <span className="pct" style={{ color: color || bandColor(v) }}>{v}</span>
  </div>
);

const Chip = ({ cls, txt }) => (
  <span className={`chip c-${cls}`}>{txt}</span>
);

export default function Habitations({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const [sort, setSort] = useState({ k: 'risk', d: -1 });
  const [filt, setFilt] = useState({ q: '', haz: 'All', pri: 'All', ver: 'All' });

  const sortBy = (k) => {
    setSort(prev => prev.k === k ? { k, d: -prev.d } : { k, d: -1 });
  };

  let rows = HABS.filter(h =>
    (!filt.q || h.n.toLowerCase().includes(filt.q.toLowerCase()) || h.blk.toLowerCase().includes(filt.q.toLowerCase()))
    && (filt.pri === 'All' || h.pri === filt.pri)
    && (filt.ver === 'All' || h.ver === filt.ver)
    && (filt.haz === 'All' || h.hazards[filt.haz] >= 60)
  );

  rows = [...rows].sort((a, b) => {
    const k = sort.k;
    let x = a[k], y = b[k];
    if (typeof x === 'string') return x.localeCompare(y) * -sort.d;
    return (x - y) * -sort.d;
  });

  const Th = ({ k, label }) => (
    <th onClick={() => sortBy(k)}>
      {label}{sort.k === k ? <span className="ar">{sort.d < 0 ? ' ▼' : ' ▲'}</span> : null}
    </th>
  );

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 03 · rank</div>
          <h1 className="h-page">Habitation ranking</h1>
          <p>Ten habitations, ordered by the composite score. Rank is not the same as priority — a village can be high risk and still sit at P3 if it has room and a road out.</p>
        </div>
        <span className="eyebrow">{rows.length} of {HABS.length} shown</span>
      </div>

      <div className="filters">
        <input
          placeholder="Search habitation or block"
          value={filt.q}
          onChange={e => setFilt(f => ({ ...f, q: e.target.value }))}
        />
        <select value={filt.haz} onChange={e => setFilt(f => ({ ...f, haz: e.target.value }))}>
          {['All', 'Flood', 'Landslide', 'Cloudburst', 'Earthquake'].map(x => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
        <select value={filt.pri} onChange={e => setFilt(f => ({ ...f, pri: e.target.value }))}>
          {['All', 'P1', 'P2', 'P3', 'P4'].map(x => (
            <option key={x} value={x}>{x === 'All' ? 'All priorities' : x}</option>
          ))}
        </select>
        <select value={filt.ver} onChange={e => setFilt(f => ({ ...f, ver: e.target.value }))}>
          {['All', 'Verified', 'In progress', 'Assigned', 'Not started'].map(x => (
            <option key={x} value={x}>{x === 'All' ? 'All verification states' : x}</option>
          ))}
        </select>
        <button className="btn sm" onClick={() => setFilt({ q: '', haz: 'All', pri: 'All', ver: 'All' })}>Clear</button>
      </div>

      <div className="card">
        <div style={{ overflow: 'auto', maxHeight: '60vh' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <Th k="n" label="Habitation" />
                <Th k="blk" label="Block" />
                <Th k="pop" label="Population" />
                <Th k="risk" label="Hazard risk" />
                <Th k="vln" label="Vulnerability" />
                <Th k="exp" label="Exposure" />
                <Th k="acc" label="Access" />
                <th>Capacity</th>
                <Th k="pri" label="Priority" />
                <Th k="ver" label="Verification" />
              </tr>
            </thead>
            <tbody>
              {rows.map((h, i) => {
                const ov = overload(h.pop, safeCap(CAPDET[h.id]));
                return (
                  <tr key={h.id} onClick={() => { setSelHab(h.id); go('ai'); }}>
                    <td className="rank">{String(i + 1).padStart(2, '0')}</td>
                    <td><b>{h.n}</b></td>
                    <td style={{ color: 'var(--muted)' }}>{h.blk}</td>
                    <td className="n">{fmt(h.pop)}</td>
                    <td style={{ minWidth: 110 }}><Meter v={h.risk} /></td>
                    <td style={{ minWidth: 100 }}><Meter v={h.vln} /></td>
                    <td className="n">{h.exp}</td>
                    <td><Chip cls={h.acc === 'Poor' ? 'crit' : h.acc === 'Moderate' ? 'mod' : 'low'} txt={h.acc} /></td>
                    <td>{ov > 0 ? <Chip cls={ov > 50 ? 'crit' : 'high'} txt={`over ${ov}%`} /> : <Chip cls="low" txt="within" />}</td>
                    <td><Chip cls={priBand(h.pri)} txt={h.pri} /></td>
                    <td style={{ fontSize: 11.5, color: 'var(--muted)' }}>{h.ver}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="note" style={{ marginTop: 11 }}>Sort by any column. Click a row to open that habitation's full intelligence profile.</div>
    </>
  );
}
