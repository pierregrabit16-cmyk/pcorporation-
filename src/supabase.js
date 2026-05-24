import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lbhhzunpbehwaqpyctap.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiaGh6dW5wYmVod2FxcHljdGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjk3OTUsImV4cCI6MjA5NDk0NTc5NX0.m9K_rFsOCTcIng-GBS2XyVTsqPW4WG7brJu-ZERIK3Q'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
