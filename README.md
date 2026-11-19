# PROJECT SMART-ANHS — Frontend Prototype

A responsive HTML, CSS, and JavaScript interface prototype for the proposed
AI-powered school management system of Alcantara National High School.

## Included
- Dashboard overview and school indicator cards
- Seven SMART module navigation pages
- Sample records, search, and status filtering
- Add-record modal (session-only; not persisted)
- Reports and settings preview pages
- SMART Assistant interface preview
- Responsive layout for desktop, tablet, and mobile

## Run locally
1. Extract the ZIP file.
2. Open `index.html` in a modern browser.
3. No build tools are required.

You can also use Visual Studio Code with the Live Server extension.

## GitHub Pages deployment
1. Create a GitHub repository, for example `project-smart-anhs`.
2. Upload `index.html`, `style.css`, `script.js`, and this README.
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**.
5. Choose the `main` branch and `/ (root)`, then Save.
6. Wait for GitHub Pages to publish the site.

## Important limitations
This is a frontend demonstration only. It uses fictional sample figures and records.
It does NOT include a real database, user login, role-based access control, AI service,
secure file storage, audit logs, or persistent record management. Records added in
the module page exist only in the current browser session and are not saved.

Do not enter actual learner names, grades, attendance, personnel information,
financial information, or other confidential school data.

Before real school use, connect a properly configured backend (for example,
Supabase), implement authentication and database-level Row Level Security (RLS),
validate permissions for every role, add audit logging and backups, and complete
the school's privacy and security review. Never put service-role keys or AI API
keys in frontend JavaScript or a public GitHub repository.

## Suggested next development steps
1. Supabase authentication and role/permission model
2. School-year, grade-level, section, learner, and personnel data model
3. Secure CRUD workflows for each SMART module
4. Document upload and report generation
5. Server-side AI integration with access controls and human review

## Version 0.2.0 changes
- Every proposal feature now appears in each module's "Module scope" list, marked Preview or Planned.
- SMART Learner: at-risk learner list with explainable flags and a human-reviewed intervention workflow (fictional codes, session only).
- SMART Project / Resource: budget utilization tracker and canteen / feeding summary (view and report only; not official accounting records).
- SMART Decision: sample insights that wait for an official to accept or return them.
- AI advisory-only notice added to the dashboard, assistant panel, and relevant modules.
- Fixed the project counts so the dashboard and Smart Project agree (12 total: 5 completed, 4 ongoing, 3 planned).

- Added the Alcantara National High School logo (`logo.png`) to the sidebar and as the browser tab icon (`favicon.png`). Upload both files with the rest when deploying.
- Retheme to match the school logo (navy, gold, red, laurel green); fixed spacing of the added panels.

## Version 0.3.0
- Portal-style layout: government bar, school header with logo, and a navy top navigation bar. SMART modules sit in the top nav with dropdown menus (Home, seven SMART modules, System). The sidebar was removed.
- Portal Login and Search Portal are placeholders; no sign-in exists yet.

## Version 0.4.0
- Added a portal-style footer: school identity and contact details, SMART module links, system links, and a Faculty & Admin Portal card (placeholder).

## Version 0.5.0: admin editing
- Portal Login now opens an admin sign-in. The first time, the admin creates a passcode (stored as a hash in this browser).
- In admin mode every list is editable: records, module details, summary tiles, module features, at-risk learners, budget lines, canteen tiles, and insights. Any plain text on the dashboard, reports, settings, header, and footer can be edited by clicking it.
- Edits are saved in this browser only (localStorage). Use Export data / Import data to back up or move them.
- This is not real security. Anyone with access to the browser could clear the passcode. Multi-user editing and proper access control need the Supabase backend with authentication and row-level security.
