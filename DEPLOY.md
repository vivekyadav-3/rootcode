# Deploying to Vercel with Piston (Free)

We have switched to **Piston**, a 100% free code execution engine. You do NOT need a Judge0 subscription or API keys.

## 1. Deploy to Vercel

Simply import your GitHub repository into Vercel.

## 2. Environment Variables

Add ONLY the following environment variable for code execution:

| Variable Name    | Value                            |
| :--------------- | :------------------------------- |
| `PISTON_API_URL` | `https://emkc.org/api/v2/piston` |

(Plus your standard `DATABASE_URL`, `CLERK_...` keys, etc.)

No sign-up or credit card required for code execution!
