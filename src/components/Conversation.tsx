import { ArrowRight, ArrowUp, Check, CircleHelp, MessageSquare, Square, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import type { Message } from '../types';

interface Props {
  messages: Message[];
  busy: boolean;
  loadingLabel: string;
  error: string | null;
  onAsk: (question: string) => void;
  onCancel: () => void;
  onRetry: () => void;
}

const suggestions = ['Break down Technology', 'How is Opex defined?', 'Show the underlying data'];

export default function Conversation({ messages, busy, loadingLabel, error, onAsk, onCancel, onRetry }: Props) {
  const [draft, setDraft] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [messages, busy, error]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (busy || !draft.trim()) return;
    onAsk(draft.trim()); setDraft(''); input.current?.focus();
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); submit(); }
  }

  return <aside className="conversation" aria-label="Finance conversation">
    <div className="conversation-heading"><span className="eyebrow"><MessageSquare size={14} /> Conversation</span><span className="assistant-label">Demo assistant</span></div>
    <div className="message-log" ref={log} role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text">
      {messages.length === 0 && <div className="welcome"><span className="assistant-icon"><Sparkles size={19} /></span><h2>A clearer view of your numbers.</h2><p>Explore operating expenses, compare with budget, or check a definition.</p><button className="suggestion" onClick={() => onAsk('Show September Opex vs budget')} disabled={busy}>Show September Opex vs budget <ArrowRight size={15} /></button></div>}
      {messages.map(message => <article key={message.id} className={`message message-${message.role}`}>
        {message.role === 'assistant' && <div className="message-author"><span className="assistant-icon"><Sparkles size={14} /></span>Finance assistant</div>}
        {message.role === 'assistant' && message.id === 'initial-answer' && <div className="completed-steps"><span><Check size={13} /> Demo period and metric resolved</span><span><Check size={13} /> Sample comparison calculated</span></div>}
        <p>{message.text}</p>
        <span className="message-context">{message.period}{message.role === 'assistant' ? ' · Demo data' : ''}</span>
      </article>)}
      {busy && <div className="thinking" role="status"><span className="loading-dots"><i /><i /><i /></span>{loadingLabel}</div>}
      {error && <div className="error-box" role="alert"><p>{error}</p><button className="text-button" onClick={onRetry}>Try again</button></div>}
      <div ref={end} />
    </div>
    <div className="conversation-bottom">
      <div className="suggestions"><div className="eyebrow">Explore further</div>{suggestions.map(question => <button className="suggestion" key={question} onClick={() => onAsk(question)} disabled={busy}>{question}<ArrowRight size={15} /></button>)}</div>
      <form className="composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="question">Ask a Finance question</label>
        <textarea id="question" ref={input} value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={keyDown} placeholder="Ask a follow-up…" rows={3} maxLength={1000} />
        <div className="composer-bottom"><span>Shift + Enter for a new line</span>{busy ? <button type="button" className="send-button" onClick={onCancel} aria-label="Stop response"><Square size={15} /></button> : <button className="send-button" type="submit" disabled={!draft.trim()} aria-label="Send question"><ArrowUp size={18} /></button>}</div>
      </form>
      <div className="demo-note"><CircleHelp size={12} /><span>Guided demo · No live AI connection</span></div>
    </div>
  </aside>;
}
