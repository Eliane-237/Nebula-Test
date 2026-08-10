export type Role = 'student' | 'coach' | 'admin';

export type Program = {
  id: string;
  title: string;
  category: string;
  description: string;
  coach: string;
  coachInitials: string;
  duration: string;
  sessions: number;
  enrolled: number;
  capacity: number;
  color: 'blue' | 'orange' | 'green' | 'red';
  status: 'Published' | 'Draft';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
};

export type Session = {
  id: string;
  title: string;
  program: string;
  date: string;
  time: string;
  type: 'Workshop' | 'Feedback' | 'Case study';
};

export type CalendarEvent = {
  id: string;
  day: number;
  title: string;
  program: string;
  time: string;
  color: 'blue' | 'orange' | 'green' | 'red';
};

export type CohortMember = {
  id: string;
  name: string;
  initials: string;
  email: string;
  progress: number;
  status: 'On track' | 'Behind' | 'Completed';
  avatarColor: 'green' | 'purple' | 'blue' | 'orange';
};
