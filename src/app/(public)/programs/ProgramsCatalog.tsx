'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ProgramSummary } from '@/app/actions/programsQueries';
import { CoachApplicationModal } from './CoachApplicationModal';

const DOMAINS = ['All domains', 'Finance', 'Consulting', 'Data', 'Product', 'Software Engineering', 'Marketing'];

const DOMAIN_COLOR: Record<string, string> = {
  Finance: '#146138', Data: '#0E7C86', Product: '#2D5FB8',
  'Software Engineering': '#4A3FA6', Consulting: '#B8752D', Marketing: '#B23B6B',
  FINANCE: '#146138', DATA: '#0E7C86', PRODUCT: '#2D5FB8',
  SOFTWARE_ENGINEERING: '#4A3FA6', CONSULTING: '#B8752D', MARKETING: '#B23B6B',
};

function domainLabel(d: string) {
  return d.replace('_', ' ');
}

function ProgramCard({ program }: { program: ProgramSummary }) {
  const color = DOMAIN_COLOR[program.domain] ?? '#146138';
  const isFull = program.openSpotsTotal === 0;

  return (
    <Link href={`/programs/${program.id}`} className="prog-card">
      <div className="prog-card-top" style={{ background: color }}>
        <span className="prog-domain-tag">{domainLabel(program.domain)}</span>
      </div>
      <div className="prog-card-body">
        <div className="prog-coach-row">
          <span className="prog-card-avatar" style={{ background: color }}>
            {program.coachInitials}
          </span>
          <span>{program.coach}</span>
        </div>
        <h3>{program.title}</h3>
        <div className="prog-meta-row">
          <span>{program.numSessions} sessions</span>
          <span className="prog-dot-sep" />
          <span>45 min each</span>
          <span className="prog-dot-sep" />
          <span>{program.difficulty}</span>
        </div>
        <div className="prog-card-foot">
          <div className="prog-cohort-info">
            <strong>
              {program.nextCohortStart ? `Next cohort: ${program.nextCohortStart}` : 'Coming soon'}
            </strong>
            <small className={isFull ? 'full' : ''}>
              {isFull
                ? 'Full'
                : program.openSpotsTotal > 0
                  ? `${program.openSpotsTotal} spot${program.openSpotsTotal > 1 ? 's' : ''} left`
                  : '—'}
            </small>
          </div>
          <span className="prog-card-arrow">→</span>
        </div>
      </div>
    </Link>
  );
}

export function ProgramsCatalog({ programs }: { programs: ProgramSummary[] }) {
  const [query, setQuery]     = useState('');
  const [domain, setDomain]   = useState('All domains');
  const [showCoachModal, setShowCoachModal] = useState(false);

  const domainCount = useMemo(() => new Set(programs.map((p) => domainLabel(p.domain))).size, [programs]);

  const filtered = useMemo(
    () =>
      programs.filter(
        (p) =>
          (domain === 'All domains' || domainLabel(p.domain) === domain) &&
          `${p.title} ${domainLabel(p.domain)} ${p.coach}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [programs, domain, query],
  );

  return (
    <>
      {/* ── Hero ── */}
      <section className="prog-hero">
        <div className="prog-wrap">
          <div className="prog-hero-inner">
            <div className="prog-hero-text">
              <span className="prog-eyebrow">
                {programs.length}+ active programs · {domainCount} domain{domainCount !== 1 ? 's' : ''}
              </span>
              <h1 className="prog-hero-h1">
                Practice the job<br />before you <em>get</em> it.
              </h1>
              <p className="prog-hero-desc">
                Join a small cohort, work through a coach-designed case study over real sessions,
                and walk away with proof you can do the work — not just talk about it.
              </p>
              <div className="prog-hero-ctas">
                <a href="#browse" className="prog-btn-hero-primary">Browse programs</a>
                <a href="#how" className="prog-btn-hero-ghost">How cohorts work →</a>
              </div>
            </div>

            <div className="prog-hero-visual">
              <div className="prog-hero-blob" style={{ width: 220, height: 220, top: -30, right: -40 }} />
              <div className="prog-floating-chip prog-chip-top">
                <div className="prog-chip-num">4.9</div>
                <div className="prog-chip-label">avg. coach<br />rating</div>
              </div>
              <div className="prog-cohort-preview">
                <div className="prog-preview-head">
                  <div>
                    <strong>Data Analyst Bootcamp</strong>
                    <span>Cohort · Aug 18 → Sep 8</span>
                  </div>
                  <span className="prog-open-pill">Open</span>
                </div>
                <div className="prog-timeline-wrap">
                  <div className="prog-timeline-track">
                    <div className="prog-timeline-dots">
                      <span className="prog-dot" />
                      <span className="prog-dot" />
                      <span className="prog-dot" />
                      <span className="prog-dot prog-dot-pending" />
                    </div>
                  </div>
                </div>
                <div className="prog-timeline-labels">
                  <span>S1 · Aug 18</span>
                  <span>S2 · Aug 25</span>
                  <span>S3 · Sep 1</span>
                  <span>S4 · Sep 8</span>
                </div>
              </div>
              <div className="prog-floating-chip prog-chip-bottom">
                <div className="prog-chip-num">2/6</div>
                <div className="prog-chip-label">spots left<br />this cohort</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse ── */}
      <section id="browse" className="prog-browse">
        <div className="prog-wrap">
          {/* Header row */}
          <div className="prog-browse-head">
            <h2 className="prog-browse-h2">
              Explore <em>Job Immersion</em> programs
            </h2>
            <div className="prog-search-box">
              <svg width="16" height="16" fill="none" stroke="#6B7680" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                placeholder="Search by title, domain or coach…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Domain filter pills */}
          <div className="prog-filters">
            {DOMAINS.map((d) => (
              <button
                key={d}
                className={`prog-filter-pill${domain === d ? ' active' : ''}`}
                onClick={() => setDomain(d)}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="prog-empty">
              <p>No programs match your search.</p>
            </div>
          ) : (
            <div className="prog-grid">
              {filtered.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="prog-load-more">
              <button className="prog-btn-outline">View more programs</button>
            </div>
          )}

          {/* ── Coach CTA ── */}
          <div className="prog-coach-cta" id="coaches">
            <div className="prog-cta-text">
              <p className="prog-cta-eyebrow">Become a coach</p>
              <h2>
                You&apos;ve done the job.<br />
                <em>Design the case study</em> that teaches it.
              </h2>
            </div>
            <button
              className="prog-cta-btn"
              onClick={() => setShowCoachModal(true)}
            >
              Apply as a coach
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="prog-footer">
        <div className="prog-wrap">
          <div className="prog-foot-row">
            <span>© Nebula — Job Immersion Platform</span>
            <span>Made for students who&apos;d rather practice than watch.</span>
          </div>
        </div>
      </footer>

      {/* ── Coach application modal ── */}
      {showCoachModal && (
        <CoachApplicationModal onClose={() => setShowCoachModal(false)} />
      )}
    </>
  );
}
