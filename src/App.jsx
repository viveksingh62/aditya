import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Instagram, Menu, X } from "lucide-react";
import { artworks } from "./data/artworks.js";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function SafeImage({ src, alt, className = "", eager = false }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className={`image-placeholder ${className}`} role="img" aria-label={`${alt} image not added yet`}>
      <span className="placeholder-mark">✳</span><span>Drawing goes here</span><small>ADD IMAGE TO /public/images</small>
    </div>
  ) : <img className={className} src={src} alt={alt} loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />;
}

function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const links = [["Work", "#work"], ["Process", "#process"], ["About", "#about"]];
  return <header className="site-header">
    <a className="signature" href="#top" aria-label="Aditya Singh, home">Aditya Singh<span className="signature-dot">.</span></a>
    <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
    <a className="button button-dark header-cta" href="#commission">Commissions <ArrowUpRight size={15} /></a>
    <button className="menu-toggle" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <AnimatePresence>{open && <motion.nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
      {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={16} /></a>)}
      <a href="#commission" onClick={() => setOpen(false)}>Ask about a commission <ArrowUpRight size={16} /></a>
    </motion.nav>}</AnimatePresence>
  </header>;
}

function ArtworkLightbox({ artwork, items, onClose, onSelect }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const previousFocus = useRef(null);
  useEffect(() => {
    previousFocus.current = document.activeElement;
    closeRef.current?.focus();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onSelect(1);
      if (event.key === "ArrowLeft") onSelect(-1);
      if (event.key === "Tab") {
        const els = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href]')];
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = oldOverflow; previousFocus.current?.focus?.(); };
  }, [onClose, onSelect]);
  return <motion.div className="lightbox-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title" ref={dialogRef}>
      <button className="icon-button lightbox-close" ref={closeRef} onClick={onClose} aria-label="Close artwork viewer"><X /></button>
      <button className="icon-button lightbox-prev" onClick={() => onSelect(-1)} aria-label="Previous artwork"><ArrowLeft /></button>
      <div className="lightbox-art"><SafeImage src={artwork.image} alt={artwork.title} /></div>
      <button className="icon-button lightbox-next" onClick={() => onSelect(1)} aria-label="Next artwork"><ArrowRight /></button>
      <div className="lightbox-caption"><span className="eyebrow">{artwork.category} · {artwork.year}</span><h2 id="lightbox-title">{artwork.title}</h2><p className="serif">{artwork.medium}</p><p>{artwork.description}</p><span className="lightbox-count">{items.findIndex((item) => item.id === artwork.id) + 1} / {items.length}</span></div>
    </section>
  </motion.div>;
}

function ArtworkGallery() {
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const categories = useMemo(() => ["All", ...new Set(artworks.map((art) => art.category))], []);
  const filtered = useMemo(() => category === "All" ? artworks : artworks.filter((art) => art.category === category), [category]);
  const activeIndex = artworks.findIndex((art) => art.id === selectedId);
  const selectRelative = (step) => setSelectedId(artworks[(activeIndex + step + artworks.length) % artworks.length]?.id);
  const counts = Object.fromEntries(categories.slice(1).map((name) => [name, artworks.filter((art) => art.category === name).length]));
  return <section className="section" id="work">
    <motion.div className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
      <div><p className="eyebrow">A SELECTION FROM THE SKETCHBOOK</p><h2 className="section-title">Selected work<span className="peach-dot">.</span></h2></div>
      <p className="serif">A collection of portraits, small observations, and the marks that bring them to life.</p><span className="section-index">01 — GALLERY</span>
    </motion.div>
    <div className="filter-row" aria-label="Filter drawings by category">{categories.map((name) => <button key={name} className={`filter-button ${category === name ? "is-active" : ""}`} onClick={() => setCategory(name)} aria-pressed={category === name}>{name}<sup>{name === "All" ? artworks.length : counts[name]}</sup></button>)}</div>
    <motion.div className="art-grid" layout>
      <AnimatePresence mode="popLayout">{filtered.map((art, index) => <motion.button className={`art-card art-card-${index % 3}`} key={art.id} layout onClick={() => setSelectedId(art.id)} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .45, delay: (index % 3) * .06 }} aria-label={`View ${art.title}`}>
        <span className="art-frame"><SafeImage src={art.image} alt={art.title} /><span className="art-open"><ArrowUpRight size={19} /></span></span>
        <span className="art-meta"><span><span className="art-title">{art.title}</span><span className="art-subtitle">{art.medium} · {art.year}</span></span><span className="art-category">{art.category}</span></span>
      </motion.button>)}</AnimatePresence>
    </motion.div>
    {artworks.length === 0 && <p className="empty-gallery serif">The sketchbook is waiting for its first drawing.</p>}
    <p className="gallery-footnote"><span className="pencil-rule" /> Showing {filtered.length} {filtered.length === 1 ? "drawing" : "drawings"} from the collection</p>
    <AnimatePresence>{selectedId && <ArtworkLightbox artwork={artworks[activeIndex]} items={artworks} onClose={() => setSelectedId(null)} onSelect={selectRelative} />}</AnimatePresence>
  </section>;
}

function CommissionForm() { 
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const submit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const next = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (!values.type) next.type = "Choose an artwork type.";
    if (!values.description.trim() || values.description.trim().length < 20) next.description = "Please add at least 20 characters about your idea.";
    setErrors(next); setStatus("");
    if (Object.keys(next).length) { form.querySelector(`[name="${Object.keys(next)[0]}"]`)?.focus(); return; }
    const subject = encodeURIComponent(`Commission enquiry — ${values.type}`);
    const body = encodeURIComponent(`Name: ${values.name}\nEmail: ${values.email}\nArtwork type: ${values.type}\nPreferred size: ${values.size || "Not specified"}\nBudget: ${values.budget || "Not specified"}\n\nAbout the drawing:\n${values.description}`);
    setStatus("Your email app should open with a draft. Review it and press send to deliver your enquiry.");
    window.location.href = `mailto:adityasingh421002@gmail.com?subject=${subject}&body=${body}`;
  };
  const fieldError = (name) => errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]}</span> : null;
  return <form className="commission-form" onSubmit={submit} noValidate>
    <div className="form-intro"><p className="eyebrow">TELL ME ABOUT YOUR IDEA</p><p className="serif">A few details are a lovely place to start.</p></div>
    <div className="form-grid">
      <label>Name <input name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} placeholder="Your name" />{fieldError("name")}</label>
      <label>Email <input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} placeholder="you@example.com" />{fieldError("email")}</label>
      <label>Artwork type <select name="type" defaultValue="" aria-invalid={!!errors.type} aria-describedby={errors.type ? "type-error" : undefined}><option value="" disabled>Select one</option><option>Portrait</option><option>Pet portrait</option><option>Nature study</option><option>Something else</option></select>{fieldError("type")}</label>
      <label>Preferred size <select name="size" defaultValue=""><option value="">Not sure yet</option><option>A5</option><option>A4</option><option>A3</option><option>Other / discuss</option></select></label>
      <label className="full-field">Optional budget <input name="budget" placeholder="e.g. ₹5,000–₹8,000" /></label>
      <label className="full-field">Tell me about the drawing <textarea name="description" rows="4" aria-invalid={!!errors.description} aria-describedby={errors.description ? "description-error" : undefined} placeholder="Share your idea, reference, and anything you'd like me to know…" />{fieldError("description")}</label>
    </div>
    <button className="button button-dark form-submit" type="submit">Prepare email enquiry <ArrowRight size={16} /></button>
    {status && <p className="form-status" role="status"><Check size={16} />{status}</p>}
    <p className="form-disclaimer">This opens a draft in your email app. The request is sent only when you review and send that email. Replace the editable email address in <code>src/App.jsx</code> before publishing.</p>
  </form>;
}

export default function App() {
  const reduceMotion = useReducedMotion();
  const counts = useMemo(() => Object.fromEntries([...new Set(artworks.map((a) => a.category))].map((category) => [category, artworks.filter((a) => a.category === category).length])), []);
  const process = [
    ["01", "Reference", "We begin with a reference and take time to understand the proportions, light, and feeling of the subject."],
    ["02", "Sketch & build", "Light outlines establish the structure. Graphite layers gradually build the shadows and form."],
    ["03", "Final detail", "Textures, highlights, and small refinements bring the drawing together, one mark at a time."],
  ];
  return <MotionConfig reducedMotion="user"><div id="top" className="page-shell">
    <Header />
    <main>
      <section className="hero">
        <motion.div className="hero-copy" initial={reduceMotion ? false : "hidden"} animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: .12, delayChildren: .1 } } }}>
          <motion.p className="eyebrow hero-eyebrow" variants={fadeUp}>ARTIST <span>/</span> PENCIL DRAWINGS</motion.p>
          <motion.h1 className="display-title" variants={fadeUp}>PENCIL<br />ON PAPER<span className="peach-dot">.</span></motion.h1>
          <motion.p className="hero-subtitle serif" variants={fadeUp}>Portraits drawn slowly, by hand.</motion.p>
          <motion.p className="body-copy" variants={fadeUp}>I’m Aditya Singh. I work in pencil and graphite, finding the small details that make a face, a form, or a moment feel like itself.</motion.p>
          <motion.a className="button button-dark hero-cta" href="#work" variants={fadeUp}>View my work <ArrowRight size={16} /></motion.a>
          <motion.a className="scroll-note" href="#work" variants={fadeUp}><span className="scroll-icon"><ArrowDown size={13} /></span><span>Scroll to explore</span></motion.a>
        </motion.div>
        <motion.div className="hero-image-wrap" initial={reduceMotion ? false : { opacity: 0, y: 28, rotate: 1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: .85, delay: .2 }}>
          <div className="hero-frame"><SafeImage src="/images/aditya.jpg" className="hero-image" eager alt="Aditya Singh in warm evening light" /></div>
          <motion.aside className="paper-note" initial={reduceMotion ? false : { opacity: 0, y: 12, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -3 }} transition={{ duration: .6, delay: .75 }}><span className="eyebrow">THE ARTIST</span><p className="signature note-signature">Aditya Singh</p><p>Looking closely.<br />Drawing what I find.</p><span className="note-scribble" aria-hidden="true">〰</span></motion.aside>
          <svg className="margin-doodle" viewBox="0 0 64 124" aria-hidden="true"><path pathLength="1" d="M30 118 C27 96 28 77 33 58 C37 41 43 24 51 8" /><path pathLength="1" d="M31 88 C17 84 10 74 8 65 C21 66 30 74 31 88Z" /><path pathLength="1" d="M34 71 C47 68 54 58 56 49 C44 50 36 58 34 71Z" /><path pathLength="1" d="M29 103 C17 101 9 93 6 85 C18 84 27 91 29 103Z" /><path pathLength="1" d="M40 45 C29 40 25 30 26 22 C37 26 42 35 40 45Z" /><path pathLength="1" d="M45 29 C47 18 52 12 57 7" /></svg>
          <span className="side-note">one mark<br />at a time <span>↙</span></span>
          <span className="hero-index">FIG. 01 &nbsp; / &nbsp; THE ARTIST</span>
        </motion.div>
        <span className="hero-deco" aria-hidden="true">✳</span>
      </section>

      <div className="ticker" aria-label="Pencil and graphite, made slowly by hand"><div className="ticker-track">{Array.from({ length: 4 }, (_, i) => <span key={i}>PENCIL &amp; GRAPHITE <i>✳</i> MADE SLOWLY BY HAND <i>✳</i> STUDIES IN LIGHT <i>✳</i></span>)}</div></div>

      <ArtworkGallery />

      <section className="stats-strip" aria-label="Artwork collection counts"><div className="stats-heading"><span className="eyebrow">THE COLLECTION</span><span className="serif">Growing one drawing at a time.</span></div><div className="stat"><strong>{artworks.length.toString().padStart(2, "0")}</strong><span>Drawings</span></div>{Object.entries(counts).map(([name, count]) => <div className="stat" key={name}><strong>{count.toString().padStart(2, "0")}</strong><span>{name}</span></div>)}</section>

      <section className="section process-section" id="process">
        <motion.div className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}><div><p className="eyebrow">FROM FIRST LOOK TO FINAL MARK</p><h2 className="section-title">The making<span className="peach-dot">.</span></h2></div><p className="serif">There is no rush to a drawing. The process is part of what gives it life.</p><span className="section-index">02 — PROCESS</span></motion.div>
        <div className="process-grid">{process.map(([num, title, description], i) => <motion.article className="process-item" key={num} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={fadeUp} transition={{ duration: .5, delay: i * .1 }}>
          <div className="process-image"><SafeImage src={`/images/process-${i + 1}.jpg`} alt={`${title} stage of a pencil drawing`} /><span className="process-image-number">{num}</span></div>
          <div className="process-rule"><span /></div><span className="process-number">{num} / 03</span><h3>{title}</h3><p className="serif">{description}</p>
        </motion.article>)}</div>
      </section>

      <section className="about-section" id="about">
        <div className="about-image-wrap"><SafeImage src="/images/aditya.jpg" alt="Aditya Singh, pencil and graphite artist" /><span className="about-image-caption">ADITYA SINGH — ARTIST</span></div>
        <motion.div className="about-copy-wrap" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}><p className="eyebrow">A LITTLE ABOUT ME</p><h2 className="section-title">Drawing is a way of noticing<span className="peach-dot">.</span></h2><p className="serif about-lede">I’m Aditya, an artist who enjoys the quiet focus of pencil on paper.</p><p className="about-body">My practice is rooted in observation: the shape of a shadow, the character in an expression, the subtle details that make a subject feel present. I work primarily with graphite and pencil, and I’m drawn to portraits, nature, and everyday forms.</p><div className="about-notes"><div><span className="eyebrow">MEDIUMS</span><span>Graphite · Pencil · Paper</span></div><div><span className="eyebrow">SUBJECTS</span><span>Portraits · Nature · Studies</span></div></div><p className="hand-note">Currently taking commission enquiries <span>↗</span></p></motion.div>
      </section>

      <section className="commission-section" id="commission"><div className="commission-heading"><span className="eyebrow">MADE BY HAND, MADE FOR YOU</span><h2 className="section-title">Commissions<br /><span className="commission-open">open<span className="underline-scribble" aria-hidden="true" /></span><span className="peach-dot">.</span></h2><p className="serif">A portrait for someone you love, a favourite subject, or an idea you can’t quite let go of. Tell me a little about it.</p><div className="commission-steps">{["Share your idea & reference", "Discuss size, price & timing", "Confirm the drawing details", "Receive the finished work"].map((step, i) => <div key={step}><span>0{i + 1}</span>{step}</div>)}</div></div><CommissionForm /></section>
    </main>
    <footer className="site-footer"><div className="footer-top"><a className="signature footer-signature" href="#top">Aditya Singh<span className="signature-dot">.</span></a><p className="serif">A little graphite, a lot of looking.</p><a className="footer-cta" href="#commission">Start a commission <ArrowUpRight size={16} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Aditya Singh · Pencil &amp; graphite</span><span>Drawn slowly, by hand</span><a href="adityasingh421002@gmail.com">adityasingh421002@gmail.com</a><a className="footer-instagram" href="https://www.instagram.com/aditya_art_454_1/" target="_blank" rel="noreferrer" aria-label="Instagram profile — replace placeholder handle"><Instagram size={14} /> Instagram <ArrowUpRight size={12} /></a><a href="#top" aria-label="Back to top">Back to top ↑</a><a className="creator-credit" href="https://vivekdead.vercel.app" target="_blank" rel="noreferrer"><span aria-hidden="true">✳</span> Made by Vivek Singh <ArrowUpRight size={11} /></a></div></footer>
  </div></MotionConfig>;
}
