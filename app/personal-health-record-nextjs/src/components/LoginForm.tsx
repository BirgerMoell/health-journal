const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  
  try {
    console.log('Attempting login...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    console.log('Login successful:', data);
    // Login successful, AuthContext will handle the redirect
  } catch (error: any) {
    console.error('Login error:', error);
    setError(error.message || 'An error occurred during login');
  } finally {
    setIsLoading(false);
  }
}; 