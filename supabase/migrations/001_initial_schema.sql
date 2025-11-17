-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 100,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create canvases table
CREATE TABLE canvases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  viewport_x FLOAT DEFAULT 0,
  viewport_y FLOAT DEFAULT 0,
  viewport_zoom FLOAT DEFAULT 1,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nodes table
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID REFERENCES canvases(id) ON DELETE CASCADE NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width INTEGER DEFAULT 400,
  height INTEGER DEFAULT 600,
  topic_title TEXT,
  topic_summary TEXT,
  embedding vector(1536), -- OpenAI embedding dimension
  is_expanded BOOLEAN DEFAULT TRUE,
  z_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create node_connections table
CREATE TABLE node_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id UUID REFERENCES nodes(id) ON DELETE CASCADE NOT NULL,
  similarity_score FLOAT,
  connection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_node_id, target_node_id)
);

-- Create credit_transactions table
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  description TEXT,
  message_id UUID REFERENCES messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_nodes_canvas_id ON nodes(canvas_id);
CREATE INDEX idx_messages_node_id ON messages(node_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_connections_source ON node_connections(source_node_id);
CREATE INDEX idx_connections_target ON node_connections(target_node_id);
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_canvases_user_id ON canvases(user_id);

-- Create vector index for similarity search
CREATE INDEX idx_nodes_embedding ON nodes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for canvases
CREATE POLICY "Users can view own canvases"
  ON canvases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own canvases"
  ON canvases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own canvases"
  ON canvases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canvases"
  ON canvases FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for nodes
CREATE POLICY "Users can view nodes from own canvases"
  ON nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM canvases
      WHERE canvases.id = nodes.canvas_id
      AND canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create nodes in own canvases"
  ON nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvases
      WHERE canvases.id = nodes.canvas_id
      AND canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update nodes in own canvases"
  ON nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM canvases
      WHERE canvases.id = nodes.canvas_id
      AND canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete nodes in own canvases"
  ON nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM canvases
      WHERE canvases.id = nodes.canvas_id
      AND canvases.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages from own nodes"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nodes
      JOIN canvases ON canvases.id = nodes.canvas_id
      WHERE nodes.id = messages.node_id
      AND canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own nodes"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nodes
      JOIN canvases ON canvases.id = nodes.canvas_id
      WHERE nodes.id = messages.node_id
      AND canvases.user_id = auth.uid()
    )
  );

-- RLS Policies for node_connections
CREATE POLICY "Users can view connections from own nodes"
  ON node_connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM nodes
      JOIN canvases ON canvases.id = nodes.canvas_id
      WHERE (nodes.id = node_connections.source_node_id OR nodes.id = node_connections.target_node_id)
      AND canvases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create connections between own nodes"
  ON node_connections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM nodes AS source
      JOIN canvases ON canvases.id = source.canvas_id
      WHERE source.id = node_connections.source_node_id
      AND canvases.user_id = auth.uid()
    )
  );

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view own credit transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own credit transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_canvases
  BEFORE UPDATE ON canvases
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_nodes
  BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_message_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM profiles
  WHERE id = p_user_id;

  -- Check if user has enough credits
  IF current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE profiles
  SET credits = credits - p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description, message_id)
  VALUES (p_user_id, p_amount, 'debit', p_description, p_message_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Add credits
  UPDATE profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'credit', p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
