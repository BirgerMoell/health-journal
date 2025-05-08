export default {
  expo: {
    // ... your existing app.json configuration
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "bf4ffcfa-b1d8-400d-88a1-61020613fcf2"
      }
    }
  }
}; 