import { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonList from './components/PokemonList.jsx';
import PokemonDetails from './components/PokemonDetails.jsx';
import Auth from './components/Auth.jsx';
import { supabase } from './supabase';

const generations = [
  { name: 'Todos', offset: 0, limit: 1025 },
  { name: 'Ranking', special: 'votes' },
  { name: 'Gen I', offset: 0, limit: 151 },
  { name: 'Gen II', offset: 151, limit: 100 },
  { name: 'Gen III', offset: 251, limit: 135 },
  { name: 'Gen IV', offset: 386, limit: 107 },
  { name: 'Gen V', offset: 493, limit: 156 },
  { name: 'Gen VI', offset: 649, limit: 72 },
  { name: 'Gen VII', offset: 721, limit: 88 },
  { name: 'Gen VIII', offset: 809, limit: 96 },
  { name: 'Gen IX', offset: 905, limit: 120 },
];

function App() {
  const [allPokemons, setAllPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGen, setActiveGen] = useState('Todos');
  const [searchQuery, setSearchBar] = useState('');
  const [voteCounts, setVoteCounts] = useState({});
  const [userVotes, setUserVotes] = useState([]);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);

  const fetchGlobalVotes = async () => {
    try {
      const { data, error } = await supabase.from('votes').select('pokemon_id, email');
      if (error) throw error;

      // Aggregated counts
      const counts = data.reduce((acc, vote) => {
        acc[vote.pokemon_id] = (acc[vote.pokemon_id] || 0) + 1;
        return acc;
      }, {});
      setVoteCounts(counts);
      setUserVotes(data);
    } catch (err) {
      console.error('Error fetching global votes:', err.message);
    }
  };

  useEffect(() => {
    // Check for real Supabase session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
      }
    };
    checkSession();

    // Initial votes fetch
    fetchGlobalVotes();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    const fetchAllPokemon = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const pokemonsWithId = response.data.results.map((p, index) => ({
          ...p,
          id: index + 1
        }));
        setAllPokemons(pokemonsWithId);
        setFilteredPokemons(pokemonsWithId);
      } catch (err) {
        console.error('Error fetching Pokémon list:', err.message);
        setError('Failed to load Pokémon data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPokemon();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSelectedPokemon(null);
  };

  const handleGenFilter = (gen) => {
    setActiveGen(gen.name);
    setSelectedPokemon(null);
    setSearchBar('');
    
    let filtered;
    if (gen.name === 'Todos') {
      filtered = allPokemons;
    } else if (gen.name === 'Ranking') {
      // Filter those with votes and sort by vote count
      filtered = allPokemons
        .filter(p => voteCounts[p.id] > 0)
        .sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
    } else {
      filtered = allPokemons.filter(p => p.id > gen.offset && p.id <= (gen.offset + gen.limit));
    }
    setFilteredPokemons(filtered);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchBar(query);
    setSelectedPokemon(null);

    if (query !== '' && activeGen !== 'Todos') {
      setActiveGen('Todos');
    }

    const filtered = allPokemons.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.id.toString().includes(query)
    );
    setFilteredPokemons(filtered);
  };

  const handleSelectPokemon = async (pokemonSummary) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonSummary.id}`);
      setSelectedPokemon(response.data);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedPokemon(null);
  };

  return (
    <div className="App min-h-screen bg-[#1a1a2e] font-sans text-gray-100 flex flex-col">
      <header className="bg-[#16213e] pt-4 pb-4 shadow-2xl border-b border-blue-900/50 sticky top-0 z-50">
        <div className="w-full px-4 md:px-8 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1200px]">
            <div className="md:w-1/4 flex justify-start">
              {currentUser && (
                <div className="flex flex-col items-start bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Maestro Pokémon</span>
                  <span className="text-[11px] font-bold text-white truncate max-w-[150px]">{currentUser.email}</span>
                  <button onClick={handleLogout} className="text-[9px] text-red-400 hover:text-red-300 font-black uppercase mt-1 transition-colors">Cerrar Sesión</button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <h1 className="pokemon-font text-5xl md:text-7xl tracking-[0.15em] drop-shadow-[0_6px_0_rgba(60,90,166,1)] leading-tight">
                Pokedex
              </h1>
              <p className="text-yellow-400 font-black text-lg md:text-2xl tracking-[0.2em] uppercase mt-2">
                ¡Elige Tu favorito!
              </p>
            </div>

            <div className="w-full md:w-1/4 flex justify-center md:justify-end">
              {currentUser && (
                <div className="relative w-full max-w-[300px]">
                  <input
                    type="text"
                    placeholder="Buscar Pokémon..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-full py-2.5 px-6 pl-12 text-sm font-bold text-white focus:border-yellow-400 focus:outline-none transition-all"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {currentUser && (
            <nav className="w-full max-w-[1200px] overflow-x-auto py-2 custom-scrollbar">
              <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-4">
                {generations.map((gen) => (
                  <button
                    key={gen.name}
                    onClick={() => handleGenFilter(gen)}
                    className={`px-5 py-2 rounded-full font-bold text-xs transition-all duration-300 border-2 whitespace-nowrap ${
                      activeGen === gen.name
                        ? 'bg-yellow-400 text-blue-900 border-yellow-500 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                        : 'bg-[#1a1a2e] text-blue-300 border-blue-900/50 hover:border-blue-500 hover:text-white'
                    }`}
                  >
                    {gen.name}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="w-full px-4 md:px-10 py-8 md:py-12 flex-grow">
        {!currentUser ? (
          <Auth onLogin={handleLogin} />
        ) : (
          <>
            {loading && !selectedPokemon && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
                <p className="mt-6 text-xl font-black text-yellow-100 uppercase tracking-widest animate-pulse">Iniciando Escaneo...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-red-400 text-lg mb-6 font-medium">{error}</p>
                <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg">Retry</button>
              </div>
            )}

            {!error && (
              <div className="w-full">
                {selectedPokemon ? (
                  <div className="animate-fadeIn max-w-4xl mx-auto">
                    <PokemonDetails pokemon={selectedPokemon} onBack={handleBack} />
                  </div>
                ) : (
                  !loading && (
                    <div className="animate-fadeIn w-full">
                      <div className="mb-6 text-blue-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        Mostrando {filteredPokemons?.length || 0} Pokémon de {activeGen}
                      </div>
                      <PokemonList 
                        pokemons={filteredPokemons} 
                        onSelect={handleSelectPokemon} 
                        currentUser={currentUser} 
                        voteCounts={voteCounts}
                        userVotes={userVotes}
                        onVoteUpdate={fetchGlobalVotes}
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-[#0f3460] text-gray-500 py-6 text-center border-t border-blue-900/30 mt-auto">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">© 2026 PokéApp Global Database</p>
      </footer>
    </div>
  );
}

export default App;