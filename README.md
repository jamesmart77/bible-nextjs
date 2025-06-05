This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Live application
🔗 <b>[Visit JustScripture](https://justscripture.app)</b>

## Getting Started
Node v22+

First, run the development server:

```bash
npm i
npm run dev
```

Open [https://localhost:3000](http://localhost:3000) with your browser to see the result.

### DB
Supabase postgres database. Setup is under...

`/supabase`

To add new migrations for db schema updates, run...

`npx supabase migration new init`

Supabase recommends keeping the timestamp prefix to ensure the order of the migrations is always correct.


