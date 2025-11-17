# Anything - Spatial AI Workspace

A beautiful, spatial canvas for organizing AI conversations. Think different. Create different. Be different.

![Anything Preview](https://via.placeholder.com/1200x600/7C3AED/FFFFFF?text=Anything+-+Spatial+AI+Workspace)

## Features

### Core Functionality
- **Infinite Canvas**: Drag, zoom, and organize your AI conversations in 2D space
- **Smart Nodes**: Each conversation lives in a draggable, colored node
- **AI Integration**: Powered by OpenAI for intelligent conversations
- **Topic Connections**: Automatically links related conversations based on semantic similarity
- **Credit System**: Built-in usage tracking and credit management
- **Auto-save**: Never lose your work with automatic state persistence
- **Real-time Updates**: Instant UI updates with optimistic rendering

### Design
- Clean, minimal interface inspired by modern design systems
- Smooth animations with Framer Motion
- Responsive layout that works on desktop and mobile
- Beautiful color palette with purple accents
- Customizable node colors (green, yellow, blue)

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Canvas**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **AI**: [OpenAI API](https://openai.com/)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account ([sign up free](https://supabase.com))
- OpenAI API key ([get one](https://platform.openai.com/api-keys))

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
```

Then fill in your keys in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `OPENAI_API_KEY`: Your OpenAI API key

3. **Set up Supabase database**:

Run the migration file in your Supabase SQL editor:
```bash
# Copy the contents of supabase/migrations/001_initial_schema.sql
# and execute it in your Supabase project's SQL Editor
```

Or use the Supabase CLI:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

4. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
anything/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── canvas/            # Canvas workspace
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── canvas/            # Canvas components
│   │   ├── modals/            # Modal dialogs
│   │   └── LandingPage.tsx    # Landing page component
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   └── utils/             # Utility functions
│   ├── store/                 # Zustand state management
│   ├── types/                 # TypeScript definitions
│   └── hooks/                 # Custom React hooks
├── supabase/
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

## Usage Guide

### Creating Your First Conversation

1. Enter a prompt on the landing page
2. Click "Start" to create your first conversation node
3. The AI will respond, and your conversation appears on the canvas

### Working with Nodes

- **Drag**: Click and drag nodes to organize them
- **Click empty space**: Create a new conversation node
- **Type in node**: Add messages to existing conversations
- **Delete**: Hover over a node and click the X button

### Canvas Navigation

- **Pan**: Click and drag the canvas background
- **Zoom**: Use mouse wheel or trackpad pinch
- **Fit View**: Click the fit view button in controls

### Smart Connections

Nodes are automatically connected when they discuss similar topics. Connections show:
- Visual link between related conversations
- Similarity strength (opacity)
- Reason for connection (on hover)

## Database Schema

The application uses the following main tables:

- `profiles`: User information and credits
- `canvases`: Workspace metadata
- `nodes`: Conversation nodes with positions
- `messages`: Individual chat messages
- `node_connections`: Topic relationships
- `credit_transactions`: Usage tracking

See [supabase/migrations/001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql) for full schema.

## Development Roadmap

### Phase 1: MVP (Current)
- ✅ Landing page
- ✅ Canvas with draggable nodes
- ✅ OpenAI integration
- ✅ Basic modals
- ✅ State management
- ✅ Database schema

### Phase 2: Core Features
- ⬜ Full AI conversation implementation
- ⬜ Auto-save to Supabase
- ⬜ User authentication flows
- ⬜ Credit purchase system
- ⬜ Message history persistence

### Phase 3: Smart Features
- ⬜ Topic embeddings generation
- ⬜ Automatic node connections
- ⬜ Similarity scoring
- ⬜ Connection visualization

### Phase 4: Advanced Features
- ⬜ Media embedding (images, links)
- ⬜ Canvas export (image/PDF)
- ⬜ Search across conversations
- ⬜ Keyboard shortcuts
- ⬜ Node templates
- ⬜ Collaboration features

### Phase 5: Polish
- ⬜ Mobile optimization
- ⬜ Performance improvements
- ⬜ Accessibility enhancements
- ⬜ Comprehensive testing
- ⬜ Documentation

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key
OPENAI_ORG_ID=your_org_id (optional)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Cloudflare Pages

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Troubleshooting

### "Invalid API key" error
- Verify your OpenAI API key in `.env.local`
- Ensure you have credits in your OpenAI account

### Database connection issues
- Check Supabase URL and keys
- Verify your Supabase project is active
- Ensure migrations have been run

### Canvas not rendering
- Check browser console for errors
- Clear browser cache
- Verify all dependencies are installed

For more help, see [SETUP.md](./SETUP.md)

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Design inspired by modern spatial thinking tools
- Built with amazing open-source technologies
- Special thanks to the Next.js, Supabase, and React Flow teams

---

**Built with ❤️ using Next.js and Supabase**
