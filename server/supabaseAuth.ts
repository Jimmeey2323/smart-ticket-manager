import { createClient } from '@supabase/supabase-js';
import type { Express, RequestHandler } from 'express';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set; Supabase auth disabled');
}

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

export async function setupAuth(app: Express) {
  // No server-side login flow is wired here. Client should authenticate with Supabase
  // and send the access token with requests (Authorization: Bearer <token>).
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  console.log('🔐 Auth middleware: checking request to', req.path);
  
  if (!supabase) {
    console.log('❌ Supabase not configured');
    return res.status(500).json({ message: 'Supabase auth not configured' });
  }

  let token: string | undefined;
  const authHeader = req.headers['authorization'] as string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
    console.log('🔑 Found Bearer token, length:', token.length);
  } else if ((req as any).cookies && (req as any).cookies['sb-access-token']) {
    token = (req as any).cookies['sb-access-token'];
    console.log('🔑 Found cookie token');
  } else if (req.headers['x-access-token']) {
    token = String(req.headers['x-access-token']);
    console.log('🔑 Found header token');
  }

  if (!token) {
    console.log('❌ No auth token found');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log('🔍 Verifying token with Supabase...');
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data || !data.user) {
      console.log('❌ Supabase auth verification failed:', error?.message);
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = data.user;
    console.log('✅ Supabase user verified:', user.email);
    
    // Skip database upsert for now since we're having connection issues
    console.log('⚠️  Skipping database upsert due to connection issues');

    // attach a simplified claim object so handlers expecting req.user.claims.sub continue to work
    (req as any).user = { 
      claims: { sub: user.id, email: user.email },
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name || user.user_metadata?.given_name,
        lastName: user.user_metadata?.last_name || user.user_metadata?.family_name,
        profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.profile_image_url
      }
    };
    console.log('✅ Auth middleware complete, proceeding to next handler');
    return next();
  } catch (err) {
    console.error('❌ Error verifying supabase token', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
