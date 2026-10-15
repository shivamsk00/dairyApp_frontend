import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Search, Send, X } from 'lucide-react'
import Avatar from '../primitives/Avatar'
import IconButton from '../primitives/IconButton'
import cx from '../utils/cx'
import '../ui.css'

/**
 * Slide-in messages panel: conversation list → thread view.
 * The component holds only view state; conversations and messages come from the caller.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {Array<{id: string, name: string, avatar?: string, preview?: string, time?: string,
 *   online?: boolean, group?: string}>} conversations `group` labels sections ("This week").
 * @param {Array<{id: string, text: string, mine?: boolean}>} [messages] Messages of the open thread.
 * @param {(conversation: object | null) => void} [onConversationChange] Fired when a thread is
 *   opened (load its messages here) or closed (null).
 * @param {(text: string, conversation: object) => void} [onSendMessage]
 * @param {string} [title='Messages']
 */
const ChatDrawer = ({
  isOpen,
  onClose,
  conversations = [],
  messages = [],
  onConversationChange,
  onSendMessage,
  title = 'Messages'
}) => {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const grouped = useMemo(() => {
    const term = search.trim().toLowerCase()
    const groups = new Map()
    conversations
      .filter((c) => !term || `${c.name} ${c.preview ?? ''}`.toLowerCase().includes(term))
      .forEach((c) => {
        const key = c.group ?? ''
        groups.set(key, [...(groups.get(key) ?? []), c])
      })
    return [...groups.entries()]
  }, [conversations, search])

  const openThread = (conversation) => {
    setActive(conversation)
    setDraft('')
    onConversationChange?.(conversation)
  }

  const send = () => {
    const text = draft.trim()
    if (!text || !active) return
    onSendMessage?.(text, active)
    setDraft('')
  }

  return createPortal(
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-[rgb(10_12_11_/_0.5)]" onClick={onClose} />
      )}
      <aside
        aria-label={title}
        inert={!isOpen}
        className={cx(
          'ui-bg-raised ui-border-subtle ui-shadow-xl ui-text-primary fixed right-0 top-0 z-[61] flex h-full w-full max-w-sm flex-col border-l transition-transform duration-[250ms]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {active ? (
          <div className="flex h-full flex-col">
            <div className="ui-border-subtle flex shrink-0 items-center gap-3 border-b px-4 py-3.5">
              <IconButton
                icon={ArrowLeft}
                label="Back to conversations"
                onClick={() => openThread(null)}
              />
              <Avatar name={active.name} src={active.avatar} className="size-8" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{active.name}</span>
                {active.online && (
                  <span className="flex items-center gap-1 text-[10.5px] text-[color:var(--ui-success-500)]">
                    <span className="size-1.5 rounded-full bg-[color:var(--ui-success-500)]" />
                    Online
                  </span>
                )}
              </span>
              <IconButton icon={X} label="Close chat" onClick={onClose} />
            </div>
            <div className="ui-scroll-thin flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cx('flex', message.mine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cx(
                      'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[13px]',
                      message.mine ? 'ui-bg-brand rounded-br-sm' : 'ui-bg-sunken rounded-bl-sm'
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <form
              className="ui-border-subtle flex shrink-0 items-center gap-2 border-t p-3"
              onSubmit={(event) => {
                event.preventDefault()
                send()
              }}
            >
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type a message…"
                className="ui-bg-sunken flex-1 rounded-xl border-0 px-3.5 py-2.5 text-[13px] outline-none"
              />
              <button
                type="submit"
                aria-label="Send"
                className="ui-bg-brand grid size-9 shrink-0 place-items-center rounded-xl"
              >
                <Send size={14} aria-hidden="true" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="ui-border-subtle flex shrink-0 items-center justify-between border-b px-4 py-3.5">
              <p className="ui-font-display text-[15px] font-bold">{title}</p>
              <IconButton icon={X} label="Close chat" onClick={onClose} />
            </div>
            <div className="shrink-0 p-3">
              <div className="ui-bg-sunken flex items-center gap-2 rounded-lg px-3 py-2">
                <Search size={13} className="ui-text-tertiary" aria-hidden="true" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations…"
                  className="flex-1 border-0 bg-transparent text-[13px] outline-none"
                />
              </div>
            </div>
            <div className="ui-scroll-thin flex-1 overflow-y-auto">
              {grouped.length === 0 && (
                <p className="ui-text-tertiary px-4 py-6 text-center text-[13px]">
                  No conversations
                </p>
              )}
              {grouped.map(([group, items]) => (
                <div key={group || 'all'}>
                  {group && (
                    <p className="ui-text-tertiary px-4 pb-2 pt-3 text-[10.5px] font-semibold uppercase tracking-wide">
                      {group}
                    </p>
                  )}
                  {items.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openThread(conversation)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-start hover:bg-[color:var(--ui-surface-sunken)]"
                    >
                      <Avatar
                        name={conversation.name}
                        src={conversation.avatar}
                        online={conversation.online}
                        className="size-10"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-semibold">
                            {conversation.name}
                          </span>
                          <span className="ui-text-tertiary shrink-0 text-[10.5px]">
                            {conversation.time}
                          </span>
                        </span>
                        <span className="ui-text-secondary block truncate text-[12px]">
                          {conversation.preview}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>,
    document.body
  )
}

export default ChatDrawer
