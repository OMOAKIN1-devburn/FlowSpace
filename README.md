# FlowSpace

Flowspace is a personal productivity dashboard designed to help you organise tasks, stay focused, and keep track of your daily progress. It brings task management, focus and break timers, reminders, and progress tracking together in one place, with a colourful interface you can personalise to suit your preferences.

. Live Demo: https://omoakin1-devburn.github.io/FlowSpace/

. Repository: https://github.com/OMOAKIN1-devburn/FlowSpace

## Features

- **Task management**: Create, edit, delete, and complete tasks, move them between To Do, In Progress, and Completed, and organise them using categories, priorities, due dates, search, filters, and sorting.
- **Bulk deletion**: This solves a real inconvenience when someone has accumulated many tasks. Make sure selection stays within the relevant task section, and provide a confirmation before deleting.
- **Custom focus and break durations**: Let users choose their own session lengths rather than forcing a fixed productivity method on everyone.
- **Reliable reminders and timer alerts**: Check that alerts fire at the right time and that pause, resume, reset, and page reloads behave sensibly.
- **Adjustable text size**: Scale the interface text from 70% to 200%, with a reset option to return to 100%.
- **Daily goals and progress**: Set a daily completion goal and view task statistics, progress, and a seven-day focus activity chart.
- **Personalised appearance**: Switch between Electric Bloom, Ocean Breeze, and SunSet Glow themes, and adjust the text size to suit your preferences.
- **Saved preferences and activity**: Tasks, themes, goals, and focus activity persist in browser local storage.
- **Responsive and accessible interface**: Layouts for desktop, tablet, and mobile, with keyboard-accessible task dialogs and reduced-motion support.

## Technologies

. HTML5 for the application structure.

. CSS3 for the layout, responsive design, themes, and interface styling.

. Vanilla JavaScript for task management, timers, reminders, text-scaling, progress tackling, and user interactions.

.Browser local storage for saving tasks, preferences, goals, and focus activity.

Font Awesome provides the icons, while DM Sans and Manrope provide the typography.

FlowSpace runs without backend or database. An internet connection is needed for the externally loaded fonts and icons unless local versions are configured.

## Run locally

1. Install Node.js
2. From this folder, run `npm instal`.
3. Run `npm run dev`, then open the local URL printed in your terminal.
4. Run `npm run build` to create a production build in `dist/public`.

The dashboard uses browser `localStorage`; no database or backend setup is needed. An internet connection and offline version is used for Font Awesome and Google Fonts.

## Testing checklist

- [ ] Check the dashboard layout on desktop, tablet, and mobile screen sizes.
- [ ] Create, edit, complete, reopen, and delete tasks.
- [ ] Move tasks between To Do, in Progress, and Completed.
- [ ] Test task search, category and priority filters, sorting, and due dates.
- [ ] Select multiple tasks within each section and verify that bulk deletion removes only the selected tasks.
- [ ] Start, pause, resume, and reset the focus and break timers using different custom durations.
- [ ] Verify that timer alerts play when sessions end.
- [ ] Set tasks reminders for different times and confirm that alerts trigger at the expected time.
- [ ] Change text size across the available range and verify that the reset control returns it to 100%.
- [ ] Adjust the daily goal and check the statistics, progress indicator, an seven-day activity chart.
- [ ] Change themes and reload the page to confirm that saved preferences remain intact.
- [ ] Reload the dashboard and verify that tasks, goals, and activity data persist.
- [ ] Check keyboard navigation, task-dialog interactions, and reduced-motion behaviour.
