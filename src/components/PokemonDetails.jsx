import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faWeightHanging, faArrowsUpDown, faStar, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
  ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
  psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

const MOVES_PER_PAGE = 30;

function PokemonDetails({ pokemon, onBack, onSelectMove, onSelectAbility, onSelectPokemon }) {
  const [species, setSpecies] = useState(null);
  const [pagedMoves, setPagedMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoves, setLoadingMoves] = useState(false);
  const [movesPage, setMovesPage] = useState(1);
  const [varieties, setVarieties] = useState([]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pokemon?.id]);

  useEffect(() => {
    const fetchFullData = async () => {
      if (!pokemon?.species?.url) return;
      setLoading(true);
      try {
        const sRes = await axios.get(pokemon.species.url);
        setSpecies(sRes.data);
        
        const vPromises = sRes.data.varieties.map(v => axios.get(v.pokemon.url));
        const vResponses = await Promise.all(vPromises);
        
        const detailedVarieties = vResponses.map(res => {
            const d = res.data;
            if (d.name.includes('-totem')) return null;
            if (d.name.includes('-minior-') && !d.name.endsWith('-red')) return null;
            return { id: d.id, name: d.name, types: d.types.map(t => t.type.name), fullData: d };
        }).filter(v => v !== null);

        setVarieties(detailedVarieties);
      } catch (err) { console.error('Error in Details fetch:', err); } finally { setLoading(false); }
    };
    fetchFullData();
  }, [pokemon?.species?.url]);

  useEffect(() => {
    const fetchMoves = async () => {
      if (!pokemon?.moves?.length) { setPagedMoves([]); return; }
      setLoadingMoves(true);
      const items = pokemon.moves.slice((movesPage - 1) * MOVES_PER_PAGE, movesPage * MOVES_PER_PAGE);
      try {
        const res = await Promise.all(items.map(m => axios.get(m.move.url)));
        setPagedMoves(res.map(r => ({
          ...r.data,
          displayName: r.data.name.replace('-', ' '),
          displayType: r.data.type?.name || 'normal',
          displayCategory: r.data.damage_class?.name || 'physical',
          displayEffect: r.data.effect_entries?.find(e => e.language.name === 'en')?.short_effect || 'Sin registros.'
        })));
      } catch (e) { console.error(e); } finally { setLoadingMoves(false); }
    };
    fetchMoves();
  }, [movesPage, pokemon?.moves]);

  if (loading || !pokemon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-3xl border border-blue-900/30 w-full text-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 font-black text-blue-400 uppercase tracking-widest text-[10px]">Cargando Wiki...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-[#16213e] rounded-3xl shadow-2xl border border-blue-900/50 animate-fadeIn overflow-hidden">
      <div className="lg:flex">
        <div className="lg:w-1/2 p-8 border-r border-blue-900/30 overflow-y-auto max-h-[90vh] custom-scrollbar flex flex-col items-center text-center">
          <button onClick={onBack} className="self-start mb-6 text-blue-400 hover:text-yellow-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"><FontAwesomeIcon icon={faArrowLeft} /> Volver</button>
          
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-blue-500 rounded-full scale-110 opacity-10 blur-3xl"></div>
            <img 
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`} 
              alt={pokemon.name} 
              className="relative z-10 w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
            />
          </div>

          <div className="text-center mb-6 w-full">
            <span className="text-blue-500 font-black text-xl mb-1 block tracking-widest">#{pokemon.id.toString().padStart(3, '0')}</span>
            <h1 className="text-5xl font-black capitalize text-white tracking-tighter mb-4">{pokemon.name.replace('-', ' ')}</h1>
            <div className="flex gap-2 justify-center">
              {pokemon.types?.map(t => (
                <span key={t.type.name} className="px-5 py-1.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg" style={{ backgroundColor: typeColors[t.type.name] }}>{t.type.name}</span>
              ))}
            </div>
          </div>

          {/* Form Switcher */}
          {varieties.length > 1 && (
            <div className="w-full mb-8 bg-black/20 p-5 rounded-[30px] border border-blue-900/20 shadow-inner">
               <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Formas Disponibles</h4>
               <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar justify-center">
                  {varieties.map(v => (
                    <button key={v.id} onClick={() => { setMovesPage(1); onSelectPokemon(v.fullData); }} className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${v.id === pokemon.id ? 'bg-blue-600/30 border border-blue-400 shadow-lg' : 'bg-[#1a1a2e] border border-transparent hover:border-blue-900'}`}>
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${v.id}.png`}
                          alt={v.name}
                          className="w-12 h-12 object-contain"
                          onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
                        />
                        <div className="flex gap-0.5 mt-1">
                            {v.types.map(t => <div key={t} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColors[t] }}></div>)}
                        </div>
                    </button>
                  ))}
               </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-[#1a1a2e] p-4 rounded-2xl border border-blue-900/30 text-center"><FontAwesomeIcon icon={faWeightHanging} className="text-blue-400 mb-2" /><p className="text-[10px] text-gray-500 font-black uppercase">Peso</p><p className="text-lg font-bold text-white">{pokemon.weight / 10} kg</p></div>
            <div className="bg-[#1a1a2e] p-4 rounded-2xl border border-blue-900/30 text-center"><FontAwesomeIcon icon={faArrowsUpDown} className="text-green-400 mb-2" /><p className="text-[10px] text-gray-500 font-black uppercase">Altura</p><p className="text-lg font-bold text-white">{pokemon.height / 10} m</p></div>
          </div>

          <div className="w-full mb-8 text-left">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div> Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities?.map(a => (
                <button key={a.ability.name} onClick={() => onSelectAbility && onSelectAbility(a.ability)} className={`px-4 py-2 rounded-xl border transition-all text-left ${a.is_hidden ? 'bg-purple-900/10 border-purple-500/30' : 'bg-blue-900/10 border-blue-500/10'}`}>
                    <span className="text-xs font-bold text-white capitalize">{a.ability.name.replace('-', ' ')}</span>
                    {a.is_hidden && <span className="block text-[7px] font-black text-purple-400 uppercase">Oculta</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full text-left">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div> Estadísticas Base</h3>
            <div className="space-y-4">
              {pokemon?.stats?.map(s => (
                <div key={s.stat.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-gray-500 uppercase">{s.stat.name.replace('-', ' ')}</span>
                    <span className="text-xs font-bold text-white">{s.base_stat}</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (s.base_stat / 200) * 100)}%`, backgroundColor: '#00ced1' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 p-8 bg-[#0f3460]/20 flex flex-col h-[90vh]">
          <div className="flex justify-between items-center mb-8 flex-shrink-0">
             <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2"><FontAwesomeIcon icon={faStar} className="text-yellow-400" /> Ataques ({pokemon.moves?.length || 0})</h3>
             <div className="flex items-center gap-4 bg-[#1a1a2e] px-3 py-1.5 rounded-xl border border-blue-900/30 shadow-inner">
                <button disabled={movesPage === 1} onClick={() => setMovesPage(p => p - 1)} className="text-blue-400 disabled:opacity-20"><FontAwesomeIcon icon={faChevronLeft} size="xs" /></button>
                <span className="text-[9px] font-black text-white">Pág {movesPage}</span>
                <button disabled={movesPage >= (Math.ceil((pokemon.moves?.length || 0) / MOVES_PER_PAGE))} onClick={() => setMovesPage(p => p + 1)} className="text-blue-400 disabled:opacity-20"><FontAwesomeIcon icon={faChevronRight} size="xs" /></button>
             </div>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar relative pr-2">
            <div className="grid gap-4 pb-6">
              {pagedMoves.map((m, i) => (
                <button key={i} onClick={() => onSelectMove && onSelectMove(m)} className="bg-[#1a1a2e] rounded-2xl p-5 border border-blue-900/30 hover:border-blue-400/50 transition-all text-left shadow-lg group">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-black text-white capitalize group-hover:text-yellow-400">{m.displayName}</h4>
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-white mt-1.5 inline-block" style={{ backgroundColor: typeColors[m.displayType] }}>{m.displayType}</span>
                      </div>
                      <span className="text-[7px] font-black text-blue-500 uppercase border border-blue-500/20 px-1.5 py-0.5 rounded">{m.displayCategory}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-[#16213e] p-2 rounded-lg text-center"><span className="block text-[7px] text-gray-500 font-black uppercase">Power</span><span className="text-xs font-bold text-white">{m.power || '--'}</span></div>
                      <div className="bg-[#16213e] p-2 rounded-lg text-center"><span className="block text-[7px] text-gray-500 font-black uppercase">Acc.</span><span className="text-xs font-bold text-white">{m.accuracy ? `${m.accuracy}%` : '--'}</span></div>
                   </div>
                   <p className="text-[10px] text-gray-400 italic line-clamp-2">"{m.displayEffect}"</p>
                </button>
              ))}
            </div>
            {loadingMoves && <div className="absolute inset-0 bg-[#1a1a2e]/50 flex items-center justify-center rounded-2xl"><div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;