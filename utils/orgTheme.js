/**
 * orgTheme.js — Centralised org-type theming for LimaHealth mobile app.
 *
 * Palette (matches web admin design system):
 *   Teal   #0CAF87  — brand primary for SCHOOL  (health, trust, calm)
 *   Purple #6C5CE7  — COMPANY (professional energy, mental-health tone)
 *   Navy   #0D3B7A  — HOSPITAL (clinical authority)
 *   Amber  #F9A825  — NGO (warm community)
 */

export const ORG_THEMES = {
  SCHOOL: {
    primary:      '#0CAF87',
    secondary:    '#5DCAA5',
    accent:       '#EBF9F5',
    glow:         'rgba(12, 175, 135, 0.18)',
    gradient:     ['#0CAF87', '#0F6E56'],
    memberLabel:   'Student',
    membersLabel:  'Students',
    supportLabel:  'Counselor',
    supportsLabel: 'Counselors',
    orgLabel:     'School',
    icon:         'school-outline',
    tagline:      'Supporting student wellbeing',
  },
  COMPANY: {
    primary:      '#6C5CE7',
    secondary:    '#AFA9EC',
    accent:       '#E9E6FE',
    glow:         'rgba(108, 92, 231, 0.18)',
    gradient:     ['#6C5CE7', '#534AB7'],
    memberLabel:   'Employee',
    membersLabel:  'Employees',
    supportLabel:  'Wellness Coach',
    supportsLabel: 'Wellness Coaches',
    orgLabel:     'Company',
    icon:         'briefcase-outline',
    tagline:      'Empowering employee wellness',
  },
  HOSPITAL: {
    primary:      '#0D3B7A',
    secondary:    '#378ADD',
    accent:       '#E8EEF8',
    glow:         'rgba(13, 59, 122, 0.18)',
    gradient:     ['#0D3B7A', '#185FA5'],
    memberLabel:   'Staff',
    membersLabel:  'Staff Members',
    supportLabel:  'Therapist',
    supportsLabel: 'Therapists',
    orgLabel:     'Hospital',
    icon:         'hospital-building',
    tagline:      'Care for those who care',
  },
  NGO: {
    primary:      '#F9A825',
    secondary:    '#EF9F27',
    accent:       '#FEF3CD',
    glow:         'rgba(249, 168, 37, 0.18)',
    gradient:     ['#F9A825', '#B45309'],
    memberLabel:   'Member',
    membersLabel:  'Members',
    supportLabel:  'Support Worker',
    supportsLabel: 'Support Workers',
    orgLabel:     'NGO',
    icon:         'hand-heart-outline',
    tagline:      'Wellbeing for every mission',
  },
};

export const DEFAULT_THEME = ORG_THEMES.SCHOOL;

export function getOrgTheme(orgType) {
  return ORG_THEMES[orgType] ?? DEFAULT_THEME;
}

export function getMemberLabel(orgType) {
  return getOrgTheme(orgType).memberLabel;
}

export function getSupportLabel(orgType) {
  return getOrgTheme(orgType).supportLabel;
}

/**
 * BASE — shell colors for the mobile app UI (dark-mode first).
 * These are structural/neutral — not org-branded.
 */
export const BASE = {
  bg:            '#020617',
  surface:       '#0F172A',
  surfaceAlt:    '#1B2A3B',
  border:        '#1E293B',
  muted:         '#334155',
  textPrimary:   '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted:     '#475569',
  success:       '#0CAF87',   // teal — brand success
  warning:       '#F9A825',   // amber — brand warning
  error:         '#E63946',   // health-red
  info:          '#378ADD',   // mid blue
};
