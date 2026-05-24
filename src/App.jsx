import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// ── Helpers ──────────────────────────────────────────────────────────────────
const TECHNICIENS = ['Quentin 1', 'Quentin 2', 'Eric', 'Hugo', 'Guillaume', 'Jean-Phi', 'Jean Paul']
const TYPES_INT = ['Électricité', 'Plomberie', 'Mobilier', 'Serrurerie', 'Climatisation', 'Piscine', 'Espaces verts', 'Ménage', 'Divers']
const STATUTS_EMPL = ['Libre', 'Occupé', 'Départ', 'Ménage', 'Maintenance']
const SOURCES_AVIS = ['Google', 'Booking', 'TripAdvisor', 'Abritel', 'Direct']

const pill = (statut) => {
  const map = {
    'Libre': { bg: '#EAF3DE', color: '#3B6D11', border: '#97C459' },
    'Occupé': { bg: '#FAEEDA', color: '#BA7517', border: '#FAC775' },
    'Départ': { bg: '#E6F1FB', color: '#185FA5', border: '#85B7EB' },
    'Ménage': { bg: '#F1EFE8', color: '#5F5E5A', border: '#B4B2A9' },
    'Maintenance': { bg: '#FCEBEB', color: '#A32D2D', border: '#F09595' },
    'Ouvert': { bg: '#FCEBEB', color: '#A32D2D', border: '#F09595' },
    'En cours': { bg: '#FAEEDA', color: '#BA7517', border: '#FAC775' },
    'Terminé': { bg: '#EAF3DE', color: '#3B6D11', border: '#97C459' },
    'A faire': { bg: '#FCEBEB', color: '#A32D2D', border: '#F09595' },
    'Urgente': { bg: '#FCEBEB', color: '#A32D2D', border: '#F09595' },
    'Normale': { bg: '#E6F1FB', color: '#185FA5', border: '#85B7EB' },
    'Basse': { bg: '#EAF3DE', color: '#3B6D11', border: '#97C459' },
  }
  return map[statut] || { bg: '#F1EFE8', color: '#5F5E5A', border: '#B4B2A9' }
}

const Pill = ({ label }) => {
  const s = pill(label)
  return (
    <span style={{ background: s.bg, color: s.color, border: `0.5px solid ${s.border}`, borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

const Btn = ({ children, onClick, primary, danger, small, style = {} }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: small ? '5px 10px' : '7px 14px',
    borderRadius: 8, border: primary ? 'none' : danger ? '0.5px solid #F09595' : '0.5px solid rgba(0,0,0,0.15)',
    background: primary ? '#639922' : danger ? '#FCEBEB' : '#fff',
    color: primary ? '#fff' : danger ? '#A32D2D' : '#1C1C1A',
    fontSize: small ? 11 : 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', ...style
  }}>{children}</button>
)

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: '#fff', borderRadius: 14, width: 520, maxHeight: '85vh', overflowY: 'auto', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#9C9B96', cursor: 'pointer' }}><i className="ti ti-x" /></button>
      </div>
      {children}
    </div>
  </div>
)

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6B6A65', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</label>
    {children}
  </div>
)

const Input = ({ value, onChange, placeholder, type = 'text' }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: '100%', padding: '8px 10px', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 8, fontSize: 13, background: '#fff', color: '#1C1C1A', outline: 'none' }} />
)

const Select = ({ value, onChange, children }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: '100%', padding: '8px 10px', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 8, fontSize: 13, background: '#fff', color: '#1C1C1A', outline: 'none', cursor: 'pointer' }}>
    {children}
  </select>
)

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: '100%', padding: '8px 10px', border: '0.5px solid rgba(0,0,0,0.18)', borderRadius: 8, fontSize: 13, background: '#fff', color: '#1C1C1A', outline: 'none', resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }} />
)

const Toast = ({ msg, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t) }, [])
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#2C2C2A', color: '#fff', padding: '10px 16px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, zIndex: 300, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }} className="fade-in">
      <i className="ti ti-check" style={{ color: '#97C459' }} />{msg}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', icon: 'ti-layout-dashboard', label: 'Tableau de bord' },
  { id: 'plan', icon: 'ti-map-2', label: 'Plan du camping' },
  { id: 'interventions', icon: 'ti-tool', label: 'Interventions' },
  { id: 'menage', icon: 'ti-sparkles', label: 'Checks ménage' },
  { id: 'commentaires', icon: 'ti-message-circle', label: 'Commentaires' },
]

const Sidebar = ({ page, setPage, counts }) => (
  <div style={{ width: 220, background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh', position: 'sticky', top: 0 }}>
    <div style={{ padding: '18px 16px', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, background: '#EAF3DE', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-trees" style={{ fontSize: 15, color: '#3B6D11' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>CampingPro</div>
          <div style={{ fontSize: 10, color: '#9C9B96' }}>Gestion · Saison 2025</div>
        </div>
      </div>
    </div>
    <nav style={{ padding: 8, flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: '#9C9B96', textTransform: 'uppercase', letterSpacing: '.05em', padding: '10px 8px 6px' }}>Navigation</div>
      {NAV.map(n => (
        <div key={n.id} onClick={() => setPage(n.id)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
          background: page === n.id ? '#EAF3DE' : 'transparent',
          color: page === n.id ? '#3B6D11' : '#6B6A65',
          fontWeight: page === n.id ? 500 : 400, fontSize: 13, marginBottom: 2, transition: 'all .15s'
        }}>
          <i className={`ti ${n.icon}`} style={{ fontSize: 16, width: 18, textAlign: 'center' }} />
          <span style={{ flex: 1 }}>{n.label}</span>
          {counts[n.id] > 0 && <span style={{ background: n.id === 'commentaires' ? '#EAF3DE' : '#FCEBEB', color: n.id === 'commentaires' ? '#3B6D11' : '#A32D2D', fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 500 }}>{counts[n.id]}</span>}
        </div>
      ))}
    </nav>
    <div style={{ padding: 12, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#3B6D11' }}>G</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>Gérant</div>
          <div style={{ fontSize: 10, color: '#9C9B96' }}>Accès complet</div>
        </div>
      </div>
    </div>
  </div>
)

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = ({ emplacements, interventions, menages, commentaires, setPage }) => {
  const stats = {
    total: emplacements.length,
    occupes: emplacements.filter(e => e.statut === 'Occupé').length,
    departs: emplacements.filter(e => e.statut === 'Départ').length,
    maintenance: emplacements.filter(e => e.statut === 'Maintenance').length,
    menage: emplacements.filter(e => e.statut === 'Ménage').length,
  }
  const tx = stats.total ? Math.round(stats.occupes / stats.total * 100) : 0
  const intOuvertes = interventions.filter(i => i.statut !== 'Terminé').length
  const intUrgentes = interventions.filter(i => i.priorite === 'Urgente' && i.statut !== 'Terminé').length
  const menageTodo = menages.filter(m => m.statut !== 'Terminé').length
  const noteAvg = commentaires.length ? (commentaires.reduce((a, c) => a + (c.note || 0), 0) / commentaires.length).toFixed(1) : '—'

  const StatCard = ({ label, value, sub, color, icon, onClick }) => (
    <div onClick={onClick} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '16px 18px', cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow .15s' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)')}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B6A65', marginBottom: 8 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 14 }} />{label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9C9B96', marginTop: 4 }}>{sub}</div>}
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#9C9B96', marginBottom: 4 }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div style={{ fontSize: 22, fontWeight: 600 }}>Bonjour 👋</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Taux d'occupation" value={`${tx}%`} sub={`${stats.occupes}/${stats.total} emplacements`} color="#3B6D11" icon="ti-home" />
        <StatCard label="Départs aujourd'hui" value={stats.departs} sub="À libérer" color="#185FA5" icon="ti-door-exit" onClick={() => setPage('plan')} />
        <StatCard label="Interventions ouvertes" value={intOuvertes} sub={intUrgentes > 0 ? `⚠️ ${intUrgentes} urgente(s)` : 'Aucune urgence'} color={intUrgentes > 0 ? '#A32D2D' : '#BA7517'} icon="ti-tool" onClick={() => setPage('interventions')} />
        <StatCard label="Note moyenne" value={noteAvg} sub={`${commentaires.length} avis cette saison`} color="#3B6D11" icon="ti-star" onClick={() => setPage('commentaires')} />
      </div>

      {/* Barre occupation */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>État du camping</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6B6A65' }}>
            {[['Libre', '#EAF3DE', '#97C459'], ['Occupé', '#FAEEDA', '#FAC775'], ['Départ', '#E6F1FB', '#85B7EB'], ['Ménage', '#F1EFE8', '#B4B2A9'], ['Maintenance', '#FCEBEB', '#F09595']].map(([s, bg, bc]) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: bg, border: `1px solid ${bc}` }} />{s}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', gap: 1 }}>
          {[
            ['Libre', emplacements.filter(e => e.statut === 'Libre').length, '#C0DD97'],
            ['Occupé', stats.occupes, '#FAC775'],
            ['Départ', stats.departs, '#85B7EB'],
            ['Ménage', stats.menage, '#B4B2A9'],
            ['Maintenance', stats.maintenance, '#F09595'],
          ].map(([s, count, color]) => count > 0 ? (
            <div key={s} title={`${s}: ${count}`} style={{ flex: count, background: color, transition: 'flex .3s' }} />
          ) : null)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#9C9B96' }}>
          <span>{emplacements.filter(e => e.statut === 'Libre').length} libres</span>
          <span>{stats.menage} ménage</span>
          <span>{stats.maintenance} maintenance</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Interventions récentes */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Interventions récentes</div>
            <Btn small onClick={() => setPage('interventions')}>Voir tout <i className="ti ti-arrow-right" /></Btn>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden' }}>
            {interventions.slice(0, 5).length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#9C9B96', fontSize: 12 }}>Aucune intervention</div>
            ) : interventions.slice(0, 5).map(i => (
              <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                <Pill label={i.statut} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.titre}</div>
                  <div style={{ fontSize: 11, color: '#9C9B96' }}>{i.emplacements?.numero} · {i.assigne_a || 'Non assigné'}</div>
                </div>
                <Pill label={i.priorite} />
              </div>
            ))}
          </div>
        </div>

        {/* Ménages du jour */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Checks ménage du jour</div>
            <Btn small onClick={() => setPage('menage')}>Voir tout <i className="ti ti-arrow-right" /></Btn>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden' }}>
            {menages.slice(0, 5).length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#9C9B96', fontSize: 12 }}>Aucun check aujourd'hui</div>
            ) : menages.slice(0, 5).map(m => {
              const checks = ['literie', 'salle_de_bain', 'cuisine', 'salon', 'terrasse', 'inventaire', 'photos_prises']
              const done = checks.filter(k => m[k]).length
              const pct = Math.round(done / checks.length * 100)
              return (
                <div key={m.id} style={{ padding: '10px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <Pill label={m.statut} />
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{m.emplacements?.numero}</div>
                    <div style={{ fontSize: 11, color: '#9C9B96', flex: 1 }}>{m.assigne_a || 'Non assigné'}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: pct === 100 ? '#3B6D11' : '#BA7517' }}>{pct}%</div>
                  </div>
                  <div style={{ height: 3, background: '#F1EFE8', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#639922' : '#EF9F27', transition: 'width .3s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Plan du camping ───────────────────────────────────────────────────────────
const Plan = ({ emplacements, onUpdate, toast }) => {
  const [filtre, setFiltre] = useState('Tous')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [editStatut, setEditStatut] = useState('')

  const filtered = emplacements.filter(e => {
    const matchFiltre = filtre === 'Tous' || e.statut === filtre
    const matchSearch = e.numero.toLowerCase().includes(search.toLowerCase()) ||
      (e.modele || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.client_actuel || '').toLowerCase().includes(search.toLowerCase())
    return matchFiltre && matchSearch
  })

  const counts = STATUTS_EMPL.reduce((a, s) => ({ ...a, [s]: emplacements.filter(e => e.statut === s).length }), {})

  const emplColors = {
    'Libre': { bg: '#EAF3DE', border: '#97C459', dot: null },
    'Occupé': { bg: '#FAEEDA', border: '#FAC775', dot: null },
    'Départ': { bg: '#E6F1FB', border: '#85B7EB', dot: '#185FA5' },
    'Ménage': { bg: '#F1EFE8', border: '#B4B2A9', dot: '#BA7517' },
    'Maintenance': { bg: '#FCEBEB', border: '#F09595', dot: '#A32D2D' },
  }

  const updateStatut = async () => {
    const { error } = await supabase.from('emplacements').update({ statut: editStatut }).eq('id', selected.id)
    if (!error) { onUpdate(); setSelected(null); toast('Statut mis à jour !') }
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un emplacement, modèle, client…"
          style={{ flex: 1, minWidth: 200, padding: '7px 12px', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fff' }} />
        {['Tous', ...STATUTS_EMPL].map(s => (
          <button key={s} onClick={() => setFiltre(s)} style={{
            padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: '0.5px solid',
            background: filtre === s ? (s === 'Tous' ? '#639922' : emplColors[s]?.bg || '#EAF3DE') : '#fff',
            borderColor: filtre === s ? (s === 'Tous' ? '#639922' : emplColors[s]?.border || '#97C459') : 'rgba(0,0,0,0.15)',
            color: filtre === s ? (s === 'Tous' ? '#fff' : emplColors[s] ? pill(s).color : '#3B6D11') : '#6B6A65',
          }}>
            {s}{s !== 'Tous' ? ` (${counts[s] || 0})` : ` (${emplacements.length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 6 }}>
        {filtered.map(e => {
          const c = emplColors[e.statut] || emplColors['Libre']
          return (
            <div key={e.id} onClick={() => { setSelected(e); setEditStatut(e.statut) }}
              style={{ background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 8, padding: '8px 6px', textAlign: 'center', cursor: 'pointer', position: 'relative', transition: 'transform .1s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              {c.dot && <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: c.dot }} />}
              <div style={{ fontSize: 11, fontWeight: 600 }}>{e.numero}</div>
              <div style={{ fontSize: 9, color: '#6B6A65', marginTop: 1 }}>{e.modele?.split(' ')[0]}</div>
              {e.client_actuel && <div style={{ fontSize: 9, color: '#9C9B96', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.client_actuel.split(' ')[0]}</div>}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9C9B96' }}>
          <i className="ti ti-search-off" style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
          Aucun emplacement trouvé
        </div>
      )}

      {selected && (
        <Modal title={`Emplacement ${selected.numero}`} onClose={() => setSelected(null)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <Pill label={selected.statut} />
            <span style={{ background: '#F1EFE8', color: '#5F5E5A', border: '0.5px solid #B4B2A9', borderRadius: 20, padding: '2px 9px', fontSize: 11 }}>{selected.modele}</span>
            <span style={{ background: '#F1EFE8', color: '#5F5E5A', border: '0.5px solid #B4B2A9', borderRadius: 20, padding: '2px 9px', fontSize: 11 }}>TP {selected.capacite} · {selected.jour_rotation}</span>
            {selected.placette && <span style={{ background: '#EAF3DE', color: '#3B6D11', border: '0.5px solid #97C459', borderRadius: 20, padding: '2px 9px', fontSize: 11 }}>Placette</span>}
          </div>
          {selected.client_actuel && (
            <div style={{ background: '#F7F6F3', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#9C9B96', marginBottom: 3 }}>Client actuel</div>
              <div style={{ fontWeight: 500 }}>{selected.client_actuel}</div>
              {selected.date_arrivee && <div style={{ fontSize: 12, color: '#6B6A65', marginTop: 4 }}>Du {selected.date_arrivee} au {selected.date_depart}</div>}
            </div>
          )}
          <Field label="Changer le statut">
            <Select value={editStatut} onChange={setEditStatut}>
              {STATUTS_EMPL.map(s => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Notes"><Textarea value={selected.notes || ''} onChange={() => {}} placeholder="Notes sur cet emplacement…" rows={2} /></Field>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
            <Btn onClick={() => setSelected(null)}>Annuler</Btn>
            <Btn primary onClick={updateStatut}><i className="ti ti-check" />Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Interventions ─────────────────────────────────────────────────────────────
const Interventions = ({ interventions, emplacements, onUpdate, toast }) => {
  const [filtre, setFiltre] = useState('Tous')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ titre: '', emplacement_id: '', type_intervention: 'Électricité', priorite: 'Normale', assigne_a: '', description: '' })

  const filtered = interventions.filter(i => filtre === 'Tous' || i.statut === filtre || (filtre === 'Urgente' && i.priorite === 'Urgente'))

const save = async () => {
    const titre = form.titre || `${form.type_intervention} — ${new Date().toLocaleDateString('fr-FR')}`
    const { error } = await supabase.from('interventions').insert([{ ...form, titre, statut: 'Ouvert', date_signalee: new Date().toISOString().split('T')[0] }])
    if (!error) { setShowForm(false); setForm({ titre: '', emplacement_id: '', type_intervention: 'Électricité', priorite: 'Normale', assigne_a: '', description: '' }); onUpdate(); toast('Intervention créée !') }
}
  }

  const changeStatut = async (id, statut) => {
    await supabase.from('interventions').update({ statut }).eq('id', id)
    onUpdate(); setSelected(s => s ? { ...s, statut } : null); toast('Statut mis à jour !')
  }

  const saveResolution = async () => {
    await supabase.from('interventions').update({ resolution: selected.resolution }).eq('id', selected.id)
    onUpdate(); setSelected(null); toast('Résolution enregistrée !')
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {['Tous', 'Ouvert', 'En cours', 'Terminé', 'Urgente'].map(f => (
            <button key={f} onClick={() => setFiltre(f)} style={{
              padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: filtre === f ? '#639922' : '#fff', color: filtre === f ? '#fff' : '#6B6A65',
              border: filtre === f ? 'none' : '0.5px solid rgba(0,0,0,0.15)'
            }}>{f} {f !== 'Tous' && f !== 'Urgente' ? `(${interventions.filter(i => i.statut === f).length})` : ''}</button>
          ))}
        </div>
        <Btn primary onClick={() => setShowForm(true)}><i className="ti ti-plus" />Nouvelle</Btn>
      </div>

      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 110px 120px 90px', background: '#F7F6F3', borderBottom: '0.5px solid rgba(0,0,0,0.08)', padding: '8px 14px', fontSize: 10, fontWeight: 600, color: '#9C9B96', textTransform: 'uppercase', letterSpacing: '.04em', gap: 8 }}>
          <div>Titre / Description</div><div>Empl.</div><div>Type</div><div>Priorité</div><div>Assigné à</div><div>Statut</div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#9C9B96', fontSize: 12 }}>Aucune intervention</div>
        ) : filtered.map(i => (
          <div key={i.id} onClick={() => setSelected({ ...i })} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 110px 120px 90px', padding: '11px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', cursor: 'pointer', gap: 8, alignItems: 'center', transition: 'background .1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F7F6F3'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{i.titre}</div>
              <div style={{ fontSize: 11, color: '#9C9B96', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.description}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{i.emplacements?.numero || '—'}</div>
            <div style={{ fontSize: 11, color: '#6B6A65' }}>{i.type_intervention}</div>
            <Pill label={i.priorite} />
            <div style={{ fontSize: 11, color: '#6B6A65' }}>{i.assigne_a || <em style={{ opacity: .5 }}>Non assigné</em>}</div>
            <Pill label={i.statut} />
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title="Nouvelle intervention" onClose={() => setShowForm(false)}>
          <Field label="Titre *"><Input value={form.titre} onChange={v => setForm(f => ({ ...f, titre: v }))} placeholder="Ex: Robinet cassé salle de bain" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Emplacement">
              <Select value={form.emplacement_id} onChange={v => setForm(f => ({ ...f, emplacement_id: v }))}>
                <option value="">Choisir…</option>
                {emplacements.map(e => <option key={e.id} value={e.id}>{e.numero} — {e.modele}</option>)}
              </Select>
            </Field>
            <Field label="Type">
              <Select value={form.type_intervention} onChange={v => setForm(f => ({ ...f, type_intervention: v }))}>
                {TYPES_INT.map(t => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Priorité">
              <Select value={form.priorite} onChange={v => setForm(f => ({ ...f, priorite: v }))}>
                {['Urgente', 'Normale', 'Basse'].map(p => <option key={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Assigné à">
              <Select value={form.assigne_a} onChange={v => setForm(f => ({ ...f, assigne_a: v }))}>
                <option value="">Non assigné</option>
                {TECHNICIENS.map(t => <option key={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Description"><Textarea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Décrivez le problème…" /></Field>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
            <Btn onClick={() => setShowForm(false)}>Annuler</Btn>
            <Btn primary onClick={save}><i className="ti ti-check" />Créer l'intervention</Btn>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={`Intervention — ${selected.titre}`} onClose={() => setSelected(null)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <Pill label={selected.statut} /><Pill label={selected.priorite} />
            {selected.emplacements && <span style={{ background: '#F1EFE8', color: '#5F5E5A', border: '0.5px solid #B4B2A9', borderRadius: 20, padding: '2px 9px', fontSize: 11 }}>Empl. {selected.emplacements.numero}</span>}
          </div>
          <div style={{ background: '#F7F6F3', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#6B6A65', lineHeight: 1.6 }}>{selected.description || 'Pas de description'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14, fontSize: 12 }}>
            <div><div style={{ fontSize: 10, color: '#9C9B96', marginBottom: 2 }}>TYPE</div>{selected.type_intervention}</div>
            <div><div style={{ fontSize: 10, color: '#9C9B96', marginBottom: 2 }}>ASSIGNÉ À</div>{selected.assigne_a || 'Non assigné'}</div>
            <div><div style={{ fontSize: 10, color: '#9C9B96', marginBottom: 2 }}>DATE</div>{selected.date_signalee}</div>
          </div>
          <Field label="Changer le statut">
            <div style={{ display: 'flex', gap: 6 }}>
              {['Ouvert', 'En cours', 'Terminé'].map(s => (
                <button key={s} onClick={() => changeStatut(selected.id, s)} style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  background: selected.statut === s ? '#639922' : '#fff', color: selected.statut === s ? '#fff' : '#6B6A65',
                  border: selected.statut === s ? 'none' : '0.5px solid rgba(0,0,0,0.15)'
                }}>{s}</button>
              ))}
            </div>
          </Field>
          <Field label="Résolution / Actions effectuées">
            <Textarea value={selected.resolution || ''} onChange={v => setSelected(s => ({ ...s, resolution: v }))} placeholder="Décrivez ce qui a été fait…" />
          </Field>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
            <Btn onClick={() => setSelected(null)}>Fermer</Btn>
            <Btn primary onClick={saveResolution}><i className="ti ti-check" />Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Checks Ménage ─────────────────────────────────────────────────────────────
const CHECKS = [
  { key: 'literie', label: 'Literie — changer draps, oreillers, couvertures', icon: 'ti-bed' },
  { key: 'salle_de_bain', label: 'Salle de bain — nettoyage complet, serviettes', icon: 'ti-bath' },
  { key: 'cuisine', label: 'Cuisine — plaques, four, réfrigérateur, vaisselle', icon: 'ti-soup' },
  { key: 'salon', label: 'Salon — aspiration, dépoussiérage, surfaces', icon: 'ti-sofa' },
  { key: 'terrasse', label: 'Terrasse / extérieur — balai, mobilier', icon: 'ti-plant' },
  { key: 'inventaire', label: 'Inventaire — vérifier le matériel présent', icon: 'ti-clipboard-list' },
  { key: 'photos_prises', label: 'Photos prises et envoyées', icon: 'ti-camera' },
]

const Menage = ({ menages, emplacements, onUpdate, toast }) => {
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [filtre, setFiltre] = useState('Tous')
  const [form, setForm] = useState({ emplacement_id: '', assigne_a: '', client_partant: '', heure_depart: '' })

  const filtered = menages.filter(m => filtre === 'Tous' || m.statut === filtre)

  const save = async () => {
    if (!form.emplacement_id) return
    await supabase.from('checks_menage').insert([{ ...form, statut: 'A faire', date_check: new Date().toISOString().split('T')[0] }])
    setShowForm(false); setForm({ emplacement_id: '', assigne_a: '', client_partant: '', heure_depart: '' }); onUpdate(); toast('Check créé !')
  }

  const toggleCheck = async (key) => {
    const newVal = !selected[key]
    await supabase.from('checks_menage').update({ [key]: newVal }).eq('id', selected.id)
    const updated = { ...selected, [key]: newVal }
    const allDone = CHECKS.every(c => updated[c.key])
    if (allDone && updated.statut !== 'Terminé') {
      await supabase.from('checks_menage').update({ statut: 'Terminé' }).eq('id', selected.id)
      updated.statut = 'Terminé'
    } else if (!allDone && updated.statut === 'A faire' && CHECKS.some(c => updated[c.key])) {
      await supabase.from('checks_menage').update({ statut: 'En cours' }).eq('id', selected.id)
      updated.statut = 'En cours'
    }
    setSelected(updated); onUpdate()
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          {['Tous', 'A faire', 'En cours', 'Terminé'].map(f => (
            <button key={f} onClick={() => setFiltre(f)} style={{
              padding: '5px 11px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: filtre === f ? '#639922' : '#fff', color: filtre === f ? '#fff' : '#6B6A65',
              border: filtre === f ? 'none' : '0.5px solid rgba(0,0,0,0.15)'
            }}>{f}</button>
          ))}
        </div>
        <Btn primary onClick={() => setShowForm(true)}><i className="ti ti-plus" />Nouveau check</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {filtered.map(m => {
          const done = CHECKS.filter(c => m[c.key]).length
          const pct = Math.round(done / CHECKS.length * 100)
          return (
            <div key={m.id} onClick={() => setSelected({ ...m })} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'box-shadow .15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Empl. {m.emplacements?.numero}</div>
                  <div style={{ fontSize: 11, color: '#9C9B96' }}>{m.emplacements?.modele}</div>
                </div>
                <Pill label={m.statut} />
              </div>
              {m.client_partant && <div style={{ fontSize: 11, color: '#6B6A65', marginBottom: 8 }}>↩ {m.client_partant} {m.heure_depart && `· ${m.heure_depart}`}</div>}
              <div style={{ fontSize: 11, color: '#6B6A65', marginBottom: 8 }}>{m.assigne_a || <em style={{ opacity: .5 }}>Non assigné</em>}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: '#F1EFE8', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#639922' : '#EF9F27', transition: 'width .3s' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: pct === 100 ? '#3B6D11' : '#BA7517' }}>{done}/{CHECKS.length}</span>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#9C9B96', fontSize: 12 }}>Aucun check ménage</div>}
      </div>

      {showForm && (
        <Modal title="Nouveau check ménage" onClose={() => setShowForm(false)}>
          <Field label="Emplacement *">
            <Select value={form.emplacement_id} onChange={v => setForm(f => ({ ...f, emplacement_id: v }))}>
              <option value="">Choisir…</option>
              {emplacements.map(e => <option key={e.id} value={e.id}>{e.numero} — {e.modele}</option>)}
            </Select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Client partant"><Input value={form.client_partant} onChange={v => setForm(f => ({ ...f, client_partant: v }))} placeholder="Nom" /></Field>
            <Field label="Heure de départ"><Input type="time" value={form.heure_depart} onChange={v => setForm(f => ({ ...f, heure_depart: v }))} /></Field>
          </div>
          <Field label="Assigné à">
            <Select value={form.assigne_a} onChange={v => setForm(f => ({ ...f, assigne_a: v }))}>
              <option value="">Non assigné</option>
              {TECHNICIENS.map(t => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
            <Btn onClick={() => setShowForm(false)}>Annuler</Btn>
            <Btn primary onClick={save}><i className="ti ti-check" />Créer</Btn>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title={`Check ménage — Empl. ${selected.emplacements?.numero}`} onClose={() => { setSelected(null); onUpdate() }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <Pill label={selected.statut} />
            {selected.assigne_a && <span style={{ background: '#E6F1FB', color: '#185FA5', border: '0.5px solid #85B7EB', borderRadius: 20, padding: '2px 9px', fontSize: 11 }}>{selected.assigne_a}</span>}
          </div>
          {selected.client_partant && <div style={{ background: '#F7F6F3', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#6B6A65' }}>Client partant : <strong>{selected.client_partant}</strong> à {selected.heure_depart || '—'}</div>}

          {(() => {
            const done = CHECKS.filter(c => selected[c.key]).length
            const pct = Math.round(done / CHECKS.length * 100)
            return (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B6A65', marginBottom: 5 }}>
                  <span>Progression</span>
                  <span style={{ fontWeight: 600, color: pct === 100 ? '#3B6D11' : '#BA7517' }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#F1EFE8', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#639922' : '#EF9F27', transition: 'width .3s' }} />
                </div>
              </div>
            )
          })()}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CHECKS.map(c => (
              <div key={c.key} onClick={() => toggleCheck(c.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `0.5px solid ${selected[c.key] ? '#97C459' : 'rgba(0,0,0,0.1)'}`, borderRadius: 8, cursor: 'pointer', background: selected[c.key] ? '#EAF3DE' : '#fff', transition: 'all .15s' }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${selected[c.key] ? '#639922' : 'rgba(0,0,0,0.2)'}`, background: selected[c.key] ? '#639922' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                  {selected[c.key] && <i className="ti ti-check" style={{ fontSize: 12, color: '#fff' }} />}
                </div>
                <i className={`ti ${c.icon}`} style={{ fontSize: 14, color: selected[c.key] ? '#3B6D11' : '#9C9B96' }} />
                <span style={{ fontSize: 12, color: selected[c.key] ? '#3B6D11' : '#1C1C1A', textDecoration: selected[c.key] ? 'line-through' : 'none', opacity: selected[c.key] ? .7 : 1 }}>{c.label}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <Field label="Observations"><Textarea value={selected.observations || ''} onChange={v => setSelected(s => ({ ...s, observations: v }))} placeholder="Problèmes constatés, dommages…" rows={2} /></Field>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
            <Btn onClick={() => { setSelected(null); onUpdate() }}>Fermer</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Commentaires ──────────────────────────────────────────────────────────────
const Commentaires = ({ commentaires, emplacements, onUpdate, toast }) => {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client: '', emplacement_id: '', note: 5, source: 'Google', commentaire: '', date_commentaire: new Date().toISOString().split('T')[0] })

  const avg = commentaires.length ? (commentaires.reduce((a, c) => a + c.note, 0) / commentaires.length).toFixed(1) : '—'

  const save = async () => {
    await supabase.from('commentaires').insert([form])
    setShowForm(false); onUpdate(); toast('Commentaire ajouté !')
  }

  const toggleRepondu = async (id, val) => {
    await supabase.from('commentaires').update({ repondu: !val }).eq('id', id)
    onUpdate()
  }

  const Stars = ({ n }) => (
    <span style={{ color: '#EF9F27', fontSize: 13, letterSpacing: 1 }}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#3B6D11' }}>{avg}</div>
          <Stars n={Math.round(parseFloat(avg) || 0)} />
          <div style={{ fontSize: 11, color: '#9C9B96', marginTop: 6 }}>{commentaires.length} avis</div>
        </div>
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '14px 18px' }}>
          {[5, 4, 3, 2, 1].map(n => {
            const count = commentaires.filter(c => c.note === n).length
            const pct = commentaires.length ? Math.round(count / commentaires.length * 100) : 0
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6B6A65', width: 12 }}>{n}</span>
                <span style={{ color: '#EF9F27', fontSize: 11 }}>★</span>
                <div style={{ flex: 1, height: 8, background: '#F1EFE8', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: n >= 4 ? '#639922' : n === 3 ? '#EF9F27' : '#E24B4A', borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11, color: '#9C9B96', width: 20 }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Btn primary onClick={() => setShowForm(true)}><i className="ti ti-plus" />Ajouter un avis</Btn>
      </div>

      {commentaires.map(c => (
        <div key={c.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{c.client}</div>
              <div style={{ fontSize: 11, color: '#9C9B96' }}>Empl. {c.emplacements?.numero} · {c.date_commentaire}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Stars n={c.note} />
              <div style={{ marginTop: 3 }}>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: '#E6F1FB', color: '#185FA5' }}>{c.source}</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#6B6A65', lineHeight: 1.6, marginBottom: 10 }}>{c.commentaire}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => toggleRepondu(c.id, c.repondu)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: c.repondu ? '#EAF3DE' : '#fff', color: c.repondu ? '#3B6D11' : '#6B6A65',
              border: c.repondu ? '0.5px solid #97C459' : '0.5px solid rgba(0,0,0,0.15)'
            }}>
              <i className={`ti ${c.repondu ? 'ti-check' : 'ti-corner-up-left'}`} />{c.repondu ? 'Répondu' : 'Marquer répondu'}
            </button>
          </div>
        </div>
      ))}

      {showForm && (
        <Modal title="Ajouter un commentaire" onClose={() => setShowForm(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Client"><Input value={form.client} onChange={v => setForm(f => ({ ...f, client: v }))} placeholder="Nom du client" /></Field>
            <Field label="Emplacement">
              <Select value={form.emplacement_id} onChange={v => setForm(f => ({ ...f, emplacement_id: v }))}>
                <option value="">—</option>
                {emplacements.map(e => <option key={e.id} value={e.id}>{e.numero}</option>)}
              </Select>
            </Field>
            <Field label="Note">
              <Select value={form.note} onChange={v => setForm(f => ({ ...f, note: parseInt(v) }))}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>)}
              </Select>
            </Field>
            <Field label="Source">
              <Select value={form.source} onChange={v => setForm(f => ({ ...f, source: v }))}>
                {SOURCES_AVIS.map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Date"><Input type="date" value={form.date_commentaire} onChange={v => setForm(f => ({ ...f, date_commentaire: v }))} /></Field>
          <Field label="Commentaire"><Textarea value={form.commentaire} onChange={v => setForm(f => ({ ...f, commentaire: v }))} placeholder="Texte de l'avis…" rows={4} /></Field>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
            <Btn onClick={() => setShowForm(false)}>Annuler</Btn>
            <Btn primary onClick={save}><i className="ti ti-check" />Ajouter</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── App principale ────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('dashboard')
  const [emplacements, setEmplacements] = useState([])
  const [interventions, setInterventions] = useState([])
  const [menages, setMenages] = useState([])
  const [commentaires, setCommentaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState(null)

  const toast = (msg) => setToastMsg(msg)

  const load = useCallback(async () => {
    const [e, i, m, c] = await Promise.all([
      supabase.from('emplacements').select('*').order('numero'),
      supabase.from('interventions').select('*, emplacements(numero, modele)').order('created_at', { ascending: false }),
      supabase.from('checks_menage').select('*, emplacements(numero, modele)').order('created_at', { ascending: false }),
      supabase.from('commentaires').select('*, emplacements(numero)').order('date_commentaire', { ascending: false }),
    ])
    setEmplacements(e.data || [])
    setInterventions(i.data || [])
    setMenages(m.data || [])
    setCommentaires(c.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const counts = {
    interventions: interventions.filter(i => i.statut !== 'Terminé').length,
    menage: menages.filter(m => m.statut !== 'Terminé').length,
    commentaires: commentaires.filter(c => !c.repondu).length,
    dashboard: 0, plan: 0,
  }

  const PAGE_TITLES = { dashboard: 'Tableau de bord', plan: 'Plan du camping', interventions: 'Interventions techniques', menage: 'Checks ménage', commentaires: 'Commentaires clients' }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12, color: '#9C9B96' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #EAF3DE', borderTopColor: '#639922', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ fontSize: 13 }}>Chargement du camping…</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar page={page} setPage={setPage} counts={counts} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.1)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{PAGE_TITLES[page]}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small onClick={load}><i className="ti ti-refresh" />Actualiser</Btn>
          </div>
        </div>
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {page === 'dashboard' && <Dashboard emplacements={emplacements} interventions={interventions} menages={menages} commentaires={commentaires} setPage={setPage} />}
          {page === 'plan' && <Plan emplacements={emplacements} onUpdate={load} toast={toast} />}
          {page === 'interventions' && <Interventions interventions={interventions} emplacements={emplacements} onUpdate={load} toast={toast} />}
          {page === 'menage' && <Menage menages={menages} emplacements={emplacements} onUpdate={load} toast={toast} />}
          {page === 'commentaires' && <Commentaires commentaires={commentaires} emplacements={emplacements} onUpdate={load} toast={toast} />}
        </div>
      </div>
      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>
  )
}
