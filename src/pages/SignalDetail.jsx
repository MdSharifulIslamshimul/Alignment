import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus, Image as ImageIcon, ListChecks, MessageCircleQuestion, Upload, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingBlock } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { InlineText } from '@/components/ui/inline-text'
import { KindDropdown } from '@/components/signals/KindDropdown'
import { SignalStatusDropdown } from '@/components/signals/SignalStatusDropdown'
import { toast } from '@/components/ui/toaster'
import { getSignal, updateSignalFields, uploadSignalImage } from '@/lib/api'
import { cn } from '@/lib/utils'

const SECTIONS = [
 { key: 'background',      label: 'Background & Context',      placeholder: 'What is the setting? What led to this observation?' },
 { key: 'problem',         label: 'The Problem',                placeholder: 'What is broken, missing, or friction-filled?' },
 { key: 'goal',            label: 'The Goal',                   placeholder: 'If we solve this, what does success look like?' },
 { key: 'whyNow',          label: 'Why It Matters & Why Now',   placeholder: 'What is the cost of inaction? What makes this urgent?' },
 { key: 'positioning',     label: 'Positioning',                placeholder: 'How does this fit our narrative / product / market?' },
 { key: 'risks',           label: 'Risks',                      placeholder: 'What could go wrong? What are we betting on?' },
 { key: 'successMetrics',  label: 'Success Metrics',            placeholder: 'How will we know it worked? Which numbers move?' },
]

function SectionCard({ title, value, placeholder, onCommit }) {
 const [local, setLocal] = useState(value ?? '')
 const ref = useRef(null)
 useEffect(() => { setLocal(value ?? '') }, [value])
 useEffect(() => {
  const el = ref.current
  if (!el) return
  el.style.height = '0px'
  el.style.height = `${Math.max(el.scrollHeight, 80)}px`
 }, [local])

 const commit = () => {
  const next = (local ?? '').trim()
  const prev = (value ?? '').trim()
  if (next !== prev) onCommit(next)
 }

 return (
  <Card className="overflow-hidden border-border/70">
   <div className="px-5 pt-4 pb-2 border-b border-border/50">
    <h3 className="text-[13px] font-semibold tracking-tight text-foreground/85 uppercase tracking-[0.06em]">{title}</h3>
   </div>
   <textarea
    ref={ref}
    value={local}
    onChange={(e) => setLocal(e.target.value)}
    onBlur={commit}
    placeholder={placeholder}
    className="block w-full min-h-[80px] bg-transparent text-[14px] leading-relaxed text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none px-5 py-4 resize-none whitespace-pre-wrap break-words"
   />
  </Card>
 )
}

function Lightbox({ urls, index, onClose, onNav }) {
 useEffect(() => {
  const onKey = (e) => {
   if (e.key === 'Escape') onClose()
   if (e.key === 'ArrowLeft') onNav(-1)
   if (e.key === 'ArrowRight') onNav(1)
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
 }, [onClose, onNav])

 const url = urls[index]
 if (!url) return null

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-sm" onClick={onClose}>
   <button
    onClick={onClose}
    className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
    aria-label="Close"
   >
    <X size={18} />
   </button>
   <div className="absolute top-4 left-4 text-white/80 text-xs tabular-nums">{index + 1} / {urls.length}</div>
   {urls.length > 1 && (
    <>
     <button
      onClick={(e) => { e.stopPropagation(); onNav(-1) }}
      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      aria-label="Previous"
     >
      <ChevronLeft size={20} />
     </button>
     <button
      onClick={(e) => { e.stopPropagation(); onNav(1) }}
      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      aria-label="Next"
     >
      <ChevronRight size={20} />
     </button>
    </>
   )}
   <img
    src={url}
    alt=""
    className="max-h-full max-w-full object-contain rounded-md shadow-2xl"
    onClick={(e) => e.stopPropagation()}
   />
  </div>
 )
}

function ImagesCard({ imageUrls, onChange, signalId }) {
 const inputRef = useRef(null)
 const [url, setUrl] = useState('')
 const [busy, setBusy] = useState(false)
 const [error, setError] = useState(null)
 const [lightboxIdx, setLightboxIdx] = useState(null)

 const addUrl = () => {
  const u = url.trim()
  if (!u) return
  onChange([...imageUrls, u])
  setUrl('')
 }
 const remove = (u) => onChange(imageUrls.filter((x) => x !== u))

 const onFile = async (e) => {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  setBusy(true); setError(null)
  try {
   const publicUrl = await uploadSignalImage(signalId, file)
   onChange([...imageUrls, publicUrl])
  } catch (err) {
   setError(err?.message || 'Upload failed')
  } finally {
   setBusy(false)
  }
 }

 const nav = (delta) => {
  setLightboxIdx((i) => {
   if (i === null) return null
   const n = imageUrls.length
   return ((i + delta) % n + n) % n
  })
 }

 return (
  <>
   <Card className="overflow-hidden border-border/70">
    <div className="flex items-center gap-2 px-5 pt-4 pb-2 border-b border-border/50">
     <ImageIcon size={13} className="text-muted-foreground" />
     <h3 className="text-[13px] font-semibold tracking-[0.06em] uppercase text-foreground/85">Images</h3>
     <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">{imageUrls.length}</span>
    </div>
    {imageUrls.length > 0 && (
     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
      {imageUrls.map((u, i) => (
       <div key={u} className="relative group rounded-lg overflow-hidden border border-border/60 bg-muted/30 aspect-[4/3]">
        <button
         type="button"
         onClick={() => setLightboxIdx(i)}
         className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
         aria-label="Open image"
        >
         <img
          src={u}
          alt=""
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
         />
        </button>
        <button
         onClick={() => remove(u)}
         className="absolute top-1.5 right-1.5 h-7 w-7 rounded-md bg-foreground/70 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-150 grid place-items-center"
         aria-label="Remove image"
         title="Remove"
        >
         <Trash2 size={12} />
        </button>
       </div>
      ))}
     </div>
    )}
    <div className="p-3 border-t border-border/50 flex flex-wrap items-center gap-2 bg-muted/20">
     <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
     <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
      <Upload size={12} /> {busy ? 'Uploading…' : 'Upload'}
     </Button>
     <span className="text-[11px] text-muted-foreground">or paste a URL</span>
     <Input
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') addUrl() }}
      placeholder="https://…"
      className="h-8 text-xs flex-1 min-w-[200px]"
     />
     <Button size="sm" onClick={addUrl} disabled={!url.trim()}>Add</Button>
     {error && <div className="basis-full text-[11px] text-destructive">{error}</div>}
    </div>
   </Card>
   {lightboxIdx !== null && (
    <Lightbox urls={imageUrls} index={lightboxIdx} onClose={() => setLightboxIdx(null)} onNav={nav} />
   )}
  </>
 )
}

function ActionListCard({ items, onChange }) {
 const [text, setText] = useState('')
 const [owner, setOwner] = useState('')
 const inputRef = useRef(null)

 const add = () => {
  if (!text.trim()) return
  const item = { id: (crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`), text: text.trim(), owner: owner.trim(), done: false }
  onChange([...items, item])
  setText(''); setOwner('')
  setTimeout(() => inputRef.current?.focus(), 0)
 }
 const toggle = (id) => onChange(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)))
 const remove = (id) => onChange(items.filter((it) => it.id !== id))
 const patch = (id, key, value) => onChange(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)))

 const openCount = items.filter((it) => !it.done).length

 return (
  <Card className="overflow-hidden border-border/70">
   <div className="flex items-center gap-2 px-5 pt-4 pb-2 border-b border-border/50">
    <ListChecks size={13} className="text-muted-foreground" />
    <h3 className="text-[13px] font-semibold tracking-tight uppercase tracking-[0.06em] text-foreground/85">Action List</h3>
    <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">{openCount} open · {items.length} total</span>
   </div>
   {items.length > 0 && (
    <ul className="divide-y divide-border/50">
     {items.map((it) => (
      <li key={it.id} className="flex items-start gap-2 px-4 py-2 group">
       <input
        type="checkbox"
        checked={!!it.done}
        onChange={() => toggle(it.id)}
        className="mt-1 shrink-0 h-4 w-4 rounded border-border accent-foreground"
       />
       <div className="flex-1 min-w-0">
        <InlineText
         value={it.text}
         onCommit={(v) => patch(it.id, 'text', v)}
         placeholder="Action…"
         textClassName={cn('text-[13px] leading-snug', it.done && 'line-through text-muted-foreground')}
         multiline
        />
        <InlineText
         value={it.owner}
         onCommit={(v) => patch(it.id, 'owner', v)}
         placeholder="Owner"
         textClassName="text-[11px] text-muted-foreground"
         multiline={false}
        />
       </div>
       <button
        onClick={() => remove(it.id)}
        className="h-6 w-6 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-150 opacity-0 group-hover:opacity-100"
        aria-label="Delete action"
       >
        <Trash2 size={11} />
       </button>
      </li>
     ))}
    </ul>
   )}
   <div className="p-3 border-t border-border/50 space-y-2 bg-muted/20">
    <Input
     ref={inputRef}
     value={text}
     onChange={(e) => setText(e.target.value)}
     onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); add() } }}
     placeholder="Next action…"
     className="h-8 text-xs"
    />
    <div className="flex items-center gap-2">
     <Input
      value={owner}
      onChange={(e) => setOwner(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') add() }}
      placeholder="Owner (optional)"
      className="h-8 text-xs flex-1"
     />
     <Button size="sm" onClick={add} disabled={!text.trim()}><Plus size={12} /> Add</Button>
    </div>
   </div>
  </Card>
 )
}

function QnaLedgerCard({ items, onChange }) {
 const [question, setQuestion] = useState('')
 const [answer, setAnswer] = useState('')

 const add = () => {
  if (!question.trim()) return
  const entry = { id: (crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`), question: question.trim(), answer: answer.trim(), askedAt: new Date().toISOString() }
  onChange([entry, ...items])
  setQuestion(''); setAnswer('')
 }
 const patch = (id, key, value) => onChange(items.map((it) => (it.id === id ? { ...it, [key]: value } : it)))
 const remove = (id) => onChange(items.filter((it) => it.id !== id))

 return (
  <Card className="overflow-hidden border-border/70">
   <div className="flex items-center gap-2 px-5 pt-4 pb-2 border-b border-border/50">
    <MessageCircleQuestion size={13} className="text-muted-foreground" />
    <h3 className="text-[13px] font-semibold tracking-tight uppercase tracking-[0.06em] text-foreground/85">QnA Ledger</h3>
    <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">{items.length}</span>
   </div>
   {items.length > 0 && (
    <ul className="divide-y divide-border/50">
     {items.map((it) => (
      <li key={it.id} className="px-4 py-3 group">
       <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
         <InlineText
          value={it.question}
          onCommit={(v) => patch(it.id, 'question', v)}
          placeholder="Question…"
          textClassName="text-[13px] font-medium leading-snug text-foreground"
          multiline
         />
         <div className="mt-1">
          <InlineText
           value={it.answer}
           onCommit={(v) => patch(it.id, 'answer', v)}
           placeholder="Answer, decision, or open thread…"
           textClassName="text-[12.5px] leading-snug text-foreground/75"
           multiline
          />
         </div>
        </div>
        <button
         onClick={() => remove(it.id)}
         className="h-6 w-6 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-accent transition-colors duration-150 opacity-0 group-hover:opacity-100"
         aria-label="Delete Q&A"
        >
         <Trash2 size={11} />
        </button>
       </div>
      </li>
     ))}
    </ul>
   )}
   <div className="p-3 border-t border-border/50 space-y-2 bg-muted/20">
    <textarea
     value={question}
     onChange={(e) => setQuestion(e.target.value)}
     placeholder="A question raised or unresolved…"
     rows={2}
     className="block w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
    />
    <textarea
     value={answer}
     onChange={(e) => setAnswer(e.target.value)}
     placeholder="Answer or context (optional)…"
     rows={2}
     className="block w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
    />
    <div className="flex justify-end">
     <Button size="sm" onClick={add} disabled={!question.trim()}><Plus size={12} /> Log Q&A</Button>
    </div>
   </div>
  </Card>
 )
}

export default function SignalDetail() {
 const { id } = useParams()
 const [signal, setSignal] = useState(null)
 const [status, setStatus] = useState('loading')
 const [error, setError] = useState(null)

 const load = async () => {
  setStatus('loading'); setError(null)
  try { setSignal(await getSignal(id)); setStatus('ready') }
  catch (e) { setError(e.message); setStatus('error') }
 }
 useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id])

 const patch = async (fields) => {
  setSignal((s) => ({ ...s, ...fields }))
  try { await updateSignalFields(id, fields) }
  catch (e) { setError(e.message); toast({ message: `Save failed: ${e.message}` }) }
 }

 if (status === 'loading') {
  return (<div className="max-w-6xl mx-auto"><LoadingBlock label="Loading signal…" /></div>)
 }
 if (status === 'error' || !signal) {
  return (
   <div className="max-w-6xl mx-auto">
    <Link to="/signals" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft size={14} /> Back to Signals</Link>
    <ErrorState message={error || 'Not found'} onRetry={load} />
   </div>
  )
 }

 return (
  <div className="max-w-6xl mx-auto">
   <div className="sticky top-0 z-30 -mx-5 md:-mx-8 px-5 md:px-8 py-4 mb-6 bg-[#fbfbfd]/85 dark:bg-neutral-950/85 backdrop-blur-xl border-b border-border">
    <Link to="/signals" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-2">
     <ArrowLeft size={13} /> Signals
    </Link>
    <div className="flex items-start justify-between gap-4 flex-wrap">
     <div className="min-w-0 flex-1">
      <InlineText
       value={signal.observation}
       onCommit={(v) => patch({ observation: v })}
       placeholder="What did you notice? A question or observation…"
       textClassName={cn('text-[22px] md:text-[26px] font-bold tracking-[-0.02em] leading-tight', signal.status === 'dismissed' && 'line-through opacity-60')}
       multiline
      />
      <div className="flex items-center gap-2 mt-2 flex-wrap">
       <KindDropdown value={signal.kind} onChange={(v) => patch({ kind: v })} />
       <SignalStatusDropdown status={signal.status} onChange={(v) => patch({ status: v })} />
       <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
        <span className="opacity-60">Theme</span>
        <InlineText
         value={signal.theme}
         onCommit={(v) => patch({ theme: v })}
         placeholder="—"
         textClassName="text-[12px] text-foreground/80 font-medium"
         multiline={false}
        />
       </div>
       <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
        <span className="opacity-60">Source</span>
        <InlineText
         value={signal.source}
         onCommit={(v) => patch({ source: v })}
         placeholder="—"
         textClassName="text-[12px] text-foreground/80"
         multiline={false}
        />
       </div>
      </div>
     </div>
    </div>
   </div>

   <div className="space-y-4">
    {SECTIONS.map((sec) => (
     <SectionCard
      key={sec.key}
      title={sec.label}
      placeholder={sec.placeholder}
      value={signal[sec.key]}
      onCommit={(v) => patch({ [sec.key]: v })}
     />
    ))}
   </div>

   <div className="mt-8 space-y-4">
    <ImagesCard
     imageUrls={signal.imageUrls}
     signalId={signal.id}
     onChange={(next) => patch({ imageUrls: next })}
    />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
     <ActionListCard
      items={signal.actionList}
      onChange={(next) => patch({ actionList: next })}
     />
     <QnaLedgerCard
      items={signal.qnaLedger}
      onChange={(next) => patch({ qnaLedger: next })}
     />
    </div>
   </div>
  </div>
 )
}
