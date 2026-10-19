# FlowSpace

Flowspace is a personal productivity dashboard for keeping everyday plans organized. encouraging, and colorful

. Live Demo: https://omoakin1-devburn.github.io/FlowSpace/
. Repository: https://github.com/OMOAKIN1-devburn/FlowSpace



## Features

- Personalized daily greeting, date, and live task/focus summaries.
- Task board with create, edit, delete, completion, status moves, search, category and priority filters, sorting, and due dates.
- Focus amd short-break timer with start, pause, resume, reset, and focus-minute tracking.
- Adjustable daily completion goal and seven-day focus activity chart.
- Electric Bloom, Ocean Breeze, and Sunset Glow theme presets.
- Tasks, theme, goal, and focus activity persist in browser local storage.
- Responsive desktop, tablet, and mobile layouts; keyboard-accessible task dialog and reduced-motion support.

## Technologies

Plain HTML5, CSS3, and vanilla JavaScript. Font Awesome icons load from Font Awesome's CDN; DM Sans and Manrope load from Google Fonts. No framework, backend, is used.

## Run locally

1. Install Node.js
2. From this folder, run `npm instal`.
3. Run `npm run dev`, then open the local URL printed in your terminal.
4. Run `npm run build` to create a production build in `dist/public`.

The dashboard uses browser `localStorage`; no database or backend setup is needed. An internet connection and offline version is used for Font Awesome and Google Fonts.

## Testing checklist

- [ ] Open the dashboard at `/` and check the desktop, tablet, and phone layouts.
- [ ] Add a task with each priority, category, status, and due date; confirm invalid names are rejected.
- [ ] Edit a task, move it between columns, complete and reopen it, and confirm deletion requires confirmation.
- [ ] Search tasks and combine category/priority filter; change sort order.
- [ ] Start, pause, resume, change mode, and rest the timer, temporarily set a short timer duration in browser storage.
- [ ] Adjust the daily goal and inspect stats, progress, and the seven-day chart.
- [ ] Change each theme and reload the page; verify theme, tasks, goal, and activity remain saved.
- [ ] Use keyboard navigation and check the interface with reduced-motion enabled.
