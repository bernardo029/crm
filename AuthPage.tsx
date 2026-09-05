import { FormEvent, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import type { Company, Contact, Deal, Organization, Pipeline as PipelineType, Stage, Task, ViewKey } from './lib/types'
import { demoCompanies, demoContacts, demoDeals, demoOrg, demoPipeline, demoStages, demoTasks } from './lib/demo'
import { Sidebar } from './components/Sidebar'
import { Modal } from './components/Modal'
import { AuthPage } from './pages/AuthPage'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { Pipeline } from './pages/Pipeline'
import { Contacts } from './pages/Contacts'
import { Companies } from './pages/Companies'
import { Tasks } from './pages/Tasks'
import { Settings } from './pages/Settings'

function App(){
  const [loading,setLoading]=useState(true)
  const [session,setSession]=useState<any>(null)
  const [view,setView]=useState<ViewKey>('dashboard')
  const [org,setOrg]=useState<Organization|null>(isSupabaseConfigured?null:demoOrg)
  const [pipeline,setPipeline]=useState<PipelineType|null>(isSupabaseConfigured?null:demoPipeline)
  const [stages,setStages]=useState<Stage[]>(isSupabaseConfigured?[]:demoStages)
  const [contacts,setContacts]=useState<Contact[]>(isSupabaseConfigured?[]:demoContacts)
  const [companies,setCompanies]=useState<Company[]>(isSupabaseConfigured?[]:demoCompanies)
  const [deals,setDeals]=useState<Deal[]>(isSupabaseConfigured?[]:demoDeals)
  const [tasks,setTasks]=useState<Task[]>(isSupabaseConfigured?[]:demoTasks)
  const [modal,setModal]=useState<'contact'|'company'|'deal'|'task'|'contactDetail'|null>(null)
  const [selectedContact,setSelectedContact]=useState<Contact|null>(null)
  const [error,setError]=useState('')

  useEffect(()=>{
    if(!isSupabaseConfigured){ setLoading(false); return }
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s))
    return ()=>subscription.unsubscribe()
  },[])

  useEffect(()=>{ if(session && isSupabaseConfigured) loadOrgAndData() },[session])

  async function loadOrgAndData(){
    setLoading(true); setError('')
    const {data:membership,error:memberError}=await supabase.from('organization_members').select('organization_id, organizations(id,name)').eq('user_id',session.user.id).limit(1).maybeSingle()
    if(memberError){setError(memberError.message);setLoading(false);return}
    if(!membership){setOrg(null);setLoading(false);return}
    const organization=(membership as any).organizations as Organization
    setOrg(organization)
    const orgId=(membership as any).organization_id
    const [p,c,co,d,t]=await Promise.all([
      supabase.from('pipelines').select('*').eq('organization_id',orgId).eq('is_default',true).limit(1).maybeSingle(),
      supabase.from('contacts').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}),
      supabase.from('companies').select('*').eq('organization_id',orgId).order('name'),
      supabase.from('deals').select('*').eq('organization_id',orgId).order('created_at',{ascending:false}),
      supabase.from('tasks').select('*').eq('organization_id',orgId).order('due_at',{ascending:true}),
    ])
    if(p.data){
      setPipeline(p.data as PipelineType)
      const s=await supabase.from('pipeline_stages').select('*').eq('pipeline_id',(p.data as any).id).order('position')
      setStages((s.data||[]) as Stage[])
    }
    setContacts((c.data||[]) as Contact[]);setCompanies((co.data||[]) as Company[]);setDeals((d.data||[]) as Deal[]);setTasks((t.data||[]) as Task[])
    setLoading(false)
  }

  async function addContact(data:any){
    if(!org)return
    if(!isSupabaseConfigured){const row={...data,id:crypto.randomUUID(),organization_id:org.id,status:'lead',tags:data.tags?data.tags.split(',').map((x:string)=>x.trim()).filter(Boolean):[]};setContacts(v=>[row,...v]);setModal(null);return}
    const payload={...data,organization_id:org.id,status:data.status||'lead',tags:data.tags?data.tags.split(',').map((x:string)=>x.trim()).filter(Boolean):[]}
    const {data:row,error}=await supabase.from('contacts').insert(payload).select().single();if(error)return setError(error.message);setContacts(v=>[row as Contact,...v]);setModal(null)
  }
  async function addCompany(data:any){
    if(!org)return
    if(!isSupabaseConfigured){setCompanies(v=>[{...data,id:crypto.randomUUID(),organization_id:org.id},...v]);setModal(null);return}
    const {data:row,error}=await supabase.from('companies').insert({...data,organization_id:org.id}).select().single();if(error)return setError(error.message);setCompanies(v=>[row as Company,...v]);setModal(null)
  }
  async function addDeal(data:any){
    if(!org||!pipeline||!stages[0])return
    const payload={...data,organization_id:org.id,pipeline_id:pipeline.id,stage_id:data.stage_id||stages[0].id,value:Number(data.value||0),currency:'BRL',status:'open'}
    if(!isSupabaseConfigured){setDeals(v=>[{...payload,id:crypto.randomUUID()},...v]);setModal(null);return}
    const {data:row,error}=await supabase.from('deals').insert(payload).select().single();if(error)return setError(error.message);setDeals(v=>[row as Deal,...v]);setModal(null)
  }
  async function moveDeal(dealId:string,stageId:string){
    setDeals(v=>v.map(d=>d.id===dealId?{...d,stage_id:stageId}:d))
    if(isSupabaseConfigured){const {error}=await supabase.from('deals').update({stage_id:stageId}).eq('id',dealId);if(error){setError(error.message);loadOrgAndData()}}
  }
  async function addTask(data:any){
    if(!org)return
    const payload={...data,organization_id:org.id,status:'pending',due_at:data.due_at?new Date(data.due_at).toISOString():null}
    if(!isSupabaseConfigured){setTasks(v=>[{...payload,id:crypto.randomUUID()},...v]);setModal(null);return}
    const {data:row,error}=await supabase.from('tasks').insert(payload).select().single();if(error)return setError(error.message);setTasks(v=>[row as Task,...v]);setModal(null)
  }
  async function toggleTask(task:Task){
    const status=task.status==='done'?'pending':'done';setTasks(v=>v.map(t=>t.id===task.id?{...t,status}:t));if(isSupabaseConfigured){const {error}=await supabase.from('tasks').update({status}).eq('id',task.id);if(error)setError(error.message)}
  }
  async function logout(){ if(isSupabaseConfigured) await supabase.auth.signOut(); else location.reload() }

  const title=useMemo(()=>({dashboard:'Dashboard',pipeline:'Pipeline',contacts:'Contatos',companies:'Empresas',tasks:'Tarefas',settings:'Configurações'}[view]),[view])
  if(loading)return <div className="center-page"><div className="onboarding-card"><strong>Carregando NextCRM...</strong></div></div>
  if(isSupabaseConfigured && !session)return <AuthPage/>
  if(isSupabaseConfigured && session && !org)return <Onboarding onCreated={loadOrgAndData}/>
  if(!org)return null

  return <div className="app-shell"><Sidebar view={view} setView={setView} orgName={org.name}/><main className="main"><header className="topbar"><div><strong>{title}</strong>{!isSupabaseConfigured&&<small> • modo demonstração</small>}</div><div className="avatar">{(session?.user?.email||'DE').slice(0,2).toUpperCase()}</div></header>{error&&<div className="form-message" style={{margin:'14px 30px 0'}}>{error}</div>}<div className="content">{view==='dashboard'&&<Dashboard contacts={contacts} deals={deals} tasks={tasks}/>} {view==='pipeline'&&<Pipeline stages={stages} deals={deals} contacts={contacts} onMove={moveDeal} onAdd={()=>setModal('deal')}/>} {view==='contacts'&&<Contacts contacts={contacts} onAdd={()=>setModal('contact')} onSelect={c=>{setSelectedContact(c);setModal('contactDetail')}}/>} {view==='companies'&&<Companies companies={companies} onAdd={()=>setModal('company')}/>} {view==='tasks'&&<Tasks tasks={tasks} onAdd={()=>setModal('task')} onToggle={toggleTask}/>} {view==='settings'&&<Settings orgName={org.name} onLogout={logout}/>}</div></main>{modal==='contact'&&<EntityForm title="Novo contato" onClose={()=>setModal(null)} onSubmit={addContact} fields={[['name','Nome','text',true],['phone','Telefone','text'],['whatsapp','WhatsApp','text'],['email','E-mail','email'],['instagram','Instagram','text'],['source','Origem','text'],['tags','Tags (separadas por vírgula)','text']]}/>} {modal==='company'&&<EntityForm title="Nova empresa" onClose={()=>setModal(null)} onSubmit={addCompany} fields={[['name','Nome','text',true],['phone','Telefone','text'],['email','E-mail','email'],['website','Site','text']]}/>} {modal==='deal'&&<DealForm onClose={()=>setModal(null)} onSubmit={addDeal} contacts={contacts} companies={companies} stages={stages}/>} {modal==='task'&&<TaskForm onClose={()=>setModal(null)} onSubmit={addTask}/>} {modal==='contactDetail'&&selectedContact&&<Modal title="Detalhes do contato" onClose={()=>setModal(null)}><div className="contact-drawer"><div className="big-name">{selectedContact.name}</div><div className="contact-meta"><Meta label="Telefone" value={selectedContact.phone||selectedContact.whatsapp||'—'}/><Meta label="E-mail" value={selectedContact.email||'—'}/><Meta label="Origem" value={selectedContact.source||'—'}/><Meta label="Status" value={selectedContact.status}/></div><div className="timeline"><strong>Timeline</strong><div className="timeline-item"><small>Contato criado</small><div>{selectedContact.created_at?new Date(selectedContact.created_at).toLocaleString('pt-BR'):'Registro disponível no CRM'}</div></div><div className="timeline-item"><small>Próxima evolução</small><div>Mensagens, notas, ligações e ações de IA aparecerão aqui.</div></div></div></div></Modal>}</div>
}

function EntityForm({title,onClose,onSubmit,fields}:{title:string;onClose:()=>void;onSubmit:(d:any)=>void;fields:any[]}){const [data,setData]=useState<any>({});function submit(e:FormEvent){e.preventDefault();onSubmit(data)}return <Modal title={title} onClose={onClose}><form className="form-grid" onSubmit={submit}>{fields.map(([key,label,type,required])=><label key={key}>{label}<input type={type} required={!!required} value={data[key]||''} onChange={e=>setData({...data,[key]:e.target.value})}/></label>)}<div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary">Salvar</button></div></form></Modal>}
function DealForm({onClose,onSubmit,contacts,companies,stages}:{onClose:()=>void;onSubmit:(d:any)=>void;contacts:Contact[];companies:Company[];stages:Stage[]}){const [d,setD]=useState<any>({stage_id:stages[0]?.id||''});return <Modal title="Novo negócio" onClose={onClose}><form className="form-grid" onSubmit={e=>{e.preventDefault();onSubmit(d)}}><label className="full">Título<input required value={d.title||''} onChange={e=>setD({...d,title:e.target.value})}/></label><label>Valor (R$)<input type="number" min="0" step="0.01" value={d.value||''} onChange={e=>setD({...d,value:e.target.value})}/></label><label>Etapa<select value={d.stage_id} onChange={e=>setD({...d,stage_id:e.target.value})}>{stages.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select></label><label>Contato<select value={d.contact_id||''} onChange={e=>setD({...d,contact_id:e.target.value||null})}><option value="">Sem contato</option>{contacts.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Empresa<select value={d.company_id||''} onChange={e=>setD({...d,company_id:e.target.value||null})}><option value="">Sem empresa</option>{companies.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary">Criar negócio</button></div></form></Modal>}
function TaskForm({onClose,onSubmit}:{onClose:()=>void;onSubmit:(d:any)=>void}){const [d,setD]=useState<any>({priority:'medium'});return <Modal title="Nova tarefa" onClose={onClose}><form className="form-grid" onSubmit={e=>{e.preventDefault();onSubmit(d)}}><label className="full">Título<input required value={d.title||''} onChange={e=>setD({...d,title:e.target.value})}/></label><label>Vencimento<input type="datetime-local" value={d.due_at||''} onChange={e=>setD({...d,due_at:e.target.value})}/></label><label>Prioridade<select value={d.priority} onChange={e=>setD({...d,priority:e.target.value})}><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select></label><label className="full">Descrição<textarea rows={3} value={d.description||''} onChange={e=>setD({...d,description:e.target.value})}/></label><div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary">Criar tarefa</button></div></form></Modal>}
function Meta({label,value}:{label:string;value:string}){return <div className="meta-box"><small>{label}</small><strong>{value}</strong></div>}
export default App
