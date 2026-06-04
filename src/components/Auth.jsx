import { useState } from 'react';
import { supabase } from '../supabase';

function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        // REGISTRO
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // Forzamos el cierre de sesión tras el registro para obligar a verificar mail
        await supabase.auth.signOut();

        alert('¡Registro exitoso! Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.');
        
        setIsRegistering(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        // LOGIN
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
            setError('Tu correo aún no ha sido verificado. Revisa tu bandeja de entrada.');
          } else if (signInError.message.includes('Invalid login credentials')) {
            setError('Credenciales incorrectas.');
          } else {
            throw signInError;
          }
        } else if (data?.user) {
          onLogin(data.user);
        }
      }
    } catch (err) {
      console.error('AUTH ERROR:', err);
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fadeIn relative">
      <div className="w-full max-w-md bg-[#16213e] rounded-3xl p-8 shadow-2xl border border-blue-900/50">
        <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-tighter">
          {isRegistering ? 'Unirse al Hall' : 'Panel de Acceso'}
        </h2>
        <p className="text-blue-400 text-center mb-8 text-[10px] font-black tracking-[0.3em] uppercase opacity-70">
          {isRegistering ? 'Crea tu perfil de entrenador' : 'Bienvenido, Maestro Pokémon'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-2xl text-xs font-bold text-center animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-blue-300/50 uppercase tracking-[0.2em] mb-2 ml-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-2xl py-3.5 px-5 text-white focus:border-yellow-400 focus:outline-none transition-all placeholder-blue-900/50"
              placeholder="entrenador@pokedex.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-blue-300/50 uppercase tracking-[0.2em] mb-2 ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-2xl py-3.5 px-5 text-white focus:border-yellow-400 focus:outline-none transition-all placeholder-blue-900/50"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-[10px] font-black text-blue-300/50 uppercase tracking-[0.2em] mb-2 ml-1">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-2xl py-3.5 px-5 text-white focus:border-yellow-400 focus:outline-none transition-all placeholder-blue-900/50"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e94560] hover:bg-[#ff2e63] disabled:bg-gray-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            ) : (
              isRegistering ? 'Comenzar Aventura' : 'Entrar'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            disabled={loading}
            className="text-blue-400 hover:text-yellow-400 text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            {isRegistering 
              ? '¿Ya tienes cuenta? Login' 
              : '¿Nuevo entrenador? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;