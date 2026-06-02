import { useState } from 'react';
import { supabase } from '../supabase';

function LoadingPokeball() {
  return (
    <div className="absolute inset-0 z-[50] flex items-center justify-center bg-[#1a1a2e]/60 backdrop-blur-sm rounded-3xl">
      <div className="relative w-20 h-20 animate-pokeball-pulse">
        <div className="w-full h-full rounded-full border-4 border-black overflow-hidden relative bg-white animate-spin-slow">
          <div className="absolute top-0 w-full h-1/2 bg-[#e94560]"></div>
          <div className="absolute bottom-0 w-full h-1/2 bg-white"></div>
          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-black -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white border-2 border-black rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gray-200 border border-black rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = () => {
    setIsToggling(true);
    setTimeout(() => {
      setIsRegistering(!isRegistering);
      setError('');
      setIsToggling(false);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (data?.user?.identities?.length === 0) {
          setError('Este correo ya está registrado.');
        } else {
          alert('¡Registro exitoso! Ya puedes iniciar sesión.');
          handleToggle();
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data?.user) {
          onLogin(data.user);
        }
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fadeIn relative">
      <div className="w-full max-w-md bg-[#16213e] rounded-3xl p-8 shadow-2xl border border-blue-900/50 relative overflow-hidden">
        {isToggling && <LoadingPokeball />}
        
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
            <label className="block text-[10px] font-black text-blue-300/50 uppercase tracking-[0.2em] mb-2 ml-1">E-mail de contacto</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-2xl py-3.5 px-5 text-white focus:border-yellow-400 focus:outline-none transition-all placeholder-blue-900/50"
              placeholder="entrenador@pokedex.com"
              disabled={loading || isToggling}
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
              disabled={loading || isToggling}
            />
          </div>

          <button
            type="submit"
            disabled={loading || isToggling}
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
            onClick={handleToggle}
            disabled={loading || isToggling}
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