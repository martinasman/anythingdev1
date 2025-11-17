# Quick Start Checklist

## ✅ Completed
- [x] Project initialized
- [x] Dependencies installed
- [x] OpenAI API key configured
- [x] Anthropic API key available (for future use)

## 📋 Next Steps

### 1. Configure Supabase (5 minutes)

#### Get Credentials
1. Visit [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Navigate to **Settings** → **API**
4. Copy these values:
   - **Project URL**
   - **anon public key**

#### Update .env.local
Edit `c:\Users\marti\Desktop\anything\anything\.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Set Up Database (2 minutes)

#### Option A: Supabase Dashboard (Recommended)
1. Go to your Supabase project
2. Click **SQL Editor** in sidebar
3. Click **New Query**
4. Copy entire contents of: `supabase/migrations/001_initial_schema.sql`
5. Paste and click **Run**
6. Wait for "Success" message

#### Option B: Supabase CLI
```bash
# Install CLI
npm install -g supabase

# Link project (get ref from Settings → General)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Start Development Server (30 seconds)

```bash
cd c:\Users\marti\Desktop\anything\anything
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### 4. Test Features

#### Landing Page Test
- [x] Open http://localhost:3000
- [ ] Type a prompt in input field
- [ ] Click "Start" button
- [ ] Should navigate to `/canvas`

#### Canvas Test
- [ ] See first conversation node appear
- [ ] Drag node around canvas
- [ ] Zoom in/out with mouse wheel
- [ ] Pan canvas by dragging background
- [ ] Click empty space to create new node

#### AI Conversation Test
- [ ] Type message in node input field
- [ ] Press Enter
- [ ] See AI response stream in
- [ ] Check credits decrease in profile

## 🔑 API Keys Reference

### OpenAI (Configured ✅)
- **Key**: `sk-proj-RYTb...`
- **Status**: Active
- **Usage**: AI conversations

### Anthropic (Available)
- **Key**: `sk-ant-api03-G05z...`
- **Status**: Not used yet
- **Future**: Alternative AI provider

### Supabase (Needs Setup)
- **Service Role**: `sb_secret_g1in...`
- **URL**: Pending
- **Anon Key**: Pending

## 🐛 Common Issues

### "Invalid Supabase credentials"
- Check URL starts with `https://` and ends with `.supabase.co`
- Verify anon key is the **public anon key**, not service role
- Restart dev server after changing .env.local

### "OpenAI API Error"
- Verify API key has credits: https://platform.openai.com/usage
- Check key starts with `sk-proj-`
- Ensure no extra spaces in .env.local

### Port 3000 in use
- App will auto-use port 3001
- Check output: `Local: http://localhost:3001`

### Canvas not rendering
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Clear cache and retry

## 🎯 What to Expect

### After Full Setup:
1. **Landing page** with beautiful UI
2. **Canvas** with infinite zoom/pan
3. **AI conversations** in draggable nodes
4. **Auto-save** to database
5. **Credit tracking** for API usage
6. **Smooth animations** throughout

### Current Limitations:
- No user registration yet (coming in Phase 2)
- Manual credit top-up needed
- Basic node connections (smart linking coming soon)

## 📚 Additional Resources

- **Full Setup Guide**: [SETUP.md](./SETUP.md)
- **Project Overview**: [README.md](./README.md)
- **Build Summary**: [SUMMARY.md](./SUMMARY.md)
- **Database Schema**: [supabase/migrations/001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql)

## 🚀 Ready to Build?

Once Supabase is configured, you can start building:

1. **Add authentication pages** (`/login`, `/signup`)
2. **Connect chat input** to OpenAI API
3. **Implement auto-save** for canvas state
4. **Add embeddings** for smart connections
5. **Build credit purchase** flow

## ❓ Need Help?

- Check browser console for errors
- Review [SETUP.md](./SETUP.md) troubleshooting
- Verify all environment variables
- Ensure database migrations ran successfully

---

**Estimated time to working app**: 7 minutes ⏱️

**Current status**: OpenAI configured, Supabase pending
