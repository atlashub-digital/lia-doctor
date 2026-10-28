'use client';

import { useEffect, useRef, useState } from 'react';
import { FocusDialog } from './FocusDialog';

type Turn = { role: 'user' | 'assistant'; text: string };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void; abort: () => void; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null };
type VoiceWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
const unavailable = 'LIA temporariamente indisponível. A sua mensagem não recebeu uma resposta do serviço. Tente novamente mais tarde.';

export function ChatPanel({ onClose, voiceEnabled }: { onClose: () => void; voiceEnabled: boolean }) {
  const [messages, setMessages] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [last, setLast] = useState<{ message: string; history: Turn[] } | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const request = useRef<AbortController | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const feed = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const browser = window as VoiceWindow;
    setVoiceSupported(voiceEnabled && window.isSecureContext && Boolean(browser.SpeechRecognition || browser.webkitSpeechRecognition));
    return () => { request.current?.abort(); recognition.current?.abort(); };
  }, [voiceEnabled]);
  useEffect(() => { feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: 'instant' }); }, [messages, error, busy]);

  async function send(retry = false) {
    if (busy || (!retry && !input.trim())) return;
    const payload = retry && last ? last : { message: input.trim(), history: messages.slice(-12).map(turn => ({ ...turn, text: turn.text.slice(0, 4000) })) };
    if (!payload.message || payload.message.length > 2000) return;
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    if (!retry) { setMessages(current => [...current, { role: 'user', text: payload.message }]); setInput(''); }
    setLast(payload); setBusy(true); setError('');
    try {
      const response = await fetch('/api/lia/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
      if (!response.ok) {
        setError(response.status === 429 ? 'Limite de mensagens atingido. Aguarde alguns minutos antes de tentar novamente.' : unavailable);
        return;
      }
      const data: unknown = await response.json();
      const reply = data && typeof data === 'object' && 'reply' in data ? data.reply : null;
      if (typeof reply !== 'string' || !reply.trim()) { setError(unavailable); return; }
      if (!controller.signal.aborted) { setMessages(current => [...current, { role: 'assistant', text: reply }]); setLast(null); }
    } catch { if (!controller.signal.aborted) setError(unavailable); }
    finally { if (request.current === controller) { setBusy(false); request.current = null; } }
  }
  function reset() { request.current?.abort(); request.current = null; recognition.current?.abort(); setMessages([]); setInput(''); setBusy(false); setError(''); setLast(null); setVoiceNote(''); editor.current?.focus(); }
  function startVoice() {
    const browser = window as VoiceWindow;
    const Constructor = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!voiceEnabled || !Constructor) return;
    const session = new Constructor();
    recognition.current = session; session.lang = 'pt-BR'; session.continuous = false; session.interimResults = false;
    session.onresult = event => { const text = event.results[0]?.[0]?.transcript || ''; setInput(text.slice(0, 2000)); setVoiceNote('Transcrição pronta. Reveja o texto antes de enviar.'); editor.current?.focus(); };
    session.onerror = event => { setVoiceNote(event.error === 'not-allowed' ? 'O acesso ao microfone foi recusado. Pode continuar por texto.' : 'Não foi possível transcrever. Pode continuar por texto.'); setListening(false); };
    session.onend = () => setListening(false);
    setVoiceConsent(false); setVoiceNote('A ouvir… pode parar a qualquer momento.');
    try { session.start(); setListening(true); } catch { setVoiceNote('Microfone indisponível. Pode continuar por texto.'); }
  }
  return <FocusDialog title="Conversar com a LIA" onClose={onClose} className="lia-chat-dialog">
    <div className="lia-chat-identity"><span className="lia-avatar" aria-hidden="true" /><div><strong>LIA · Assistente IA</strong><small>Conversa de visitante · sem memória persistente neste site</small></div><button onClick={reset} aria-label="Limpar conversa">↻</button></div>
    <p className="lia-chat-notice">Posso ajudar a conhecer as áreas e leituras LIA. Evite partilhar dados pessoais ou clínicos. Não substituo acompanhamento profissional.</p>
    <div className="lia-chat-feed" ref={feed} role="log" aria-label="Mensagens da conversa" aria-live="polite" aria-relevant="additions">
      {!messages.length ? <p className="lia-chat-start">Olá! Por onde quer começar?<small>Mensagem de boas-vindas do site.</small></p> : null}
      {messages.map((message, index) => <div key={index} className={`lia-message ${message.role}`}><span>{message.role === 'user' ? 'Você' : 'LIA · IA'}</span><p>{message.text}</p></div>)}
      {busy ? <p className="lia-chat-loading" role="status">A aguardar uma resposta da LIA…</p> : null}
    </div>
    {error ? <div className="lia-chat-error" role="alert"><p>{error}</p>{last ? <button onClick={() => void send(true)} disabled={busy}>Tentar novamente</button> : null}</div> : null}
    {voiceConsent ? <div className="lia-voice-consent"><p>O navegador pedirá acesso ao microfone e poderá processar a voz no serviço de transcrição do fornecedor. A transcrição fica no campo de texto e só é enviada à LIA quando escolher Enviar.</p><button onClick={startVoice}>Permitir e iniciar ditado</button><button onClick={() => setVoiceConsent(false)}>Continuar por texto</button></div> : null}
    {voiceSupported ? <div className="lia-voice"><button onClick={() => listening ? recognition.current?.stop() : setVoiceConsent(true)}>{listening ? 'Parar ditado' : 'Usar ditado por voz'}</button><span role="status">{voiceNote}</span></div> : null}
    <form className="lia-chat-form" onSubmit={event => { event.preventDefault(); void send(); }}>
      <label htmlFor="lia-message">A sua mensagem</label><textarea ref={editor} id="lia-message" rows={2} maxLength={2000} value={input} onChange={event => setInput(event.target.value)} placeholder="Escreva aqui…" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />
      <div><small>{input.length}/2000 · Shift + Enter para nova linha</small><button className="lia-pill" type="submit" disabled={busy || !input.trim()}>Enviar <span aria-hidden="true">→</span></button></div>
    </form>
  </FocusDialog>;
}
