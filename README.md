# Aizhan Health Companion

Бұл жоба Supabase Edge Function арқылы OpenAI Chat Completions API-ін қолданады.

## OPENAI API KEY `.env` арқылы (local)

1. `supabase/functions/.env` файлын жасаңыз (`.env.example`-ден көшіріп алуға болады):

```bash
cp supabase/functions/.env.example supabase/functions/.env
```

2. `supabase/functions/.env` ішіне кілтті жазыңыз:

```env
OPENAI_API_KEY=your_openai_api_key
```

3. Local-та edge function іске қосу:

```bash
supabase functions serve chat --env-file supabase/functions/.env
```

## Production (Supabase бұлт)

Production-та `.env` емес, Supabase secrets қолданыңыз:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key
supabase functions deploy chat
```
