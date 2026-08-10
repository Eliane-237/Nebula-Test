export const DOMAIN_COLOR: Record<string, string> = {
  FINANCE: '#146138', DATA: '#0E7C86', PRODUCT: '#2D5FB8',
  SOFTWARE_ENGINEERING: '#4A3FA6', CONSULTING: '#B8752D',
  MARKETING: '#B23B6B', ENTREPRENEURSHIP: '#7a5c38',
};

export const DOMAIN_LABEL: Record<string, string> = {
  FINANCE: 'Finance', DATA: 'Data', PRODUCT: 'Product',
  SOFTWARE_ENGINEERING: 'Software Engineering', CONSULTING: 'Consulting',
  MARKETING: 'Marketing', ENTREPRENEURSHIP: 'Entrepreneurship',
};

export const DIFF_LABEL: Record<string, string> = {
  BEGINNER: 'Débutant', INTERMEDIATE: 'Intermédiaire', ADVANCED: 'Avancé',
};

export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: 'Publié',    className: 'badge-published' },
  DRAFT:     { label: 'Brouillon', className: 'badge-draft' },
  ARCHIVED:  { label: 'Archivé',   className: 'badge-archived' },
};

export const COHORT_STATUS_LABEL: Record<string, string> = {
  OPEN: 'Ouvert', CLOSED: 'Fermé', FULL: 'Complet',
};

export const COHORT_STATUS_COLOR: Record<string, string> = {
  OPEN: '#2e7a52', CLOSED: '#9aa4ab', FULL: '#b86030',
};
