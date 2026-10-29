// Small inline icons (Heroicons, MIT) so the UI needs no icon library.
const base = { 'aria-hidden': true, fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.8, stroke: 'currentColor' };

export const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg {...base} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
  </svg>
);

export const PencilIcon = (p) => (
  <svg {...base} {...p}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.86 4.49 1.69-1.69a1.88 1.88 0 1 1 2.65 2.65L10.58 16.07a4.5 4.5 0 0 1-1.9 1.13L6 18l.8-2.68a4.5 4.5 0 0 1 1.13-1.9l8.93-8.93Zm0 0L19.5 7.13"
    />
  </svg>
);

export const TrashIcon = (p) => (
  <svg {...base} {...p}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.68.1 1.02.17M19.23 5.8 18.16 19.67A2.25 2.25 0 0 1 15.92 21.75H8.08a2.25 2.25 0 0 1-2.24-2.08L4.77 5.79m14.46 0a48.1 48.1 0 0 0-3.48-.4m-12 .56c.34-.06.68-.11 1.02-.17m0 0a48.1 48.1 0 0 1 3.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a51.96 51.96 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a48.67 48.67 0 0 0-7.5 0"
    />
  </svg>
);

export const XIcon = (p) => (
  <svg {...base} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export const CheckCircleIcon = (p) => (
  <svg {...base} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export const AlertIcon = (p) => (
  <svg {...base} {...p}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
    />
  </svg>
);

export const UsersIcon = (p) => (
  <svg {...base} {...p}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.13a9.38 9.38 0 0 0 2.63.37 9.34 9.34 0 0 0 4.12-.95 4.13 4.13 0 0 0-7.53-2.49M15 19.13v-.01c0-1.11-.29-2.16-.78-3.07M15 19.13v.1A12.32 12.32 0 0 1 8.62 21c-2.33 0-4.51-.65-6.37-1.77v-.1a6.38 6.38 0 0 1 11.96-3.07M12 6.38a3.38 3.38 0 1 1-6.75 0 3.38 3.38 0 0 1 6.75 0Zm8.25 2.25a2.63 2.63 0 1 1-5.25 0 2.63 2.63 0 0 1 5.25 0Z"
    />
  </svg>
);

export const AcademicCapIcon = (p) => (
  <svg {...base} {...p}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.26 10.15a60.44 60.44 0 0 0-.49 6.35A48.6 48.6 0 0 1 12 20.9a48.6 48.6 0 0 1 8.23-4.4 60.46 60.46 0 0 0-.49-6.35m-15.48 0a50.64 50.64 0 0 0-2.66-.86A59.9 59.9 0 0 1 12 3.49a59.9 59.9 0 0 1 10.4 5.8c-.9.27-1.79.56-2.66.86m-15.48 0A50.7 50.7 0 0 1 12 13.49a50.7 50.7 0 0 1 7.74-3.34M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.68A55.38 55.38 0 0 1 12 8.44m-7.01 11.06A5.97 5.97 0 0 0 6.75 15.75v-1.5"
    />
  </svg>
);
