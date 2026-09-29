# Smart Patient Queue & Medicine Reminder

A fully static, front-end-only clinic workflow demo: patient registration, a
live token queue, a medicine reminder timeline, and a doctor prescription
tool. No backend, database, or server — everything runs in the browser using
`localStorage`.

## Pages

| Page                 | File               | Purpose                                             |
|----------------------|--------------------|------------------------------------------------------|
| Home                 | `index.html`       | Overview, how it works, features                     |
| Patient registration | `register.html`    | Register a patient, generates a queue token          |
| Live queue           | `queue.html`       | Current token, your position, estimated wait         |
| Medicine reminder     | `medicine.html`    | Today's medicine schedule, mark taken/missed          |
| Doctor dashboard      | `doctor.html`      | Select a patient, add/remove prescriptions           |
| Patient dashboard     | `dashboard.html`   | Combined view of queue + medicines + prescriptions   |

## Run locally

No build step or install needed. Either:

1. Open `index.html` directly in a browser, **or**
2. Serve it locally (recommended, avoids browser file:// quirks):
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```
   then visit `http://localhost:8080`.

## Data & demo mode

All data is stored in the browser's `localStorage` — nothing is sent
anywhere. Sample patients and medicines are seeded automatically the first
time you open the site. Use **Reset demo data** (in the footer) to clear
everything and reload fresh sample data at any time.

## Deploy

**GitHub Pages**
1. Push this folder to a GitHub repository.
2. Repository Settings → Pages → set the source branch/folder (e.g. `main` / `/root`).
3. Your site will be published at `https://<user>.github.io/<repo>/`.

**Netlify**
1. Drag and drop this folder onto [app.netlify.com/drop](https://app.netlify.com/drop), or
2. Connect the repository and set the publish directory to the project root (no build command needed).

**Vercel**
1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Framework preset: "Other" — no build command, output directory is the project root.

## Notes

- Queue and medicine "movement" is simulated with JavaScript and localStorage — there is no real-time server sync between browsers/devices.
- Built with plain HTML5, CSS3 and vanilla JavaScript — no frameworks or dependencies.
