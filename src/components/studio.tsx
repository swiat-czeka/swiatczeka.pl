'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { upload } from '@vercel/blob/client';
import { ArrowLeft, ArrowUpRight, BarChart3, Check, Clipboard, FileText, ImagePlus, LoaderCircle, LogOut, Mic, MicOff, PenLine, RefreshCw, Save, Send, Sparkles, X } from 'lucide-react';
import { slugify } from '@/lib/legacy';

export type DraftItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  categories: string[];
  image: string;
  instagram: string;
  seoDescription: string;
  gallery: string[];
  legacy: boolean;
};

type Draft = { title: string; slug: string; excerpt: string; seoDescription: string; content: string; categories: string[]; instagram: string };
type Photo = { url: string; name: string; type: string };
type DocumentType = 'post' | 'page';
type Editing = { id?: string; date?: string; slug: string; legacy?: boolean } | null;

const emptyDraft: Draft = { title: '', slug: '', excerpt: '', seoDescription: '', content: '', categories: [], instagram: '' };
const AI_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_PHOTOS = 12;

export function Studio({ authenticated, drafts, totals, config }: {
  authenticated: boolean;
  drafts: DraftItem[];
  totals: { published: number; drafts: number };
  config: { ai: boolean; blob: boolean };
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'overview' | 'new'>('overview');
  const [transcript, setTranscript] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [slugTouched, setSlugTouched] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>('post');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [editing, setEditing] = useState<Editing>(null);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState<{ slug: string; status: 'draft' | 'published'; type: DocumentType } | null>(null);
  const [copied, setCopied] = useState(false);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const wantListening = useRef(false);

  useEffect(() => () => { wantListening.current = false; recognition.current?.stop(); }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (response.ok) window.location.reload();
    else setError((await response.json().catch(() => ({}))).error ?? 'Nie udało się zalogować.');
    setBusy(false);
  }

  function startRecognition() {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Ta przeglądarka nie obsługuje dyktowania. Użyj Chrome/Safari albo wpisz tekst poniżej.');
      return false;
    }
    const instance = new Recognition();
    instance.lang = 'pl-PL';
    instance.continuous = true;
    instance.interimResults = false;
    instance.onresult = (event) => {
      const words = Array.from(event.results).slice(event.resultIndex).map((result) => result[0].transcript.trim()).join(' ');
      setTranscript((current) => (current ? `${current.trim()} ${words}` : words));
    };
    instance.onerror = (event: { error?: string }) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      wantListening.current = false;
      setListening(false);
      setError('Nie udało się uruchomić mikrofonu. Sprawdź uprawnienia przeglądarki.');
    };
    // Przeglądarki same kończą długie nagrania — jeśli użytkownik nie zatrzymał, wznawiamy.
    instance.onend = () => {
      if (wantListening.current) {
        try { startRecognition(); } catch { setListening(false); }
      } else setListening(false);
    };
    recognition.current = instance;
    instance.start();
    return true;
  }

  function toggleRecording() {
    if (listening) {
      wantListening.current = false;
      recognition.current?.stop();
      setListening(false);
      return;
    }
    setError('');
    wantListening.current = true;
    if (startRecognition()) setListening(true);
    else wantListening.current = false;
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const selection = Array.from(files).slice(0, Math.max(0, MAX_PHOTOS - photos.length));
    if (!selection.length) {
      setError(`Do wpisu można dodać maksymalnie ${MAX_PHOTOS} zdjęć.`);
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
      setPhotos((current) => [...current, ...uploaded].slice(0, MAX_PHOTOS));
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
        body: JSON.stringify({ transcript, images: photos.filter((photo) => AI_IMAGE_TYPES.includes(photo.type)).map((photo) => photo.url), type: documentType }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Nie udało się przygotować szkicu.');
      setDraft({
        title: result.title ?? '',
        slug: result.slug ?? slugify(result.title ?? ''),
        excerpt: result.excerpt ?? '',
        seoDescription: result.seoDescription ?? '',
        content: result.content ?? '',
        categories: Array.isArray(result.categories) ? result.categories : [],
        instagram: result.instagram ?? '',
      });
      setSlugTouched(false);
      setSaved(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się przygotować szkicu.');
    } finally {
      setBusy(false);
    }
  }

  async function save(status: 'draft' | 'published') {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const existing = saved ? { slug: saved.slug } : editing;
      const response = await fetch(documentType === 'page' ? '/api/pages' : '/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          slug: existing?.slug ?? (draft.slug || slugify(draft.title)),
          id: editing?.id,
          date: editing?.date,
          overwrite: Boolean(existing),
          status: documentType === 'page' ? 'published' : status,
          gallery: photos.map((photo) => photo.url),
          image: photos[0]?.url,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Nie udało się zapisać wpisu.');
      setSaved({ slug: result.slug, status: result.status, type: documentType });
      setNotice(status === 'draft' ? 'Szkic zapisany.' : 'Opublikowano.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nie udało się zapisać wpisu.');
    } finally {
      setBusy(false);
    }
  }

  function openDraft(item: DraftItem) {
    setDocumentType('post');
    setDraft({ title: item.title, slug: item.slug, excerpt: item.excerpt, seoDescription: item.seoDescription, content: item.content, categories: item.categories, instagram: item.instagram });
    setTranscript('');
    const urls = item.gallery.length ? item.gallery : item.image ? [item.image] : [];
    setPhotos(urls.map((url) => ({ url, name: item.title, type: 'image/jpeg' })));
    setEditing({ id: item.id, date: item.date, slug: item.slug, legacy: item.legacy });
    setSlugTouched(true);
    setSaved(null);
    setNotice('');
    setTab('new');
  }

  function newPost() {
    setDraft(emptyDraft);
    setTranscript('');
    setPhotos([]);
    setEditing(null);
    setSaved(null);
    setSlugTouched(false);
    setNotice('');
    setTab('new');
  }

  async function copyInstagram() {
    await navigator.clipboard.writeText(draft.instagram).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  }

  if (!authenticated) {
    return (
      <main className="studio-login">
        <Link className="studio-brand" href="/" aria-label="Świat Czeka — strona główna"><Image src="/swiatczeka-logo.png" width={2576} height={903} alt="Świat Czeka" sizes="200px" /></Link>
        <div className="login-panel"><span className="section-label">Panel administratora</span><h1>Witaj <em>w domu.</em></h1><p>To miejsce jest tylko dla autorki bloga.</p>
          <form onSubmit={login}>
            <label htmlFor="email">E-mail</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
            <label htmlFor="password">Hasło</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            <button className="studio-primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : null} Zaloguj się <ArrowUpRight size={17} /></button>
          </form>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Link className="login-back" href="/">← wróć do bloga</Link>
        </div>
        <span className="login-note">Świat Czeka · panel administratora</span>
      </main>
    );
  }

  const missing = [!config.blob && 'magazyn Vercel Blob', !config.ai && 'klucz ANTHROPIC_API_KEY'].filter(Boolean);

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <Link className="studio-brand" href="/" aria-label="Świat Czeka — strona główna"><Image src="/swiatczeka-logo.png" width={2576} height={903} alt="Świat Czeka" sizes="200px" /></Link>
        <nav className="studio-tabs" aria-label="Panel">
          <button className={tab === 'overview' ? 'tab-active' : ''} onClick={() => setTab('overview')}><BarChart3 size={16} /> Przegląd</button>
          <button className={tab === 'new' ? 'tab-active' : ''} onClick={() => (tab === 'new' ? undefined : newPost())}><Mic size={16} /> Nowy wpis</button>
        </nav>
        <button className="icon-button" onClick={logout} title="Wyloguj" aria-label="Wyloguj"><LogOut size={17} /></button>
      </header>

      <div className="studio-main">
        {missing.length > 0 && <p className="studio-warning" role="status">Do pełnego działania brakuje w Vercel: {missing.join(', ')}.</p>}

        {tab === 'overview' && (
          <>
            <div className="studio-heading"><div><Link className="studio-back" href="/"><ArrowLeft size={15} /> Blog</Link><h1>Cześć, <em>Anka.</em></h1><p>Tu widzisz, co czeka na dokończenie i jak czytają Twój blog.</p></div>
              <button className="studio-primary" onClick={newPost}><Mic size={17} /> Podyktuj nowy wpis</button></div>

            <section className="studio-cards" aria-label="Statystyki">
              <div><span>Opublikowane wpisy</span><strong>{totals.published}</strong></div>
              <div><span>Drafty do dokończenia</span><strong>{totals.drafts}</strong></div>
            </section>

            <section className="studio-panel" aria-labelledby="visits-title">
              <h2 id="visits-title">Odwiedziny bloga</h2>
              <p className="studio-hint">Statystyki (odwiedziny, najczęściej czytane wpisy, kraje, urządzenia, skąd przychodzą czytelnicy) są w Vercel Analytics. Włącz je raz w projekcie: zakładka Analytics → Enable. Dane pojawią się po pierwszych wizytach.</p>
              <a className="studio-secondary" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer"><BarChart3 size={15} /> Otwórz Vercel → Analytics</a>
            </section>

            <section className="studio-panel" aria-labelledby="drafts-title">
              <h2 id="drafts-title">Drafty do dokończenia <span>{drafts.length}</span></h2>
              <p className="studio-hint">Wpisy bez treści (np. sam link do albumu Picasa) nie są widoczne na blogu. Otwórz wpis, podyktuj opis albo dopisz tekst, i opublikuj.</p>
              {drafts.length === 0 ? <p className="studio-hint">Brak draftów. Świetnie!</p> : (
                <ul className="draft-list">
                  {drafts.map((item) => (
                    <li key={item.slug}>
                      <div><strong>{item.title || item.slug}</strong><span>{new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(item.date))}{item.categories[0] ? ` · ${item.categories[0]}` : ''}{item.legacy ? ' · stary wpis' : ''}</span></div>
                      <button className="studio-secondary" onClick={() => openDraft(item)}><FileText size={15} /> Dokończ</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="studio-panel" aria-labelledby="yt-title">
              <h2 id="yt-title">Wideo z YouTube</h2>
              <p className="studio-hint">Strona „Wideo” sama pokazuje wszystkie filmy z kanału „Czeka Świat”, a nowe pojawiają się tam po publikacji na YouTube (odświeżanie co godzinę). Nic nie musisz robić.</p>
              <Link className="studio-secondary" href="/wideo"><RefreshCw size={15} /> Zobacz stronę Wideo</Link>
            </section>
          </>
        )}

        {tab === 'new' && (
          <>
            <div className="studio-heading"><div><button className="studio-back" onClick={() => setTab('overview')}><ArrowLeft size={15} /> Przegląd</button><h1>{editing ? 'Dokończ ' : 'Nowa '}<em>{editing ? 'wpis.' : 'opowieść.'}</em></h1><p>Powiedz, co wydarzyło się po drodze. Poprawimy tylko przecinki i powtórzenia, a Twój sposób mówienia zostaje.</p></div></div>
            <div className="studio-mode" role="group" aria-label="Rodzaj publikacji">
              <span>Tworzysz:</span>
              <button className={documentType === 'post' ? 'mode-active' : ''} aria-pressed={documentType === 'post'} onClick={() => { setDocumentType('post'); setSaved(null); }}>Wpis na blogu</button>
              <button className={documentType === 'page' ? 'mode-active' : ''} aria-pressed={documentType === 'page'} disabled={Boolean(editing)} onClick={() => { setDocumentType('page'); setSaved(null); }}>Landing page</button>
            </div>
            <div className="studio-workspace">
              <section className="capture-column" aria-label="Nagranie i zdjęcia">
                <div className="studio-block-title"><span>01</span><div><h2>Twoja historia</h2><p>Nagraj głos albo wpisz tekst.</p></div></div>
                <button type="button" className={`record-button${listening ? ' is-listening' : ''}`} onClick={toggleRecording}><span className="record-icon">{listening ? <MicOff size={22} /> : <Mic size={22} />}</span><span><strong>{listening ? 'Zatrzymaj nagrywanie' : 'Nagraj głos'}</strong><small>{listening ? 'Słucham… mów swobodnie' : 'Dyktuj po polsku, tak jak opowiadasz'}</small></span><span className="record-wave" aria-hidden="true"><i /><i /><i /><i /><i /></span></button>
                <label className="field-label" htmlFor="transcript">Notatka lub transkrypcja</label><textarea id="transcript" className="transcript-input" value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Np. Byliśmy na sylwestrze na Filipinach. Zaczęło się od…" />
                <div className="photos-heading"><div><span className="studio-step">02</span><strong>Zdjęcia z drogi</strong><span className="photo-count">{photos.length}/{MAX_PHOTOS}</span></div><label className="photo-add" htmlFor="photos"><ImagePlus size={16} /> Dodaj zdjęcia<input id="photos" type="file" accept="image/*" multiple onChange={(event) => { void addPhotos(event.target.files); event.target.value = ''; }} /></label></div>
                {photos.length > 0 && <div className="studio-photos">{photos.map((photo, index) => <figure key={photo.url}><Image src={photo.url} alt={photo.name} fill sizes="(max-width: 620px) 20vw, 10vw" />{index === 0 && <figcaption>okładka</figcaption>}<button type="button" onClick={() => setPhotos((current) => current.filter((item) => item.url !== photo.url))} aria-label={`Usuń ${photo.name}`}><X size={14} /></button></figure>)}</div>}
                <p className="photo-format-note">Pierwsze zdjęcie jest okładką. Do analizy AI trafia pierwszych 6 (JPG, PNG lub WebP).</p>
                <button type="button" className="studio-generate" onClick={makeDraft} disabled={busy || transcript.trim().length < 8}><Sparkles size={17} /> {documentType === 'page' ? 'Stwórz landing page' : 'Wygładź i ułóż wpis'} <ArrowUpRight size={16} /></button>
              </section>

              <section className="draft-column" aria-label="Edytor wpisu">
                <div className="studio-block-title"><span>03</span><div><h2>Twój wpis</h2><p>Przejrzyj, popraw, opublikuj.</p></div></div>
                <form className="draft-form" onSubmit={(event) => { event.preventDefault(); void save('published'); }}>
                  <label className="field-label" htmlFor="draft-title">Tytuł</label><input id="draft-title" className="draft-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: slugTouched ? draft.slug : slugify(event.target.value) })} placeholder="Nadaj tej chwili tytuł" required />
                  <label className="field-label" htmlFor="draft-slug">Adres wpisu <span>swiatczeka.pl/{draft.slug || '…'}</span></label><input id="draft-slug" className="draft-categories" value={draft.slug} disabled={Boolean(editing || saved)} onChange={(event) => { setSlugTouched(true); setDraft({ ...draft, slug: slugify(event.target.value) }); }} placeholder="sylwester-na-filipinach" />
                  <label className="field-label" htmlFor="draft-excerpt">Krótki wstęp</label><textarea id="draft-excerpt" className="draft-excerpt" value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} placeholder="Jedno zdanie, które wciągnie w opowieść" />
                  <label className="field-label" htmlFor="draft-seo">Opis w Google <span>{draft.seoDescription.length}/155</span></label><textarea id="draft-seo" className="draft-excerpt" maxLength={170} value={draft.seoDescription} onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value })} placeholder="Zostanie ustawiony automatycznie z początku tekstu, jeśli zostawisz puste" />
                  <label className="field-label" htmlFor="draft-content">Treść <span>nagłówki zaczynaj od „## ”</span></label><textarea id="draft-content" className="draft-content" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="Tu pojawi się Twoja opowieść. Możesz ją dowolnie poprawić." required />
                  <label className="field-label" htmlFor="draft-categories">Miejsce lub temat <span>oddziel przecinkiem</span></label><input id="draft-categories" className="draft-categories" value={draft.categories.join(', ')} onChange={(event) => setDraft({ ...draft, categories: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })} placeholder="Filipiny, ludzie, jedzenie" />
                  {documentType === 'post' && <><label className="field-label" htmlFor="draft-ig">Wersja na Instagram <span>{draft.instagram.length}/2200</span></label><textarea id="draft-ig" className="draft-excerpt" value={draft.instagram} onChange={(event) => setDraft({ ...draft, instagram: event.target.value })} placeholder="Krótka wersja z hasztagami" />
                    <button type="button" className="studio-secondary" onClick={copyInstagram} disabled={!draft.instagram}>{copied ? <Check size={15} /> : <Clipboard size={15} />} {copied ? 'Skopiowano' : 'Kopiuj tekst na Instagram'}</button></>}
                  <div className="publish-row"><span><PenLine size={15} /> {saved ? (saved.status === 'draft' ? 'Zapisano jako szkic' : 'Wpis jest na blogu') : documentType === 'page' ? 'Strona dostanie własny adres URL' : 'Szkic lub publikacja na blogu'}</span>
                    <div className="publish-actions">
                      {documentType === 'post' && <button type="button" className="studio-secondary" disabled={busy || !draft.title.trim() || !draft.content.trim()} onClick={() => void save('draft')}><Save size={15} /> Zapisz szkic</button>}
                      <button className="studio-primary" disabled={busy || !draft.title.trim() || !draft.content.trim()}>{busy ? <LoaderCircle className="spin" size={17} /> : saved?.status === 'published' ? <Check size={17} /> : <Send size={16} />}{saved?.status === 'published' ? 'Opublikowano' : 'Opublikuj'}</button>
                    </div>
                  </div>
                </form>
                {saved?.status === 'published' && <Link className="published-link" href={`/${saved.slug}`}>Zobacz na blogu <ArrowUpRight size={15} /></Link>}
              </section>
            </div>
          </>
        )}

        {notice && <div className="studio-notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Zamknij"><X size={16} /></button></div>}
        {error && <div className="studio-error" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Zamknij"><X size={16} /></button></div>}
        {busy && <span className="studio-busy" aria-live="polite"><LoaderCircle className="spin" size={14} /> Pracuję…</span>}
      </div>
      <footer className="studio-footer"><span>Świat Czeka · panel administratora</span><span>Twoje historie, Twój rytm.</span></footer>
    </main>
  );
}
