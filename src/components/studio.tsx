'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { upload } from '@vercel/blob/client';
import { ArrowLeft, ArrowUpRight, Check, ImagePlus, LoaderCircle, LogOut, Mic, MicOff, PenLine, Send, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

type Draft = { title: string; excerpt: string; content: string; categories: string[] };
type Photo = { url: string; name: string; type: string };
type DocumentType = 'post' | 'page';

function slugify(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function Studio({ authenticated }: { authenticated: boolean }) {
  const [password, setPassword] = useState('');
  const [transcript, setTranscript] = useState('');
  const [draft, setDraft] = useState<Draft>({ title: '', excerpt: '', content: '', categories: [] });
  const [documentType, setDocumentType] = useState<DocumentType>('post');
  const [publishedType, setPublishedType] = useState<DocumentType>('post');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [published, setPublished] = useState('');
  const recognition = useRef<SpeechRecognitionLike | null>(null);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    if (response.ok) window.location.reload();
    else setError((await response.json()).error ?? 'Nie udało się zalogować.');
    setBusy(false);
  }

  function toggleRecording() {
    if (listening) {
      recognition.current?.stop();
      setListening(false);
      return;
    }
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Ta przeglądarka nie obsługuje dyktowania. Możesz wpisać opowieść poniżej.');
      return;
    }
    const instance = new Recognition();
    instance.lang = 'pl-PL';
    instance.continuous = true;
    instance.interimResults = false;
    instance.onresult = (event) => {
      const words = Array.from(event.results).slice(event.resultIndex).map((result) => result[0].transcript).join(' ');
      setTranscript((current) => current ? `${current.trim()} ${words}` : words);
    };
    instance.onerror = () => {
      setListening(false);
      setError('Nie udało się uruchomić mikrofonu. Sprawdź uprawnienia przeglądarki.');
    };
    instance.onend = () => setListening(false);
    recognition.current = instance;
    setError('');
    setListening(true);
    instance.start();
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const remaining = Math.max(0, 6 - photos.length);
    const selection = Array.from(files).slice(0, remaining);
    if (!selection.length) {
      setError('Do wpisu można dodać maksymalnie 6 zdjęć.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const uploaded = await Promise.all(selection.map(async (file) => {
        if (!file.type.startsWith('image/') || file.size > 12 * 1024 * 1024) throw new Error('Zdjęcie musi mieć format obrazu i mniej niż 12 MB.');
        const blob = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload' });
        return { url: blob.url, name: file.name, type: file.type };
      }));
      setPhotos((current) => [...current, ...uploaded].slice(0, 6));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się przesłać zdjęć.');
    } finally {
      setBusy(false);
    }
  }

  async function makeDraft() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, images: photos.filter((photo) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(photo.type)).map((photo) => photo.url), type: documentType }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Nie udało się przygotować szkicu.');
      setDraft({ title: result.title, excerpt: result.excerpt, content: result.content, categories: result.categories ?? [] });
      setPublished('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się przygotować szkicu.');
    } finally {
      setBusy(false);
    }
  }

  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(documentType === 'page' ? '/api/pages' : '/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, slug: `${slugify(draft.title)}-${Date.now().toString(36)}`, categories: draft.categories, gallery: photos.map((photo) => photo.url) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Nie udało się opublikować wpisu.');
      setPublished(result.slug);
      setPublishedType(documentType);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się opublikować wpisu.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  }

  if (!authenticated) {
    return (
      <main className="studio-login">
        <Link className="studio-brand" href="/" aria-label="Świat Czeka — strona główna"><Image src="/swiatczeka-logo.jpg" width={2560} height={887} alt="Świat Czeka" /></Link>
        <div className="login-panel"><span className="section-label">Prywatne studio</span><h1>Witaj <em>w domu.</em></h1><p>To miejsce jest tylko dla Ciebie.</p>
          <form onSubmit={login}><label htmlFor="password">Hasło</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button className="studio-primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : null} Wejdź do studia <ArrowUpRight size={17} /></button></form>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Link className="login-back" href="/">← wróć do bloga</Link>
        </div>
        <span className="login-note">Tylko dla Anki · światczeka.pl</span>
      </main>
    );
  }

  return (
    <main className="studio-shell">
      <header className="studio-header"><Link className="studio-brand" href="/" aria-label="Świat Czeka — strona główna"><Image src="/swiatczeka-logo.jpg" width={2560} height={887} alt="Świat Czeka" /></Link><div><span className="studio-status"><span /> Prywatne studio</span><button className="icon-button" onClick={logout} title="Wyloguj" aria-label="Wyloguj"><LogOut size={17} /></button></div></header>
      <div className="studio-main">
        <div className="studio-heading"><div><Link className="studio-back" href="/"><ArrowLeft size={15} /> Blog</Link><h1>Nowa <em>opowieść.</em></h1><p>Powiedz, co wydarzyło się po drodze. Resztę ułożymy razem.</p></div><span className="studio-date">{new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span></div>
        <div className="studio-mode" role="group" aria-label="Rodzaj publikacji">
          <span>Tworzysz:</span>
          <button className={documentType === 'post' ? 'mode-active' : ''} aria-pressed={documentType === 'post'} onClick={() => { setDocumentType('post'); setPublished(''); }}>Wpis na blogu</button>
          <button className={documentType === 'page' ? 'mode-active' : ''} aria-pressed={documentType === 'page'} onClick={() => { setDocumentType('page'); setPublished(''); }}>Landing page</button>
        </div>
        <div className="studio-workspace">
          <section className="capture-column" aria-label="Nagranie i zdjęcia">
            <div className="studio-block-title"><span>01</span><div><h2>Twoja historia</h2><p>Opowiedz tak, jak pamiętasz.</p></div></div>
            <button className={`record-button${listening ? ' is-listening' : ''}`} onClick={toggleRecording}><span className="record-icon">{listening ? <MicOff size={22} /> : <Mic size={22} />}</span><span><strong>{listening ? 'Zatrzymaj nagrywanie' : 'Nagraj głos'}</strong><small>{listening ? 'Słucham…' : 'Mów swobodnie, po polsku'}</small></span><span className="record-wave" aria-hidden="true"><i /><i /><i /><i /><i /></span></button>
            <label className="field-label" htmlFor="transcript">Notatka lub transkrypcja</label><textarea id="transcript" className="transcript-input" value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Zacznij od tego, gdzie jesteś i co dziś zapamiętasz…" />
            <div className="photos-heading"><div><span className="studio-step">02</span><strong>Zdjęcia z drogi</strong><span className="photo-count">{photos.length}/6</span></div><label className="photo-add" htmlFor="photos"><ImagePlus size={16} /> Dodaj zdjęcia<input id="photos" type="file" accept="image/*" multiple onChange={(event) => { void addPhotos(event.target.files); event.target.value = ''; }} /></label></div>
            {photos.length > 0 && <div className="studio-photos">{photos.map((photo) => <figure key={photo.url}><Image src={photo.url} alt={photo.name} fill sizes="(max-width: 620px) 20vw, 10vw" /><button type="button" onClick={() => setPhotos((current) => current.filter((item) => item.url !== photo.url))} aria-label={`Usuń ${photo.name}`}><X size={14} /></button></figure>)}</div>}
            {photos.some((photo) => !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(photo.type)) && <p className="photo-format-note">Zdjęcia HEIC opublikują się normalnie; do analizy AI dołącz JPG, PNG lub WebP.</p>}
            <button className="studio-generate" onClick={makeDraft} disabled={busy || transcript.trim().length < 8}><Sparkles size={17} /> {documentType === 'page' ? 'Stwórz landing page' : 'Ułóż szkic z AI'} <ArrowUpRight size={16} /></button>
          </section>

          <section className="draft-column" aria-label="Edytor wpisu">
            <div className="studio-block-title"><span>03</span><div><h2>Twój wpis</h2><p>Przejrzyj, popraw, opublikuj.</p></div></div>
            <form className="draft-form" onSubmit={publish}>
              <label className="field-label" htmlFor="draft-title">Tytuł</label><input id="draft-title" className="draft-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Nadaj tej chwili tytuł" required />
              <label className="field-label" htmlFor="draft-excerpt">Krótki wstęp</label><textarea id="draft-excerpt" className="draft-excerpt" value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} placeholder="Jedno zdanie, które wciągnie w opowieść" />
              <label className="field-label" htmlFor="draft-content">Treść</label><textarea id="draft-content" className="draft-content" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Tu pojawi się Twoja opowieść. Możesz ją dowolnie poprawić." required />
              <label className="field-label" htmlFor="draft-categories">Miejsce lub temat <span>oddziel przecinkiem</span></label><input id="draft-categories" className="draft-categories" value={draft.categories.join(', ')} onChange={(event) => setDraft({ ...draft, categories: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })} placeholder="Laos, ludzie, jedzenie" />
              <div className="publish-row"><span><PenLine size={15} /> {documentType === 'page' ? 'Strona otrzyma własny adres URL' : 'Wpis pojawi się od razu na blogu'}</span><button className="studio-primary" disabled={busy || !draft.title.trim() || !draft.content.trim()}>{busy ? <LoaderCircle className="spin" size={17} /> : published ? <Check size={17} /> : <Send size={16} />}{published ? 'Opublikowano' : documentType === 'page' ? 'Opublikuj stronę' : 'Opublikuj wpis'}</button></div>
            </form>
            {published && <Link className="published-link" href={publishedType === 'page' ? `/strona/${published}` : `/wpis/${published}`}>Zobacz opublikowaną {publishedType === 'page' ? 'stronę' : 'historię'} <ArrowUpRight size={15} /></Link>}
          </section>
        </div>
        {error && <div className="studio-error" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Zamknij"><X size={16} /></button></div>}
        {busy && <span className="studio-busy" aria-live="polite"><LoaderCircle className="spin" size={14} /> Pracuję nad Twoją opowieścią…</span>}
      </div>
      <footer className="studio-footer"><span>Świat Czeka · Prywatne studio</span><span>Twoje historie, Twój rytm.</span></footer>
    </main>
  );
}