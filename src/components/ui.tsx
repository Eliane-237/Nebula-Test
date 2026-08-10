'use client';

import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, MoreHorizontal, Users, X } from 'lucide-react';
import type { Program } from '@/types';

const colorClasses: Record<Program['color'], string> = {
  blue: 'program-blue',
  orange: 'program-orange',
  green: 'program-green',
  red: 'program-red',
};

export function StatCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}

export function ProgramCard({ program, enrolled, onOpen }: { program: Program; enrolled?: boolean; onOpen: (program: Program) => void }) {
  const num = program.category === 'Data' ? '01' : program.category === 'Product' ? '02' : '03';
  return (
    <article className="program-card">
      <div className={`program-banner ${colorClasses[program.color]}`}>
        <span className="category-pill">{program.category}</span>
        <button className="icon-button light"><MoreHorizontal size={18} /></button>
        <div className="banner-art"><span>{num}</span></div>
      </div>
      <div className="program-card-body">
        <div className="program-card-heading">
          <h3>{program.title}</h3>
          <span className="status-dot">{program.status}</span>
        </div>
        <p className="program-description">{program.description}</p>
        <div className="program-meta">
          <span><Clock3 size={15} /> {program.duration}</span>
          <span><Users size={15} /> {program.sessions} sessions</span>
        </div>
        <div className="coach-row">
          <span className={`avatar avatar-${program.color === 'blue' ? 'blue' : program.color === 'orange' ? 'orange' : 'green'}`}>{program.coachInitials}</span>
          <div><small>Led by</small><strong>{program.coach}</strong></div>
          <button className="text-button" onClick={() => onOpen(program)}>
            {enrolled ? 'View program' : 'View details'} <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function SessionRow({ title, program, date, time, type }: { title: string; program: string; date: string; time: string; type: string }) {
  const dayNum = date === 'Today' ? '16' : date === 'Tomorrow' ? '17' : '18';
  return (
    <div className="session-row">
      <div className="date-block"><strong>{dayNum}</strong><span>APR</span></div>
      <div className="session-info"><strong>{title}</strong><span>{program}</span></div>
      <span className="session-type">{type}</span>
      <span className="session-time"><Clock3 size={14} />{time}</span>
      <button className="row-chevron"><ArrowUpRight size={16} /></button>
    </div>
  );
}

export function ProgramModal({ program, onClose, onEnroll }: { program: Program; onClose: () => void; onEnroll: () => void }) {
  const num = program.category === 'Data' ? '01' : program.category === 'Product' ? '02' : '03';
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="program-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className={`modal-banner ${colorClasses[program.color]}`}>
          <span className="category-pill">{program.category}</span>
          <div className="banner-art"><span>{num}</span></div>
        </div>
        <div className="modal-body">
          <p className="eyebrow">JOB IMMERSION PROGRAM</p>
          <h2>{program.title}</h2>
          <p>{program.description}</p>
          <div className="modal-details">
            <span><Clock3 size={16} /> {program.duration}</span>
            <span><Users size={16} /> {program.enrolled}/{program.capacity} enrolled</span>
            <span><CalendarDays size={16} /> {program.sessions} sessions</span>
          </div>
          <div className="modal-coach">
            <span className={`avatar avatar-${program.color === 'blue' ? 'blue' : program.color === 'orange' ? 'orange' : 'green'}`}>{program.coachInitials}</span>
            <div><small>Your coach</small><strong>{program.coach}</strong></div>
          </div>
          <button className="primary-button full-width" onClick={onEnroll}>Join open cohort <ArrowUpRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
