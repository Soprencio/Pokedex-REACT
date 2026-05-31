import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wlzdhebrhbuwlccbfijd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsemRoZWJyaGJ1d2xjY2JmaWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNzQ5MTYsImV4cCI6MjA5NTc1MDkxNn0.5qOHfgWaxDZAZODLXSK7CSM_XlUl8Eszmq5BtfvHXKY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)