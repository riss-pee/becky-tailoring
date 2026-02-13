
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xytnvazocxmhnwunnaae.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dG52YXpvY3htaG53dW5uYWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTQxMzAsImV4cCI6MjA4NjU3MDEzMH0.lCzP8mJLyjBmm3Re1Sxd9V_Ab357bmLs2YnXAQVCSy8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
