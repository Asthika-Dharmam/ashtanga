// Line icons, 24 × 24, drawn in currentColor.
const s = (body) => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  panchanga: s('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'),
  ashtanga: s('<path d="M12 3.5 20.5 18h-17Z"/><path d="M12 20.5 3.5 6h17Z"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>'),
  sankalpa: s('<path d="M12 3c2 3 3.5 4.6 3.5 7a3.5 3.5 0 0 1-7 0C8.5 7.6 10 6 12 3Z"/><path d="M5 17h14l-2 4H7Z"/><path d="M12 13.5V17"/>'),
  festivals: s('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="m12 12 1.1 2.2 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3Z"/>'),
  about: s('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>'),
  pin: s('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>'),
  left: s('<path d="m14.5 6-6 6 6 6"/>'),
  right: s('<path d="m9.5 6 6 6-6 6"/>'),
  copy: s('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
  share: s('<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/>'),
  sunrise: s('<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 4v5M9.5 6.5 12 4l2.5 2.5"/>'),
  sunset: s('<path d="M4 18h16M7 18a5 5 0 0 1 10 0M12 4v5M9.5 6.5 12 9l2.5-2.5"/>'),
  moonrise: s('<path d="M4 19h16"/><path d="M15.5 15.5A6 6 0 1 1 9 7a4.7 4.7 0 0 0 6.5 8.5Z"/>'),
  avoid: s('<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>'),
  good: s('<circle cx="12" cy="12" r="8.5"/><path d="m8 12.5 2.7 2.7L16 9.8"/>'),
  link: s('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>'),
  whatsapp: s('<path d="M4 20l1.3-4A8 8 0 1 1 8.2 19Z"/><path d="M9 9.2c0 3 2.6 5.8 5.8 5.8l1-1.6-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2Z"/>'),
  telegram: s('<path d="M20.5 4 3.5 11l5.5 2 2 6 3-4 4.5 3.5Z"/><path d="m9 13 8.5-6"/>'),
  phone: s('<path d="M5 4h4l1.5 4-2.2 1.4a11 11 0 0 0 6.3 6.3L16 13.5l4 1.5v4a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z"/>'),
  book: s('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5Z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z"/>'),
  youtube: s('<rect x="3" y="5.5" width="18" height="13" rx="3.5"/><path d="m10.2 9.3 4.6 2.7-4.6 2.7Z" fill="currentColor"/>'),
  gear: s('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
  bindu: s('<circle cx="12" cy="12" r="3" fill="currentColor"/>'),
};
