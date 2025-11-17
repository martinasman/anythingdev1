# Anything - Setup Instructions

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account ([sign up](https://supabase.com))
- OpenAI API key ([get one](https://platform.openai.com/api-keys))

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the following values in `.env.local`:

#### Supabase Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the values:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep secret!)

#### OpenAI Configuration

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the value to `OPENAI_API_KEY`
4. Optionally add your org ID to `OPENAI_ORG_ID`

### 3. Set Up Supabase Database

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/001_initial_schema.sql` (will be created next)
4. Execute the SQL

#### Option B: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
anything/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   │   ├── canvas/            # Canvas-related components
│   │   ├── conversation/      # Message and chat components
│   │   ├── modals/            # Modal dialogs
│   │   ├── ui/                # Reusable UI components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/         # Supabase clients
│   │   └── utils/            # Helper functions
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # State management (Zustand)
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── supabase/                  # Supabase configuration
    └── migrations/           # Database migrations
```

## Features

- **Spatial Canvas**: Infinite canvas for organizing conversations
- **AI Conversations**: Chat with AI in separate nodes
- **Smart Connections**: Automatic topic-based linking between conversations
- **Credit System**: Track API usage with credit system
- **Auto-save**: Automatic saving of conversations and canvas state
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Canvas**: React Flow
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI API
- **State Management**: Zustand
- **Animations**: Framer Motion

## Troubleshooting

### "Invalid API key" error
- Check that your OpenAI API key is correctly set in `.env.local`
- Ensure you have credits in your OpenAI account

### "Failed to fetch" from Supabase
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is running
- Ensure Row Level Security policies are set up correctly

### Canvas not rendering
- Check browser console for errors
- Ensure all dependencies are installed: `npm install`
- Try clearing your browser cache

## Support

For issues and feature requests, please open an issue on GitHub.

## License

MIT License
