/* eslint-disable react/prop-types -- React 19 ignores propTypes */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Download, ExternalLink, Send, Sparkles, Square } from 'lucide-react'
import {
  Badge,
  Breadcrumb,
  Button,
  DataTable,
  SectionCard,
  useDocumentTitle
} from '../../components/ui'
import { answerQuestion } from '../../helper/assistant/answer'

const STARTERS = [
  "Today's milk collection",
  'Account 12 report this month',
  'Accounts 1 to 10 report last month',
  'Details of account 5',
  'CM subsidy this month',
  'How do I scan a rate list?'
]

/** Offline model: download once, then it loads by itself when needed. */
const ModelCard = ({ status, onDownload, onCancel }) => {
  if (!status) return null
  if (!status.supported) {
    return (
      <p className="ui-text-secondary text-[12.5px]">
        The offline model needs 64-bit Windows. Questions about your data still work; help questions
        show the matching help note.
      </p>
    )
  }
  if (status.downloading) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="h-2 min-w-[12rem] flex-1 overflow-hidden rounded-full bg-[color:var(--ui-neutral-200)]"
          role="progressbar"
          aria-valuenow={status.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Model download"
        >
          <div
            className="h-full bg-[color:var(--ui-primary-500)] transition-all"
            style={{ width: `${status.progress}%` }}
          />
        </div>
        <span className="text-[12.5px] font-semibold">{status.progress}%</span>
        <Button size="sm" variant="secondary" icon={Square} onClick={onCancel}>
          Stop
        </Button>
      </div>
    )
  }
  if (!status.downloaded) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ui-text-secondary max-w-2xl text-[12.5px]">
          Download the offline model ({status.sizeMB} MB, once) for answers to help questions in
          your own words and for questions the assistant does not recognise. Questions about your
          data work without it.
          {status.error && (
            <span className="mt-1 block text-[color:var(--ui-danger-600)]">{status.error}</span>
          )}
        </p>
        <Button size="sm" icon={Download} onClick={onDownload}>
          Download model
        </Button>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
      <Badge tone="success">Offline model ready</Badge>
      <span className="ui-text-tertiary">
        {status.loaded
          ? 'Loaded now; it frees its memory after 3 idle minutes.'
          : 'Loads when a question needs it.'}
      </span>
      {status.error && <span className="text-[color:var(--ui-danger-600)]">{status.error}</span>}
    </div>
  )
}

const Answer = ({ answer, onAsk, onOpen }) => (
  <div className="space-y-3">
    {answer.title && (
      <p className="text-[12px] font-semibold uppercase tracking-wide">{answer.title}</p>
    )}
    <p className={`whitespace-pre-wrap ${answer.error ? 'text-[color:var(--ui-danger-600)]' : ''}`}>
      {answer.text}
    </p>
    {answer.facts?.length > 0 && (
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {answer.facts.map((f) => (
          <div key={f.label} className="ui-bg-raised rounded-lg px-3 py-2">
            <dt className="ui-text-tertiary text-[11.5px]">{f.label}</dt>
            <dd className="font-semibold">{f.value}</dd>
          </div>
        ))}
      </dl>
    )}
    {answer.tables?.map((t) => (
      <div key={t.title}>
        <p className="mb-1 text-[12px] font-semibold">{t.title}</p>
        <DataTable
          columns={t.columns}
          rows={t.rows}
          rowKey={(r) => r._key}
          stickyHeader
          striped
          className="max-h-[22rem] overflow-y-auto"
        />
        {t.more > 0 && (
          <p className="ui-text-tertiary mt-1 text-[11.5px]">
            and {t.more} more rows (open the page for all).
          </p>
        )}
      </div>
    ))}
    {answer.examples && (
      <div className="flex flex-wrap gap-2">
        {answer.examples.map((e) => (
          <Button key={e} size="sm" variant="secondary" onClick={() => onAsk(e)}>
            {e}
          </Button>
        ))}
      </div>
    )}
    <div className="flex flex-wrap items-center gap-2">
      {answer.link && (
        <Button
          size="sm"
          variant="secondary"
          icon={ExternalLink}
          onClick={() => onOpen(answer.link.to)}
        >
          {answer.link.label}
        </Button>
      )}
      {answer.viaModel && (
        <span className="ui-text-tertiary inline-flex items-center gap-1 text-[11px]">
          <Sparkles size={12} aria-hidden="true" /> offline model
        </span>
      )}
    </div>
  </div>
)

const AssistantPage = () => {
  useDocumentTitle('Ask Assistant')
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [messages, setMessages] = useState([]) // { id, question } | { id, answer } | { id, streaming }
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef(null)
  const nextId = useRef(0)

  useEffect(() => {
    window.api?.assistantStatus?.().then(setStatus)
    return window.api?.onAssistantStatus?.(setStatus)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  const push = (message) => {
    const id = ++nextId.current
    setMessages((all) => [...all, { id, ...message }])
    return id
  }
  const update = (id, patch) =>
    setMessages((all) => all.map((m) => (m.id === id ? { ...m, ...patch } : m)))

  const ask = async (text) => {
    const question = text.trim()
    if (!question || busy) return
    setDraft('')
    setBusy(true)
    push({ question })
    const id = push({ streaming: '' })
    let streamed = ''
    try {
      const answer = await answerQuestion(question, {
        modelReady: !!(status?.supported && status?.downloaded),
        onToken: (chunk) => {
          streamed += chunk
          update(id, { streaming: streamed })
        }
      })
      update(id, { streaming: undefined, answer })
    } catch (error) {
      update(id, {
        streaming: undefined,
        answer: { text: `Something went wrong: ${error?.message || error}`, error: true }
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ui-text-primary w-full">
      <Breadcrumb
        title="Ask Assistant"
        items={[{ label: 'Home', to: '/' }, { label: 'Ask Assistant' }]}
      />

      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <SectionCard
          title="Ask about your dairy"
          subtitle="Customers, reports, milk collection, CM subsidy, payments, stock and sales, or how to use the software. Works offline."
          icon={Bot}
        >
          <ModelCard
            status={status}
            onDownload={() => window.api.assistantDownload().then(setStatus)}
            onCancel={() => window.api.assistantCancelDownload().then(setStatus)}
          />

          <div
            className="ui-scroll-thin mt-4 max-h-[calc(100vh-24rem)] min-h-[16rem] space-y-4 overflow-y-auto rounded-lg border ui-border-subtle p-4"
            aria-live="polite"
          >
            {!messages.length && (
              <div className="space-y-3">
                <p className="ui-text-secondary text-[13px]">
                  Ask in English, Hindi or Hinglish. For example:
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTERS.map((s) => (
                    <Button key={s} size="sm" variant="secondary" onClick={() => ask(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) =>
              m.question ? (
                <div key={m.id} className="flex justify-end">
                  <p className="ui-bg-brand max-w-[75%] rounded-2xl rounded-br-sm px-3.5 py-2 text-[13px]">
                    {m.question}
                  </p>
                </div>
              ) : (
                <div
                  key={m.id}
                  className="ui-bg-sunken max-w-full rounded-2xl rounded-bl-sm px-4 py-3 text-[13px]"
                >
                  {m.answer ? (
                    <Answer answer={m.answer} onAsk={ask} onOpen={navigate} />
                  ) : (
                    <p className="ui-text-secondary whitespace-pre-wrap">
                      {m.streaming || 'Working on it…'}
                    </p>
                  )}
                </div>
              )
            )}
            <div ref={endRef} />
          </div>

          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              ask(draft)
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. account 12 ka is mahine ka report"
              aria-label="Your question"
              className="ui-input flex-1"
              disabled={busy}
              autoFocus
            />
            <Button type="submit" icon={Send} loading={busy} disabled={!draft.trim()}>
              Ask
            </Button>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}

export default AssistantPage
