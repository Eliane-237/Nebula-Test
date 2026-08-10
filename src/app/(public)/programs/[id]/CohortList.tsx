'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Users } from 'lucide-react';
import { enrollAction } from '@/app/actions/enrollAction';
import type { CohortSummary } from '@/app/actions/programsQueries';

type EnrollResult = { ok: true } | { ok: false; error: string };

function EnrollButton({
  cohortId,
  programId,
  isFull,
  isLoggedIn,
  isStudent,
}: {
  cohortId:   string;
  programId:  string;
  isFull:     boolean;
  isLoggedIn: boolean;
  isStudent:  boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<EnrollResult | null>(null);

  function handleEnroll() {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/programs/${programId}`);
      return;
    }
    if (!isStudent) return;

    setResult(null);
    startTransition(async () => {
      const r = await enrollAction(cohortId);
      setResult(r);
    });
  }

  if (isLoggedIn && !isStudent) return null;

  const label = isFull
    ? 'Cohort is full'
    : isPending
      ? 'En cours…'
      : isLoggedIn
        ? 'Enroll in this cohort'
        : 'Sign in to enroll';

  return (
    <div>
      <button
        className="pub-detail-enroll-btn"
        onClick={handleEnroll}
        disabled={isFull || isPending}
      >
        {label}
        {!isFull && !isPending && <ArrowUpRight size={15} />}
      </button>

      {result?.ok === true && (
        <div className="toast">
          <CheckCircle2 size={17} /> Inscription confirmée !
        </div>
      )}
      {result?.ok === false && (
        <div className="toast" style={{ background: '#fdf2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
          {result.error}
        </div>
      )}
    </div>
  );
}

export function CohortList({
  cohorts,
  programId,
  numSessions,
  isLoggedIn,
  isStudent,
}: {
  cohorts:     CohortSummary[];
  programId:   string;
  numSessions: number;
  isLoggedIn:  boolean;
  isStudent:   boolean;
}) {
  if (cohorts.length === 0) {
    return (
      <div className="detail-section">
        <h2>Available cohorts</h2>
        <div className="cohort-list">
          <div style={{ padding: '24px 0', color: '#9aa4ab', fontSize: 13 }}>
            No cohorts are currently open for this program.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-section">
      <h2>Available cohorts</h2>
      <div className="cohort-list">
        {cohorts.map((cohort) => {
          const full = cohort.status === 'FULL' || cohort.enrolled >= cohort.capacity;
          return (
            <div key={cohort.id} className="cohort-card">
              <div className="cohort-card-header">
                <span className="cohort-card-dates">
                  {cohort.startDate} → {cohort.endDate}
                </span>
                <span className={`badge badge-${full ? 'red' : 'green'}`}>
                  {full ? 'Full' : 'Open'}
                </span>
              </div>
              <div className="cohort-card-meta">
                <span><Users size={12} /> {cohort.enrolled}/{cohort.capacity} enrolled</span>
                <span><CalendarDays size={12} /> {numSessions} sessions</span>
                <span><Clock3 size={12} /> 45 min each</span>
              </div>
              <EnrollButton
                cohortId={cohortId(cohort.id)}
                programId={programId}
                isFull={full}
                isLoggedIn={isLoggedIn}
                isStudent={isStudent}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Passthrough so EnrollButton receives the actual cohort ID */
function cohortId(id: string) { return id; }
