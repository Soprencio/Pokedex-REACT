import { useState, useEffect } from 'react';
import axios from 'axios';
import PokemonList from './components/PokemonList.jsx';
import PokemonDetails from './components/PokemonDetails.jsx';
import MoveList from './components/MoveList.jsx';
import MoveDetails from './components/MoveDetails.jsx';
import AbilityList from './components/AbilityList.jsx';
import AbilityDetails from './components/AbilityDetails.jsx';
import Auth from './components/Auth.jsx';
import { supabase } from './supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faSignOutAlt, faSearch, faBars, faCaretDown, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const generations = [
  { name: 'Todos', style: 'bg-[#f1f5f9] text-gray-700 border-gray-300' },
  { name: 'Ranking', special: 'votes', style: 'bg-[#ffcc00] text-[#4a3701] border-[#d4af37]' },
  { name: 'Gen I', offset: 0, limit: 151, style: 'bg-[linear-gradient(to_right,#ff0000_50%,#ff0000_50%,#0000ff_50%,#0000ff_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen II', offset: 151, limit: 100, style: 'bg-[linear-gradient(to_right,#ffd700_50%,#ffd700_50%,#c0c0c0_50%,#c0c0c0_100%)] bg-no-repeat text-[#1a1a2e] border-black/10' },
  { name: 'Gen III', offset: 251, limit: 135, style: 'bg-[linear-gradient(to_right,#a50f21_50%,#a50f21_50%,#00008b_50%,#00008b_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen IV', offset: 386, limit: 107, style: 'bg-[linear-gradient(to_right,#7b96b8_50%,#7b96b8_50%,#ffc0cb_50%,#ffc0cb_100%)] bg-no-repeat text-[#1a1a2e] border-black/5' },
  { name: 'Gen V', offset: 493, limit: 156, style: 'bg-[linear-gradient(to_right,#ffffff_50%,#ffffff_50%,#000000_50%,#000000_100%)] bg-no-repeat text-[#666666] border-gray-400 font-bold' },
  { name: 'Gen VI', offset: 649, limit: 72, style: 'bg-[linear-gradient(to_right,#025da6_50%,#025da6_50%,#ea1a15_50%,#ea1a15_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen VII', offset: 721, limit: 88, style: 'bg-[linear-gradient(to_right,#f1912b_50%,#f1912b_50%,#9151b8_50%,#9151b8_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen VIII', offset: 809, limit: 96, style: 'bg-[linear-gradient(to_right,#00a1e9_50%,#00a1e9_50%,#e5005a_50%,#e5005a_100%)] bg-no-repeat text-white border-white/10' },
  { name: 'Gen IX', offset: 905, limit: 120, style: 'bg-[linear-gradient(to_right,#ff1c1c_50%,#ff1c1c_50%,#65219e_50%,#65219e_100%)] bg-no-repeat text-white border-white/10' },
];

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
  ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
  psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

const ITEMS_PER_PAGE = 100;
const MOVES_PER_PAGE = 48;

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#16213e] border border-blue-900/50 text-yellow-400 disabled:opacity-10 transition-all shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <div className="bg-[#1a1a2e] px-4 py-1.5 rounded-lg border border-blue-900/30 shadow-inner">
        <span className="text-[10px] font-black text-white">{currentPage} <span className="opacity-20 mx-0.5">/</span> {totalPages || 1}</span>
      </div>
      <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#16213e] border border-blue-900/50 text-yellow-400 disabled:opacity-10 transition-all shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState('Pokemons'); 
  const [menuOpen, setMenuOpen] = useState(false);
  const [runtimeError, setRuntimeError] = useState(null);
  const [allPokemons, setAllPokemons] = useState([]);
  const [allMoves, setAllMoves] = useState([]);
  const [allAbilities, setAllAbilities] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGen, setActiveGen] = useState('Todos');
  const [searchQuery, setSearchBar] = useState('');
  const [voteCounts, setVoteCounts] = useState({});
  const [userVotes, setUserVotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [typeError, setTypeError] = useState('');
  const [pokemonTypeMap, setPokemonTypeMap] = useState({});
  const [moveTypeMap, setMoveTypeMap] = useState({}); 
  const [genDataMap, setGenDataMap] = useState({});

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
    } catch (err) { console.error('Votes sync error:', err.message); }
  };

  useEffect(() => {
    const handleError = (event) => setRuntimeError(event.error?.message || event.message || "Error detectado");
    window.addEventListener('error', handleError);

    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setCurrentUser(session.user);
      fetchGlobalVotes();

      try {
        setLoading(true);
        // Base Fetch (Only base 1025 species)
        const [pRes, mRes, aRes] = await Promise.all([
          axios.get('https://pokeapi.co/api/v2/pokemon?limit=1025'),
          axios.get('https://pokeapi.co/api/v2/move?limit=1000'),
          axios.get('https://pokeapi.co/api/v2/ability?limit=400')
        ]);

        setAllPokemons(pRes.data.results.map((p, i) => ({ ...p, id: i + 1 })));
        setAllMoves(mRes.data.results.map(m => ({ ...m, id: parseInt(m.url.split('/').filter(Boolean).pop()) })));
        setAllAbilities(aRes.data.results.map(a => ({ ...a, id: parseInt(a.url.split('/').filter(Boolean).pop()) })));

        // Load Maps
        const pTypeMap = {};
        const mTypeMap = {};
        const typePromises = Object.keys(typeColors).map(t => axios.get(`https://pokeapi.co/api/v2/type/${t}`));
        const typeResponses = await Promise.all(typePromises);

        typeResponses.forEach(r => {
          const typeName = r.data.name;
          r.data.pokemon.forEach(p => {
            const id = parseInt(p.pokemon.url.split('/').filter(Boolean).pop());
            if (id <= 1025) { if (!pTypeMap[id]) pTypeMap[id] = []; pTypeMap[id].push(typeName); }
          });
          r.data.moves.forEach(m => {
            const id = parseInt(m.url.split('/').filter(Boolean).pop());
            mTypeMap[id] = typeName;
          });
        });
        setPokemonTypeMap(pTypeMap);
        setMoveTypeMap(mTypeMap);

        const genMap = {};
        const genPromises = [1,2,3,4,5,6,7,8,9].map(i => axios.get(`https://pokeapi.co/api/v2/generation/${i}`));
        const genResponses = await Promise.all(genPromises);
        genResponses.forEach((r, idx) => {
          genMap[idx + 1] = {
            pokemon: r.data.pokemon_species.map(p => p.name),
            moves: r.data.moves.map(m => m.name),
            abilities: r.data.abilities.map(a => a.name)
          };
        });
        setGenDataMap(genMap);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setCurrentUser(session?.user ?? null));
    return () => { subscription.unsubscribe(); window.removeEventListener('error', handleError); };
  }, []);

  useEffect(() => {
    let base = activeView === 'Pokemons' ? allPokemons : activeView === 'Movimientos' ? allMoves : allAbilities;
    if (!base || base.length === 0) return;

    let filtered = [...base];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(q) || item.id?.toString().includes(q));
    }

    const genObj = generations.find(g => g.name === activeGen);
    if (activeView === 'Pokemons' && activeGen === 'Ranking') {
      filtered = filtered.filter(p => voteCounts[p.id] > 0).sort((a,b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
    } else if (activeGen !== 'Todos' && genObj) {
      const genIndex = generations.indexOf(genObj);
      const actualGenId = genIndex - 1; 

      if (actualGenId > 0 && genDataMap[actualGenId]) {
        const namesInGen = genDataMap[actualGenId][activeView === 'Pokemons' ? 'pokemon' : activeView === 'Movimientos' ? 'moves' : 'abilities'];
        filtered = filtered.filter(item => namesInGen.includes(item.name));
      } else if (activeView === 'Pokemons' && genObj.limit !== undefined) {
         filtered = filtered.filter(p => p.id > genObj.offset && p.id <= (genObj.offset + genObj.limit));
      }
    }

    if (selectedTypes.length > 0) {
      if (activeView === 'Pokemons') {
        filtered = filtered.filter(p => selectedTypes.every(t => (pokemonTypeMap[p.id] || []).includes(t)));
      } else if (activeView === 'Movimientos') {
        filtered = filtered.filter(m => selectedTypes.includes(moveTypeMap[m.id]));
      }
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchQuery, activeGen, selectedTypes, allPokemons, allMoves, allAbilities, activeView, genDataMap, voteCounts, pokemonTypeMap, moveTypeMap]);

  const handleTypeToggle = (type) => {
    setTypeError('');
    setSelectedTypes(prev => {
      if (activeView === 'Movimientos') {
        if (prev.includes(type)) return [];
        return [type];
      } else {
        if (prev.includes(type)) return prev.filter(t => t !== type);
        if (prev.length >= 2) { setTypeError('Máximo 2 tipos'); return prev; }
        return [...prev, type];
      }
    });
  };

  const handleSelectPokemon = async (summary) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${summary.id || summary.name}`);
      setSelectedPokemon(response.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSelectMove = async (moveSummary) => {
    setLoading(true);
    try {
      const url = moveSummary.url || `https://pokeapi.co/api/v2/move/${moveSummary.id || moveSummary.name}`;
      const res = await axios.get(url);
      setSelectedMove(res.data);
      setSelectedPokemon(null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSelectAbility = async (abilitySummary) => {
    setLoading(true);
    try {
      const url = abilitySummary.url || `https://pokeapi.co/api/v2/ability/${abilitySummary.id || abilitySummary.name}`;
      const res = await axios.get(url);
      setSelectedAbility(res.data);
      setSelectedPokemon(null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handlePageChange = (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const pageLimit = activeView === 'Movimientos' ? MOVES_PER_PAGE : ITEMS_PER_PAGE;
  const totalPages = Math.ceil(filteredItems.length / pageLimit);
  const paginatedList = filteredItems.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);

  if (runtimeError) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-10">
        <div className="bg-red-900/20 border-2 border-red-500/50 p-10 rounded-[40px] max-w-2xl w-full text-center shadow-2xl backdrop-blur-xl">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-6xl mb-6 animate-pulse" />
          <h1 className="text-white font-black text-3xl mb-4 uppercase">Error Crítico</h1>
          <div className="bg-black/60 p-6 rounded-2xl text-red-400 text-sm font-mono text-left mb-10 overflow-auto max-h-40">{runtimeError}</div>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-[#e94560] text-white font-black rounded-2xl uppercase tracking-widest transition-all">Reiniciar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-[#1a1a2e] font-sans text-gray-100 flex flex-col overflow-x-hidden">
      {loading && !allPokemons.length && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a1a2e] text-yellow-400">
           <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
           <span className="font-black uppercase tracking-[0.5em] animate-pulse text-center">Sincronizando Wiki...</span>
        </div>
      )}
      
      <header className="bg-[#16213e] pt-4 pb-4 shadow-2xl border-b border-blue-900/50 sticky top-0 z-50">
        <div className="w-full px-4 md:px-8 flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
          <div className="w-1/4">
            {currentUser && (
              <div className="flex items-center gap-3 bg-blue-900/10 px-4 py-2.5 rounded-2xl border border-blue-500/10 shadow-inner group/profile max-w-fit">
                <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-blue-400" />
                <span className="hidden md:inline text-[10px] font-bold text-white truncate max-w-[100px]">{currentUser.email?.split('@')[0]}</span>
                <button onClick={() => supabase.auth.signOut()} className="ml-1 text-red-500 hover:text-red-400 transition-colors"><FontAwesomeIcon icon={faSignOutAlt} /></button>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center"><h1 className="pokemon-font text-4xl md:text-6xl tracking-[0.1em]">Poke<span className="pokevote-v">Vote</span></h1></div>
          <div className="w-1/4 flex justify-end">
            {currentUser && (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="bg-[#e94560] hover:bg-[#ff2e63] text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-3 transition-all shadow-lg active:scale-95 border-b-4 border-red-900">
                  <FontAwesomeIcon icon={faBars} /><span className="hidden sm:inline uppercase tracking-widest">{activeView}</span><FontAwesomeIcon icon={faCaretDown} className={`transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#16213e] border border-blue-900/50 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-fadeIn">
                    {['Pokemons', 'Movimientos', 'Habilidades', 'Equipos'].map(v => (
                      <button key={v} onClick={() => { setActiveView(v); setMenuOpen(false); setCurrentPage(1); setActiveGen('Todos'); setSelectedTypes([]); setSelectedPokemon(null); setSelectedMove(null); setSelectedAbility(null); }} className={`w-full text-left px-5 py-3.5 text-xs font-black uppercase tracking-widest transition-colors border-b border-blue-900/20 last:border-0 ${activeView === v ? 'bg-blue-600 text-white' : 'text-blue-300 hover:bg-blue-900/30'}`}>{v}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative max-w-[1800px] mx-auto w-full">
        {currentUser && !selectedPokemon && !selectedMove && !selectedAbility && (
          <aside className="w-64 bg-[#16213e] border-r border-blue-900/50 p-5 flex flex-col gap-6 hidden lg:flex sticky top-[120px] h-[calc(100vh-140px)]">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchBar(e.target.value)} className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-xl py-2.5 px-4 pl-10 text-sm font-bold text-white focus:border-yellow-400 focus:outline-none transition-all placeholder-blue-900/50 shadow-inner" />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400"><FontAwesomeIcon icon={faSearch} size="sm" /></div>
              </div>
              {typeError && <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-2 rounded-lg text-[9px] font-black uppercase text-center animate-bounce">{typeError}</div>}
            </div>
            {activeView !== 'Habilidades' && activeView !== 'Equipos' && (
              <div className="flex flex-col h-full overflow-hidden text-center">
                <h3 className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3 ml-1">Filtrar por Tipo</h3>
                <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 custom-scrollbar">
                  {Object.entries(typeColors).map(([type, color]) => (
                    <button key={type} onClick={() => handleTypeToggle(type)} className={`relative flex items-center justify-center py-2 rounded-lg border-2 transition-all duration-300 font-black text-[9px] uppercase tracking-tighter ${selectedTypes.includes(type) ? 'border-white scale-105 brightness-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100 grayscale-[0.2]'}`} style={{ backgroundColor: color, color: '#fff' }}>
                      <span className="z-10 drop-shadow-md">{type}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setSelectedTypes([])} className="mt-4 text-[9px] font-black text-blue-900 hover:text-white uppercase tracking-widest transition-colors text-center py-2 bg-blue-900/10 rounded-lg shadow-md">Limpiar</button>
              </div>
            )}
          </aside>
        )}

        <main className="flex-1 px-3 md:px-5 py-6 md:py-8 min-w-0">
          {!currentUser ? (
            <Auth onLogin={(u) => setCurrentUser(u)} />
          ) : (
            <div className="w-full">
              {selectedPokemon ? (
                <PokemonDetails 
                  pokemon={selectedPokemon} 
                  onBack={() => setSelectedPokemon(null)} 
                  onSelectMove={handleSelectMove}
                  onSelectAbility={handleSelectAbility}
                  onSelectPokemon={handleSelectPokemon}
                  pokemonTypeMap={pokemonTypeMap}
                />
              ) : selectedMove ? (
                <MoveDetails move={selectedMove} onBack={() => setSelectedMove(null)} onSelectPokemon={handleSelectPokemon} />
              ) : selectedAbility ? (
                <AbilityDetails ability={selectedAbility} onBack={() => setSelectedAbility(null)} onSelectPokemon={handleSelectPokemon} />
              ) : (
                <div className="animate-fadeIn w-full flex flex-col items-center">
                  <nav className="w-full overflow-x-auto no-scrollbar scroll-smooth mb-6">
                    <div className="flex items-center justify-start md:justify-center gap-2.5 min-w-max pb-4 pt-4 px-2 mx-auto">
                      {generations.filter(g => activeView === 'Pokemons' || g.name !== 'Ranking').map((gen) => (
                        <button key={gen.name} onClick={() => { setActiveGen(gen.name); setCurrentPage(1); }} className={`relative px-5 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all duration-300 border-2 shadow-md hover:scale-105 group ${activeGen === gen.name ? `${gen.style} border-yellow-400 scale-110 z-10` : `${gen.style} opacity-70 border-transparent hover:border-white/20`}`}>
                          {gen.name === 'Ranking' && <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png" alt="Crown" className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 drop-shadow-md animate-bounce z-[20]" />}
                          <span className="relative z-10">{gen.name}</span>
                        </button>
                      ))}
                    </div>
                  </nav>
                  <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6 gap-3 px-2">
                    <div className="text-blue-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 bg-blue-900/10 px-4 py-2 rounded-full border border-blue-900/30">Resultados: {filteredItems.length}</div>
                    {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
                  </div>
                  {activeView === 'Pokemons' && <PokemonList pokemons={paginatedList} onSelect={handleSelectPokemon} currentUser={currentUser} voteCounts={voteCounts} userVotes={userVotes} onVoteUpdate={fetchGlobalVotes} typeMap={pokemonTypeMap} />}
                  {activeView === 'Movimientos' && <MoveList moves={paginatedList} onSelect={setSelectedMove} selectedTypes={selectedTypes} moveTypeMap={moveTypeMap} />}
                  {activeView === 'Habilidades' && <AbilityList abilities={paginatedList} onSelect={setSelectedAbility} />}
                  {activeView === 'Equipos' && <div className="text-center py-20 text-blue-400 uppercase font-black text-xs tracking-[0.5em] italic">Próximamente...</div>}
                  {totalPages > 1 && <div className="mt-8"><PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /></div>}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <footer className="bg-[#16213e] text-gray-500 py-6 text-center border-t border-blue-900/30 mt-auto">
        <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">© 2026 PokeVote Global Database</p>
      </footer>
    </div>
  );
}

export default App;