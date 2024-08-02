import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://yrfhdrzpweryzagjtjbo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZmhkcnpwd2VyeXphZ2p0amJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0NDEyNzksImV4cCI6MjAzODAxNzI3OX0.wjJiUY6qitGHiR4A6-1YB4IYPJlgCE0go8TPrrfcIGI";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
