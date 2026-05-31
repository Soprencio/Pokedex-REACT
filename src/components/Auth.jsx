import { useState } from 'react';

function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Simulamos persistencia local para el registro
    const users = JSON.parse(localStorage.getItem('pokedex_users') || '[]');

    if (isRegistering) {
      if (users.find(u => u.email === email)) {
        setError('Este correo ya está registrado.');
        return;
      }
      users.push({ email, password });
      localStorage.setItem('pokedex_users', JSON.stringify(users));
      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      setIsRegistering(false);
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Credenciales incorrectas.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
      <div className="w-full max-w-md bg-[#16213e] rounded-3xl p-8 shadow-2xl border border-blue-900/50">
        <h2 className="text-3xl font-black text-white text-center mb-2">
          {isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}
        </h2>
        <p className="text-blue-400 text-center mb-8 text-sm font-bold tracking-widest uppercase">
          {isRegistering ? 'Únete a la aventura' : 'Bienvenido de nuevo, Entrenador'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-2xl py-3 px-4 text-white focus:border-yellow-400 focus:outline-none transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-2xl py-3 px-4 text-white focus:border-yellow-400 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#e94560] hover:bg-[#ff2e63] text-white font-black py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-sm"
          >
            {isRegistering ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-400 hover:text-yellow-400 text-sm font-bold transition-colors"
          >
            {isRegistering 
              ? '¿Ya tienes cuenta? Inicia sesión' 
              : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex gap-4 opacity-20 select-none">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-75"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-150"></div>
      </div>
    </div>
  );
}

export default Auth;