import { Building2, CheckSquare, ContactRound, KanbanSquare, LayoutDashboard, Settings, Users } from 'lucide-react'
import type { ViewKey } from '../lib/types'

const items: { key: ViewKey; label: string; icon: any }[] = [
  { key:'dashboard', label:'Dashboard', icon:LayoutDashboard },
  { key:'pipeline', label:'Pipeline', icon:KanbanSquare },
  { key:'contacts', label:'Contatos', icon:ContactRound },
  { key:'companies', label:'Empresas', icon:Building2 },
  { key:'tasks', label:'Tarefas', icon:CheckSquare },
  { key:'settings', label:'Configurações', icon:Settings },
]

export function Sidebar({ view, setView, orgName }: { view: ViewKey; setView:(v:ViewKey)=>void; orgName:string }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brandmark">N</div><div><strong>NextCRM</strong><span>CRM inteligente</span></div></div>
    <div className="org-pill"><Users size={15}/><span>{orgName}</span></div>
    <nav>{items.map(item => { const Icon=item.icon; return <button key={item.key} className={view===item.key?'nav-item active':'nav-item'} onClick={()=>setView(item.key)}><Icon size={18}/><span>{item.label}</span></button> })}</nav>
    <div className="sidebar-footer"><span>Versão MVP</span><small>Supabase + React</small></div>
  </aside>
}
