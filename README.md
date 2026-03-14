# Cocktail Calculator for Vercel

This is a Vercel-ready Next.js rewrite of the uploaded n8n workflow.

## What it does

- Renders a cocktail batch input form at `/`
- Accepts batch sizes in milliliters
- Calculates ingredient totals from the 750 ml base recipes
- Groups ingredients by category
- Lets the user download results as CSV or PDF
- Exposes a POST API at `/api/cocktailbatches`

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

### Option 1: GitHub import

1. Create a new GitHub repository.
2. Copy these files into the repo.
3. Push to GitHub.
4. In Vercel, click **Add New Project**.
5. Import the GitHub repository.
6. Deploy.

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel
```

## API example

### JSON

```bash
curl -X POST http://localhost:3000/api/cocktailbatches \
  -H "Content-Type: application/json" \
  -d '{
    "Negroni": 1500,
    "Boulevardier": 750,
    "Espresso Martini": 375
  }'
```

### Form submission

```bash
curl -X POST http://localhost:3000/api/cocktailbatches \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Negroni=1500&Boulevardier=750"
```

## Notes

- No environment variables are required.
- The original n8n workflow had two webhook endpoints: one for the form and one for processing. In this version, the form is the homepage and the processing endpoint is the API route.
- The original PDF output in n8n was a base64 text placeholder rather than a real PDF generator. This version generates a real downloadable PDF in the browser.
