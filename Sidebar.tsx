import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import type { Contact, Deal, Stage } from '../lib/types'
const brl=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0})
export function Pipeline({stages,deals,contacts,onMove,onAdd}:{stages:Stage[];deals:Deal[];contacts:Contact[];onMove:(dealId:string,stageId:string)=>void;onAdd:()=>void}){
 const sorted=useMemo(()=>[...stages].sort((a,b)=>a.position-b.position),[stages])
 return <><div className="page-heading"><div><span className="eyebrow">Funil comercial</span><h1>Pipeline</h1><p>Arraste oportunidades entre as etapas.</p></div><button className="primary" onClick={onAdd}><Plus size={17}/>Novo negócio</button></div><div className="kanban">{sorted.map(stage=>{const ds=deals.filter(d=>d.stage_id===stage.id&&d.status==='open');return <div className="kanban-col" key={stage.id} onDragOver={e=>e.preventDefault()} onDrop={e=>{const id=e.dataTransfer.getData('dealId');if(id)onMove(id,stage.id)}}><div className="kanban-head"><div><strong>{stage.name}</strong><span>{ds.length}</span></div><small>{brl.format(ds.reduce((s,d)=>s+Number(d.value||0),0))}</small></div><div className="kanban-body">{ds.map(d=><article className="deal-card" draggable key={d.id} onDragStart={e=>e.dataTransfer.setData('dealId',d.id)}><strong>{d.title}</strong><span>{contacts.find(c=>c.id===d.contact_id)?.name||'Sem contato'}</span><b>{brl.format(Number(d.value||0))}</b></article>)}{ds.length===0&&<div className="drop-empty">Solte aqui</div>}</div></div>})}</div></>
}
