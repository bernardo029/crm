import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthPage() {
  const [mode,setMode]=useState<'login'|'signup'>('login')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function submit(e:FormEvent){
    e.preventDefault(); setLoading(true); setError('')
    const res = mode==='login'
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password})
    if(res.error) setError(res.error.message)
    else if(mode==='signup') setError('Cadastro criado. Se a confirmação por e-mail estiver ativa, confirme o e-mail para entrar.')
    setLoading(false)
  }

  return <div className="auth-shell"><section className="auth-copy"><div className="brand big"><div className="brandmark">N</div><div><strong>NextCRM</strong><span>Seu comercial em um só lugar.</span></div></div><h1>Organize leads. Priorize oportunidades. Venda mais.</h1><p>Pipeline, contatos, tarefas e gestão comercial em um CRM simples, rápido e preparado para automações e IA.</p><div className="auth-features"><span>Pipeline visual</span><span>Multiempresa</span><span>Supabase</span><span>Preparado para WhatsApp</span></div></section><section className="auth-card"><div><h2>{mode==='login'?'Entrar no CRM':'Criar sua conta'}</h2><p>{mode==='login'?'Acesse sua operação comercial.':'Comece seu CRM em poucos minutos.'}</p></div><form onSubmit={submit}><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required /></label>{error && <div className="form-message">{error}</div>}<button className="primary wide" disabled={loading}>{loading?'Processando...':mode==='login'?'Entrar':'Criar conta'}</button></form><button className="link-btn" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Ainda não tenho conta':'Já tenho uma conta'}</button></section></div>
}
