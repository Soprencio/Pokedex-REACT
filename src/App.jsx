import { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonList from './components/PokemonList.jsx';
import PokemonDetails from './components/PokemonDetails.jsx';
import Auth from './components/Auth.jsx';
import { supabase } from './supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt, faSearch } from '@fortawesome/free-solid-svg-icons';

const generations = [
  { name: 'Todos', style: 'bg-[#f1f5f9] text-gray-700 border-gray-300' },
  { name: 'Ranking', special: 'votes', style: 'bg-[#ffcc00] text-[#4a3701] border-[#d4af37]' },
  { name: 'Gen I', offset: 0, limit: 151, style: 'bg-[linear-gradient(to_right,#ff0000_0%,#ff0000_50%,#0000ff_50%,#0000ff_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen II', offset: 151, limit: 100, style: 'bg-[linear-gradient(to_right,#ffd700_0%,#ffd700_50%,#c0c0c0_50%,#c0c0c0_100%)] bg-no-repeat text-[#1a1a2e] border-black/10' },
  { name: 'Gen III', offset: 251, limit: 135, style: 'bg-[linear-gradient(to_right,#a50f21_0%,#a50f21_50%,#00008b_50%,#00008b_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen IV', offset: 386, limit: 107, style: 'bg-[linear-gradient(to_right,#7b96b8_0%,#7b96b8_50%,#ffc0cb_50%,#ffc0cb_100%)] bg-no-repeat text-[#1a1a2e] border-black/5' },
  { name: 'Gen V', offset: 493, limit: 156, style: 'bg-[linear-gradient(to_right,#ffffff_0%,#ffffff_50%,#000000_50%,#000000_100%)] bg-no-repeat text-[#666666] border-gray-400 font-bold' },
  { name: 'Gen VI', offset: 649, limit: 72, style: 'bg-[linear-gradient(to_right,#025da6_0%,#025da6_50%,#ea1a15_50%,#ea1a15_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen VII', offset: 721, limit: 88, style: 'bg-[linear-gradient(to_right,#f1912b_0%,#f1912b_50%,#9151b8_50%,#9151b8_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen VIII', offset: 809, limit: 96, style: 'bg-[linear-gradient(to_right,#00a1e9_0%,#00a1e9_50%,#e5005a_50%,#e5005a_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen IX', offset: 905, limit: 120, style: 'bg-[linear-gradient(to_right,#ff1c1c_0%,#ff1c1c_50%,#65219e_50%,#65219e_100%)] bg-no-repeat text-white border-white/10' },
];

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
  ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
  psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

const ITEMS_PER_PAGE = 100;

function LoadingPokeball() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1a2e]/90 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-24 h-24 animate-pokeball-pulse text-center">
        <div className="w-full h-full rounded-full border-4 border-gray-900 overflow-hidden relative shadow-2xl bg-white animate-spin-slow mx-auto">
          <div className="absolute top-0 w-full h-1/2 bg-red-600"></div>
          <div className="absolute bottom-0 w-full h-1/2 bg-white"></div>
          <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-900 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white border-4 border-gray-900 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
             <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
          </div>
        </div>
        <p className="mt-4 text-[10px] font-black text-yellow-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando...</p>
      </div>
    </div>
  );
}

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-3 py-2">
    <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#16213e] border border-blue-900/50 text-yellow-400 disabled:opacity-10 transition-all shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
    </button>
    <div className="bg-[#1a1a2e] px-4 py-1.5 rounded-lg border border-blue-900/30">
      <span className="text-[10px] font-black text-white">{currentPage} <span className="opacity-20 mx-0.5">/</span> {totalPages || 1}</span>
    </div>
    <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#16213e] border border-blue-900/50 text-yellow-400 disabled:opacity-10 transition-all shadow-md">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
    </button>
  </div>
);

function App() {
  const [allPokemons, setAllPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [pagedDetails, setPagedDetails] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState(null);
  const [activeGen, setActiveGen] = useState('Todos');
  const [searchQuery, setSearchBar] = useState('');
  const [voteCounts, setVoteCounts] = useState({});
  const [userVotes, setUserVotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [typeError, setTypeError] = useState('');
  const [pokemonTypeMap, setPokemonTypeMap] = useState({});

  const fetchGlobalVotes = async () => {
    try {
      const { data, error: vError } = await supabase.from('votes').select('pokemon_id, email');
      if (vError) throw vError;
      const counts = (data || []).reduce((acc, vote) => {
        acc[vote.pokemon_id] = (acc[vote.pokemon_id] || 0) + 1;
        return acc;
      }, {});
      setVoteCounts(counts);
      setUserVotes(data || []);
    } catch (err) {
      console.error('Error votes:', err.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setCurrentUser(session.user);
      fetchGlobalVotes();
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsTransitioning(true);
        setTimeout(() => { setCurrentUser(session?.user); setIsTransitioning(false); }, 1200);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else {
        setCurrentUser(session?.user ?? null);
      }
    });

    const loadInitialData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const list = res.data.results.map((p, i) => ({ ...p, id: i + 1 }));
        setAllPokemons(list);
        setFilteredPokemons(list);

        const typeMap = {};
        for (const type of Object.keys(typeColors)) {
          try {
            const tRes = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
            tRes.data.pokemon.forEach(p => {
              const urlParts = p.pokemon.url.split('/').filter(Boolean);
              const id = parseInt(urlParts[urlParts.length - 1]);
              if (id <= 1025) {
                if (!typeMap[id]) typeMap[id] = [];
                if (!typeMap[id].includes(type)) typeMap[id].push(type);
              }
            });
          } catch (e) { console.error(`Error loading type ${type}`); }
        }
        setPokemonTypeMap(typeMap);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!allPokemons.length) return;
    let filtered = [...allPokemons];
    if (searchQuery) filtered = filtered.filter(p => p.name.includes(searchQuery) || p.id.toString().includes(searchQuery));
    const gen = generations.find(g => g.name === activeGen);
    if (activeGen === 'Ranking') {
      filtered = filtered.filter(p => voteCounts[p.id] > 0).sort((a,b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
    } else if (activeGen !== 'Todos' && gen) {
      filtered = filtered.filter(p => p.id > gen.offset && p.id <= (gen.offset + gen.limit));
    }
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p => {
        const pTypes = pokemonTypeMap[p.id] || [];
        return selectedTypes.every(t => pTypes.includes(t));
      });
    }
    setFilteredPokemons(filtered);
    setCurrentPage(1);
  }, [searchQuery, activeGen, selectedTypes, allPokemons, voteCounts, pokemonTypeMap]);

  useEffect(() => {
    const fetchPage = async () => {
      if (!filteredPokemons.length || !currentUser) { setPagedDetails([]); return; }
      setLoading(true);
      const items = filteredPokemons.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);
      try {
        const res = await Promise.all(items.map(p => axios.get(`https://pokeapi.co/api/v2/pokemon/${p.id}`)));
        setPagedDetails(res.map(r => r.data));
      } finally { setLoading(false); }
    };
    fetchPage();
  }, [currentPage, filteredPokemons, currentUser]);

  const handleTypeToggle = (type) => {
    setTypeError('');
    setSelectedTypes(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type);
      if (prev.length >= 2) {
        setTypeError('solo puedes seleccionar 2 tipos al mismo tiempo');
        return prev;
      }
      return [...prev, type];
    });
  };

  const handleSelectPokemon = async (summary) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${summary.id}`);
      setSelectedPokemon(response.data);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredPokemons.length / ITEMS_PER_PAGE);

  return (
    <div className="App min-h-screen bg-[#1a1a2e] font-sans text-gray-100 flex flex-col overflow-x-hidden">
      {(isTransitioning || (loading && !allPokemons.length)) && <LoadingPokeball />}
      <header className="bg-[#16213e] pt-4 pb-4 shadow-2xl border-b border-blue-900/50 sticky top-0 z-50">
        <div className="w-full px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1400px] mx-auto">
          <div className="md:w-1/4 flex justify-start">
            {currentUser && (
              <div className="flex items-center gap-3 bg-blue-900/10 px-4 py-3 rounded-2xl border border-blue-500/10 backdrop-blur-sm shadow-inner group/profile">
                <FontAwesomeIcon icon={faUserCircle} className="text-3xl text-blue-400" />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Entrenador</span>
                  <span className="text-[11px] font-bold text-white truncate max-w-[120px]">{currentUser.email}</span>
                </div>
                <button onClick={async () => { await supabase.auth.signOut(); setCurrentUser(null); }} className="ml-2 w-10 h-10 flex items-center justify-center rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-500 transition-all duration-300 hover:scale-110 shadow-md"><FontAwesomeIcon icon={faSignOutAlt} /></button>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="pokemon-font text-5xl md:text-7xl tracking-[0.1em] leading-tight">Poke<span className="pokevote-v">Vote</span></h1>
            <div className="mt-2 text-xs">
              <p className="subtitle-font text-yellow-400 font-bold text-lg md:text-2xl uppercase tracking-tighter">¡Elige Tu favorito!</p>
              <p className="text-[9px] md:text-xs text-red-400 font-bold italic mt-1 bg-red-950/20 px-3 py-1 rounded-full border border-red-500/10 uppercase">"Una vez elijas, no podrás cambiar de opinión, ¡piénsalo bien!"</p>
            </div>
          </div>
          <div className="md:w-1/4"></div>
        </div>
      </header>

      <div className="flex flex-1 relative max-w-[1800px] mx-auto w-full">
        {currentUser && (
          <aside className="w-64 bg-[#16213e] border-r border-blue-900/50 p-5 flex flex-col gap-6 hidden lg:flex sticky top-[140px] h-[calc(100vh-140px)]">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchBar(e.target.value.toLowerCase())} className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-xl py-2.5 px-4 pl-10 text-sm font-bold text-white focus:border-yellow-400 focus:outline-none transition-all placeholder-blue-900/50 shadow-inner" />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400"><FontAwesomeIcon icon={faSearch} size="sm" /></div>
              </div>
              {typeError && <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-2 rounded-lg text-[9px] font-black uppercase text-center animate-bounce">{typeError}</div>}
            </div>
            <div className="flex flex-col h-full overflow-hidden">
              <h3 className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3 ml-1">Filtrar por Tipo</h3>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 custom-scrollbar">
                {Object.entries(typeColors).map(([type, color]) => (
                  <button key={type} onClick={() => handleTypeToggle(type)} className={`relative flex items-center justify-center py-2 rounded-lg border-2 transition-all duration-300 font-black text-[9px] uppercase tracking-tighter ${selectedTypes.includes(type) ? 'border-white scale-105 brightness-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100 grayscale-[0.2]'}`} style={{ backgroundColor: color, color: '#fff' }}>
                    <span className="z-10 drop-shadow-md">{type}</span>
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors pointer-events-none rounded-sm"></div>
                  </button>
                ))}
              </div>
              <button onClick={() => setSelectedTypes([])} className="mt-4 text-[9px] font-black text-blue-900 hover:text-white uppercase tracking-widest transition-colors text-center py-2 bg-blue-900/10 rounded-lg shadow-md">Limpiar</button>
            </div>
          </aside>
        )}

        <main className="flex-1 px-3 md:px-5 py-6 md:py-8 min-w-0">
          {!currentUser ? (
            <Auth onLogin={(u) => { setIsTransitioning(true); setTimeout(() => { setCurrentUser(u); setIsTransitioning(false); }, 1200); }} />
          ) : (
            <div className="w-full">
              {selectedPokemon ? (
                <div className="animate-fadeIn max-w-7xl mx-auto"><PokemonDetails pokemon={selectedPokemon} onBack={() => setSelectedPokemon(null)} /></div>
              ) : (
                <div className="animate-fadeIn w-full flex flex-col">
                  <nav className="w-full overflow-x-auto no-scrollbar scroll-smooth mb-6">
                    <div className="flex items-center justify-start md:justify-center gap-2.5 min-w-max pb-4 pt-10 px-2">
                      {generations.map((gen) => (
                        <button key={gen.name} onClick={() => { setActiveGen(gen.name); setCurrentPage(1); }} className={`relative px-5 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-300 border-2 shadow-md hover:scale-105 group ${activeGen === gen.name ? `${gen.style} border-yellow-400 scale-110 z-10` : `${gen.style} opacity-70 border-transparent hover:border-white/20`}`}>
                          {gen.name === 'Ranking' && <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png" alt="Crown" className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 drop-shadow-md animate-bounce z-[20]" />}
                          <span className="relative z-10">{gen.name}</span>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg transition-colors pointer-events-none"></div>
                        </button>
                      ))}
                    </div>
                  </nav>
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3 px-2">
                    <div className="text-blue-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 bg-blue-900/10 px-4 py-2 rounded-full border border-blue-900/30 shadow-inner">Resultados: {filteredPokemons?.length || 0}</div>
                    {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={p => { setCurrentPage(p); window.scrollTo({top:0, behavior:'smooth'}); }} />}
                  </div>
                  {(!pagedDetails.length && filteredPokemons.length > 0) ? (
                    <div className="text-center py-20 text-blue-400 uppercase font-black text-[10px] tracking-[0.5em] animate-pulse italic">Cargando base de datos...</div>
                  ) : (
                    <PokemonList pokemons={pagedDetails} onSelect={handleSelectPokemon} currentUser={currentUser} voteCounts={voteCounts} userVotes={userVotes} onVoteUpdate={fetchGlobalVotes} />
                  )}
                  {totalPages > 1 && <div className="mt-8"><PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={p => { setCurrentPage(p); window.scrollTo({top:0, behavior:'smooth'}); }} /></div>}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <footer className="bg-[#16213e] text-gray-500 py-6 text-center border-t border-blue-900/30 mt-auto z-[50]">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">© 2026 PokeVote Global Database</p>
      </footer>
    </div>
  );
}

export default App;