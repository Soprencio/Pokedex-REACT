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

const gameGenerations = [
  { id: 'I', games: ['red', 'blue', 'yellow'] },
  { id: 'II', games: ['gold', 'silver', 'crystal'] },
  { id: 'III', games: ['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen'] },
  { id: 'IV', games: ['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'] },
  { id: 'V', games: ['black', 'white', 'black-2', 'white-2'] },
  { id: 'VI', games: ['x', 'y', 'omega-ruby', 'alpha-sapphire'] },
  { id: 'VII', games: ['sun', 'moon', 'ultra-sun', 'ultra-moon', 'lets-go-pikachu', 'lets-go-eevee'] },
  { id: 'VIII', games: ['sword', 'shield', 'brilliant-diamond', 'shining-pearl', 'legends-arceus'] },
  { id: 'IX', games: ['scarlet', 'violet'] }
];

const gameNamesEs = {
  red: 'Rojo', blue: 'Azul', yellow: 'Amarillo', gold: 'Oro', silver: 'Plata', crystal: 'Cristal',
  ruby: 'Rubí', sapphire: 'Zafiro', emerald: 'Esmeralda', firered: 'Rojo Fuego', leafgreen: 'Verde Hoja',
  diamond: 'Diamante', pearl: 'Perla', platinum: 'Platino', heartgold: 'Oro HeartGold', soulsilver: 'Plata SoulSilver',
  black: 'Negro', white: 'Blanco', 'black-2': 'Negro 2', 'white-2': 'Blanco 2',
  x: 'X', y: 'Y', 'omega-ruby': 'Rubí Omega', 'alpha-sapphire': 'Zafiro Alfa',
  sun: 'Sol', moon: 'Luna', 'ultra-sun': 'Ultrasol', 'ultra-moon': 'Ultraluna', 'lets-go-pikachu': 'Let\'s Go Pikachu', 'lets-go-eevee': 'Let\'s Go Eevee',
  sword: 'Espada', shield: 'Escudo', 'brilliant-diamond': 'Diamante Brillante', 'shining-pearl': 'Perla Reluciente', 'legends-arceus': 'Leyendas Arceus',
  scarlet: 'Scarlet', violet: 'Violet'
};

function PokemonDetails({ pokemon, onBack, onSelectMove, onSelectAbility, onSelectPokemon }) {
  const [species, setSpecies] = useState(null);
  const [pagedMoves, setPagedMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoves, setLoadingMoves] = useState(false);
  const [movesPage, setMovesPage] = useState(1);
  const [varieties, setVarieties] = useState([]);

  // Base ID logic for varieties
  const basePokedexId = useMemo(() => {
    if (!pokemon) return '???';
    if (pokemon.id <= 1025) return pokemon.id;
    if (species) {
        const def = species.varieties.find(v => v.is_default);
        if (def) return parseInt(def.pokemon.url.split('/').filter(Boolean).pop());
    }
    return pokemon.id;
  }, [pokemon, species]);

  // G-Max Stat Multiplier & Move inheritance
  const adjustedPokemon = useMemo(() => {
    if (!pokemon) return null;
    let p = { ...pokemon };
    if (p.name.includes('-gmax') && varieties.length > 0) {
      const base = varieties.find(v => v.id <= 1025);
      if (base) {
        p.moves = base.fullData.moves;
        p.stats = p.stats.map(s => s.stat.name === 'hp' ? { ...s, base_stat: s.base_stat * 2 } : s);
      }
    }
    return p;
  }, [pokemon, varieties]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pokemon?.id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!pokemon?.species?.url) return;
      setLoading(true);
      try {
        const sRes = await axios.get(pokemon.species.url);
        setSpecies(sRes.data);
        const vData = await Promise.all(sRes.data.varieties.map(async (v) => {
            try {
              const res = await axios.get(v.pokemon.url);
              const d = res.data;
              if (d.name.includes('-totem')) return null;
              if (d.name.includes('-minior-') && !d.name.endsWith('-red')) return null;
              return { id: d.id, name: d.name, types: d.types.map(t => t.type.name), fullData: d };
            } catch (e) { return null; }
        }));
        setVarieties(vData.filter(v => v !== null));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [pokemon?.species?.url]);

  useEffect(() => {
    const fetchMoves = async () => {
      if (!adjustedPokemon?.moves?.length) { setPagedMoves([]); return; }
      setLoadingMoves(true);
      const items = adjustedPokemon.moves.slice((movesPage - 1) * MOVES_PER_PAGE, movesPage * MOVES_PER_PAGE);
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
  }, [movesPage, adjustedPokemon?.moves]);

  const debutGenIndex = pokemon?.id ? (pokemon.id <= 151 ? 0 : pokemon.id <= 251 ? 1 : pokemon.id <= 386 ? 2 : pokemon.id <= 493 ? 3 : pokemon.id <= 649 ? 4 : pokemon.id <= 721 ? 5 : pokemon.id <= 809 ? 6 : pokemon.id <= 905 ? 7 : 8) : 0;

  const groupedEntries = useMemo(() => {
    if (!species?.flavor_text_entries) return [];
    return gameGenerations.map((gen, index) => {
      if (index < debutGenIndex) return null;
      const entries = species.flavor_text_entries.filter(
        entry => entry.language.name === 'en' && gen.games.includes(entry.version.name)
      ).reduce((acc, current) => {
        const x = acc.find(item => item.flavor_text === current.flavor_text);
        if (!x) return acc.concat([{ ...current, version_names: [current.version.name] }]);
        if (!x.version_names.includes(current.version.name)) x.version_names.push(current.version.name);
        return acc;
      }, []).map(entry => ({
        text: entry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ').trim(),
        versions: entry.version_names
      }));
      return entries.length > 0 ? { ...gen, entries } : null;
    }).filter(g => g !== null);
  }, [species, debutGenIndex]);

  const getStatColor = (value) => {
    if (value < 30) return '#8b0000';
    if (value < 50) return '#ff4500';
    if (value < 70) return '#ffa500';
    if (value < 80) return '#ffbd00';
    if (value < 90) return '#ffff00';
    if (value < 110) return '#a3ff00';
    if (value < 120) return '#00ff00';
    if (value < 130) return '#00ff7f';
    if (value < 150) return '#40e0d0';
    return '#00ced1';
  };

  if (loading || !pokemon) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-3xl w-full text-center border border-blue-900/30 shadow-2xl">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-6 font-black text-blue-400 uppercase tracking-widest text-[10px]">Analizando datos del Pokémon...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-[#16213e] rounded-[40px] shadow-2xl border border-blue-900/50 animate-fadeIn overflow-hidden">
      <div className="lg:flex">
        {/* Lado Izquierdo: Información Base */}
        <div className="lg:w-1/2 p-8 border-r border-blue-900/30 overflow-y-auto max-h-[90vh] custom-scrollbar flex flex-col items-center text-center">
          <button onClick={onBack} className="self-start mb-6 text-blue-400 hover:text-yellow-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} /> Volver al Hall
          </button>
          
          <div className="relative group mb-10">
            <div className="absolute inset-0 bg-blue-500 rounded-full scale-125 opacity-10 blur-3xl transition-opacity group-hover:opacity-20"></div>
            <img 
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${adjustedPokemon.id}.png`} 
              alt={adjustedPokemon.name} 
              className="relative z-10 w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
            />
          </div>

          <div className="mb-8 w-full">
            <span className="text-blue-500 font-black text-2xl mb-1 block tracking-widest opacity-80">#{basePokedexId.toString().padStart(3, '0')}</span>
            <h1 className="text-5xl md:text-6xl font-black capitalize text-white tracking-tighter mb-4 drop-shadow-lg">{adjustedPokemon.name.replace('-', ' ')}</h1>
            <div className="flex gap-3 justify-center">
              {adjustedPokemon.types?.map(t => (
                <span key={t.type.name} className="px-6 py-2 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl border-b-4 border-black/20" style={{ backgroundColor: typeColors[t.type.name] }}>{t.type.name}</span>
              ))}
            </div>
          </div>

          {/* Form Switcher */}
          {varieties.length > 1 && (
            <div className="w-full mb-10 bg-black/30 p-6 rounded-[35px] border border-blue-900/20 shadow-inner">
               <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-5">Variantes de Especie</h4>
               <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar justify-center">
                  {varieties.map(v => (
                    <button 
                        key={v.id} 
                        onClick={() => { setMovesPage(1); onSelectPokemon(v.fullData); }} 
                        className={`flex-shrink-0 w-16 h-24 rounded-2xl flex flex-col items-center justify-center transition-all gap-2 border-2 ${v.id === pokemon.id ? 'bg-blue-600/30 border border-blue-400 scale-110 shadow-lg' : 'bg-[#1a1a2e] border-transparent hover:border-blue-900 opacity-60 hover:opacity-100'}`}
                    >
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${v.id}.png`}
                          alt={v.name}
                          className="w-12 h-12 object-contain"
                          onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
                        />
                        <div className="flex gap-0.5">
                            {v.types.map(t => <div key={t} className="w-2 h-2 rounded-full" style={{ backgroundColor: typeColors[t] }}></div>)}
                        </div>
                    </button>
                  ))}
               </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-5 w-full mb-10">
            <div className="bg-[#1a1a2e] p-5 rounded-[25px] border border-blue-900/20 text-center shadow-inner group/stat">
              <FontAwesomeIcon icon={faWeightHanging} className="text-blue-400 mb-2 text-xl group-hover:scale-110 transition-transform" />
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Peso</p>
              <p className="text-xl font-bold text-white">{adjustedPokemon.weight / 10} kg</p>
            </div>
            <div className="bg-[#1a1a2e] p-5 rounded-[25px] border border-blue-900/20 text-center shadow-inner group/stat">
              <FontAwesomeIcon icon={faArrowsUpDown} className="text-green-400 mb-2 text-xl group-hover:scale-110 transition-transform" />
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Altura</p>
              <p className="text-xl font-bold text-white">{adjustedPokemon.height / 10} m</p>
            </div>
          </div>

          <div className="w-full mb-10 text-left">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-5 flex items-center gap-3"><div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div> Habilidades</h3>
            <div className="flex flex-wrap gap-3">
              {adjustedPokemon.abilities?.map(a => (
                <button key={a.ability.name} onClick={() => onSelectAbility && onSelectAbility(a.ability)} className={`px-5 py-3 rounded-2xl border transition-all text-left group/skill ${a.is_hidden ? 'bg-purple-900/10 border-purple-500/30' : 'bg-blue-900/10 border-blue-500/10'}`}>
                    <span className="text-sm font-bold text-white capitalize group-hover/skill:text-yellow-400 transition-colors">{a.ability.name.replace('-', ' ')}</span>
                    {a.is_hidden && <span className="block text-[8px] font-black text-purple-400 uppercase tracking-tighter mt-1">Habilidad Oculta</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Historial Pokédex */}
          <div className="w-full mb-10 text-left">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-3"><div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div> Historial Pokédex</h3>
            <div className="bg-[#1a1a2e] rounded-[30px] border border-blue-900/20 shadow-inner max-h-[350px] overflow-y-auto custom-scrollbar">
              {groupedEntries.length > 0 ? groupedEntries.map((gen, gIdx) => (
                <div key={gen.id} className={`flex relative ${gIdx !== 0 ? 'border-t border-blue-900/40' : ''}`}>
                  <div className="w-16 flex-shrink-0 bg-blue-600/5 flex flex-col items-center border-r border-blue-500/10 py-8">
                    <span className="text-3xl font-black text-blue-400/30 sticky top-4">{gen.id}</span>
                  </div>
                  <div className="flex-grow p-6 space-y-8">
                    {gen.entries.map((entry, idx) => (
                      <div key={idx} className={idx !== 0 ? 'border-t border-blue-900/30 pt-8' : ''}>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {entry.versions.map(v => (
                            <span key={v} className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-blue-800 bg-blue-900/50 text-blue-100 shadow-sm">{gameNamesEs[v] || v}</span>
                          ))}
                        </div>
                        <p className="text-blue-50/90 text-sm leading-relaxed italic font-medium">"{entry.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-gray-600 italic text-[10px] uppercase tracking-[0.3em] opacity-50">Base de datos histórica no disponible para esta variante regional.</div>
              )}
            </div>
          </div>

          <div className="w-full text-left">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-3"><div className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div> Estadísticas Base</h3>
            <div className="space-y-5">
              {adjustedPokemon.stats?.map(s => {
                const val = s.base_stat;
                return (
                  <div key={s.stat.name} className="group/bar">
                    <div className="flex justify-between items-center mb-1.5 px-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter group-hover/bar:text-blue-400 transition-colors">{s.stat.name.replace('-', ' ')}</span>
                      <span className="text-xs font-bold text-white">{val}</span>
                    </div>
                    <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ width: `${Math.min(100, (val / 220) * 100)}%`, backgroundColor: getStatColor(val) }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lado Derecho: Ataques */}
        <div className="lg:w-1/2 p-8 bg-[#0f3460]/20 flex flex-col h-[90vh]">
          <div className="flex justify-between items-center mb-8 flex-shrink-0">
             <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                <FontAwesomeIcon icon={faStar} className="text-yellow-400 animate-pulse" /> Ataques ({adjustedPokemon.moves?.length || 0})
             </h3>
             <div className="flex items-center gap-4 bg-[#1a1a2e] px-4 py-2 rounded-2xl border border-blue-900/30 shadow-2xl">
                <button disabled={movesPage === 1} onClick={() => setMovesPage(p => p - 1)} className="text-blue-400 hover:text-yellow-400 disabled:opacity-20 transition-colors"><FontAwesomeIcon icon={faChevronLeft} /></button>
                <span className="text-[10px] font-black text-white tracking-widest">PÁG {movesPage}</span>
                <button disabled={movesPage >= (Math.ceil((adjustedPokemon.moves?.length || 0) / MOVES_PER_PAGE))} onClick={() => setMovesPage(p => p + 1)} className="text-blue-400 hover:text-yellow-400 disabled:opacity-20 transition-colors"><FontAwesomeIcon icon={faChevronRight} /></button>
             </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar relative pr-2">
            <div className="grid gap-4 pb-10">
              {pagedMoves.map((m, i) => (
                <button key={i} onClick={() => onSelectMove && onSelectMove(m)} className="bg-[#1a1a2e] rounded-[30px] p-6 border border-blue-900/30 hover:border-blue-400/50 transition-all text-left shadow-xl group/move active:scale-95">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-black text-white capitalize group-hover/move:text-yellow-400 transition-colors leading-none">{m.displayName}</h4>
                        <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase text-white mt-2 inline-block shadow-md border-b-2 border-black/10" style={{ backgroundColor: typeColors[m.displayType] }}>{m.displayType}</span>
                      </div>
                      <span className="text-[8px] font-black text-blue-500 uppercase border border-blue-500/20 px-2 py-1 rounded-lg bg-blue-900/5">{m.displayCategory}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#16213e] p-3 rounded-2xl border border-blue-900/20 text-center"><span className="block text-[8px] text-gray-500 font-black uppercase mb-1">Poder</span><span className="text-sm font-black text-white">{m.power || '--'}</span></div>
                      <div className="bg-[#16213e] p-3 rounded-2xl border border-blue-900/20 text-center"><span className="block text-[8px] text-gray-500 font-black uppercase mb-1">Prec.</span><span className="text-sm font-black text-white">{m.accuracy ? `${m.accuracy}%` : '--'}</span></div>
                   </div>
                   <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                      <p className="text-[11px] text-gray-400 italic leading-relaxed">"{m.displayEffect}"</p>
                   </div>
                </button>
              ))}
            </div>
            {loadingMoves && <div className="absolute inset-0 bg-[#1a1a2e]/60 flex items-center justify-center rounded-[30px] z-50 backdrop-blur-sm"><div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;