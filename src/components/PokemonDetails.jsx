import { useState, useEffect } from 'react';
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

function PokemonDetails({ pokemon, onBack }) {
  const [species, setSpecies] = useState(null);
  const [pagedMoves, setPagedMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoves, setLoadingMoves] = useState(false);
  const [movesPage, setMovesPage] = useState(1);

  useEffect(() => {
    const fetchSpecies = async () => {
      setLoading(true);
      try {
        const res = await axios.get(pokemon.species.url);
        setSpecies(res.data);
      } catch (err) {
        console.error('Species error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecies();
  }, [pokemon]);

  useEffect(() => {
    const fetchCurrentMovesPage = async () => {
      if (!pokemon.moves.length) return;
      setLoadingMoves(true);
      
      const startIndex = (movesPage - 1) * MOVES_PER_PAGE;
      const movesToFetch = pokemon.moves.slice(startIndex, startIndex + MOVES_PER_PAGE);
      
      try {
        const promises = movesToFetch.map(m => axios.get(m.move.url));
        const responses = await Promise.all(promises);
        const detailed = responses.map(res => {
          const move = res.data;
          const effect = move.effect_entries?.find(e => e.language.name === 'en')?.short_effect || 'No description';
          return {
            name: move.name.replace('-', ' '),
            type: move.type.name,
            power: move.power || '-',
            accuracy: move.accuracy || '-',
            category: move.damage_class.name,
            effect: effect
          };
        });
        setPagedMoves(detailed);
      } catch (err) {
        console.error('Moves fetch error:', err);
      } finally {
        setLoadingMoves(false);
      }
    };

    fetchCurrentMovesPage();
  }, [movesPage, pokemon]);

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

  const generations = [
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

  const getDebutGenIndex = (id) => {
    if (id <= 151) return 0; if (id <= 251) return 1; if (id <= 386) return 2; if (id <= 493) return 3;
    if (id <= 649) return 4; if (id <= 721) return 5; if (id <= 809) return 6; if (id <= 905) return 7; return 8;
  };

  const debutGenIndex = getDebutGenIndex(pokemon.id);

  const groupedEntries = generations.map((gen, index) => {
    if (index < debutGenIndex) return null;
    const entries = species?.flavor_text_entries?.filter(
      entry => entry.language.name === 'en' && gen.games.includes(entry.version.name)
    ).reduce((acc, current) => {
      const x = acc.find(item => item.flavor_text === current.flavor_text);
      if (!x) return acc.concat([{ ...current, version_names: [current.version.name] }]);
      if (!x.version_names.includes(current.version.name)) x.version_names.push(current.version.name);
      return acc;
    }, []).map(entry => ({
      text: entry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ').trim(),
      versions: entry.version_names
    })) || [];
    const gamesWithEntries = new Set(entries.flatMap(e => e.versions));
    const missingGames = gen.games.filter(g => !gamesWithEntries.has(g));
    return { ...gen, entries, missingGames };
  }).filter(gen => gen !== null && (gen.entries.length > 0 || gen.missingGames.length > 0));

  const stats = pokemon.stats.map(stat => ({
    name: stat.stat.name.replace('-', ' ').toUpperCase(),
    value: stat.base_stat,
    percent: Math.min(100, (stat.base_stat / 180) * 100),
    color: getStatColor(stat.base_stat)
  }));

  const totalMovesPages = Math.ceil(pokemon.moves.length / MOVES_PER_PAGE);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-[#16213e] rounded-3xl shadow-xl max-w-4xl mx-auto w-full border border-blue-900/30">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
        <p className="mt-6 text-xl font-semibold text-blue-100 uppercase tracking-tighter">Analizando datos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-[#16213e] rounded-3xl shadow-2xl overflow-hidden border border-blue-900/50 animate-fadeIn">
      <div className="lg:flex">
        <div className="lg:w-1/2 p-8 border-r border-blue-900/30 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <button onClick={onBack} className="mb-6 text-blue-400 hover:text-yellow-400 transition-colors flex items-center gap-2 font-black uppercase text-xs">
            <FontAwesomeIcon icon={faArrowLeft} /> Volver al Hall
          </button>
          
          <div className="flex flex-col items-center">
            <div className="relative group mb-8">
              <div className="absolute inset-0 bg-blue-500 rounded-full scale-110 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity"></div>
              <img src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} alt={pokemon.name} className="relative z-10 w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
            </div>
            
            <div className="text-center mb-8">
              <span className="text-blue-400 font-black text-xl mb-1 block tracking-widest">#{pokemon.id.toString().padStart(3, '0')}</span>
              <h1 className="text-5xl font-black capitalize text-white tracking-tighter">{pokemon.name}</h1>
              <div className="flex gap-2 mt-4 justify-center">
                {pokemon.types.map(type => (
                  <span key={type.type.name} className="px-5 py-2 rounded-xl text-white text-xs font-black shadow-lg uppercase tracking-widest" style={{ backgroundColor: typeColors[type.type.name] || '#777' }}>
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-[#1a1a2e] p-4 rounded-2xl border border-blue-900/30 text-center">
                <FontAwesomeIcon icon={faWeightHanging} className="text-blue-400 mb-2" />
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Peso</p>
                <p className="text-lg font-bold text-white">{pokemon.weight / 10} kg</p>
              </div>
              <div className="bg-[#1a1a2e] p-4 rounded-2xl border border-blue-900/30 text-center">
                <FontAwesomeIcon icon={faArrowsUpDown} className="text-green-400 mb-2" />
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Altura</p>
                <p className="text-lg font-bold text-white">{pokemon.height / 10} m</p>
              </div>
            </div>

            <div className="w-full mb-8">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div> Habilidades
              </h3>
              <div className="flex flex-wrap gap-3">
                {pokemon.abilities.map((abilityInfo) => (
                  <div key={abilityInfo.ability.name} className={`px-4 py-2 rounded-xl border flex flex-col ${abilityInfo.is_hidden ? 'bg-purple-900/10 border-purple-500/30' : 'bg-[#1a1a2e] border-blue-900/30'}`}>
                    <span className="text-sm font-bold text-white capitalize">{abilityInfo.ability.name.replace('-', ' ')}</span>
                    {abilityInfo.is_hidden && <span className="text-[8px] font-black text-purple-400 uppercase mt-0.5">Habilidad Oculta</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full mb-8">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div> Historial Pokédex
              </h3>
              <div className="bg-[#1a1a2e] rounded-2xl border border-blue-900/30 shadow-inner max-h-[300px] overflow-y-auto custom-scrollbar">
                {groupedEntries.map((gen, gIdx) => (
                  <div key={gen.id} className={`flex relative ${gIdx !== 0 ? 'border-t border-blue-900/50' : ''}`}>
                    <div className="w-16 flex-shrink-0 bg-blue-600/5 flex flex-col items-center border-r border-blue-500/10 py-6">
                      <div className="sticky top-4 flex flex-col items-center">
                        <div className="w-4 h-0.5 bg-blue-400/30 rounded-full"></div>
                        <span className="text-2xl font-black text-blue-400/40 my-1">{gen.id}</span>
                        <div className="w-4 h-0.5 bg-blue-400/30 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-grow p-5 space-y-6">
                      {gen.entries.map((entry, idx) => (
                        <div key={idx} className={idx !== 0 ? 'border-t border-blue-900/30 pt-6' : ''}>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {entry.versions.map(v => (
                              <span key={v} className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm border ${
                                v.includes('yellow') || v.includes('gold') ? 'bg-yellow-400 text-black border-yellow-500' :
                                v.includes('red') || v.includes('ruby') || v.includes('fire') ? 'bg-red-600 text-white border-red-700' :
                                v.includes('blue') || v.includes('sapphire') || v.includes('water') ? 'bg-blue-600 text-white border-blue-700' :
                                v.includes('emerald') || v.includes('leaf') ? 'bg-green-600 text-white border-green-700' :
                                v.includes('silver') || v.includes('soul') ? 'bg-gray-400 text-black border-gray-500' :
                                v.includes('crystal') || v.includes('diamond') || v.includes('x') ? 'bg-cyan-400 text-black border-cyan-500' :
                                v.includes('pearl') || v.includes('y') ? 'bg-pink-400 text-black border-pink-500' :
                                v.includes('platinum') || v.includes('white') ? 'bg-gray-100 text-black border-gray-300' :
                                v.includes('black') ? 'bg-gray-900 text-white border-black' :
                                v === 'scarlet' ? 'bg-red-800 text-white border-red-900' :
                                v === 'violet' ? 'bg-purple-800 text-white border-purple-900' :
                                'bg-blue-900 text-blue-100 border-blue-800'
                              }`}>{gameNamesEs[v] || v}</span>
                            ))}
                          </div>
                          <p className="text-blue-50 text-sm leading-relaxed italic font-medium opacity-80">"{entry.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div> Estadísticas
              </h3>
              <div className="space-y-4">
                {stats.map(stat => (
                  <div key={stat.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-gray-500 tracking-wider">{stat.name}</span>
                      <span className="text-xs font-bold text-white">{stat.value}</span>
                    </div>
                    <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stat.percent}%`, backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}44` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 p-8 bg-[#0f3460]/30 flex flex-col h-[90vh]">
          <div className="flex justify-between items-center mb-8 flex-shrink-0">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 animate-pulse" />
              Ataques ({pokemon.moves.length})
            </h3>
            <div className="flex items-center gap-4 bg-[#1a1a2e] px-4 py-1.5 rounded-xl border border-blue-900/50 shadow-lg">
              <button disabled={movesPage === 1 || loadingMoves} onClick={() => setMovesPage(p => p - 1)} className="text-blue-400 hover:text-yellow-400 disabled:opacity-30 transition-colors">
                <FontAwesomeIcon icon={faChevronLeft} size="sm" />
              </button>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Pág {movesPage} / {totalMovesPages || 1}</span>
              <button disabled={movesPage >= totalMovesPages || loadingMoves} onClick={() => setMovesPage(p => p + 1)} className="text-blue-400 hover:text-yellow-400 disabled:opacity-30 transition-colors">
                <FontAwesomeIcon icon={faChevronRight} size="sm" />
              </button>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 relative">
            {loadingMoves ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1a1a2e]/40 rounded-3xl absolute inset-0 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400 mb-4"></div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Cargando...</p>
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 pb-6">
              {pagedMoves.map((move, idx) => (
                <div key={idx} className="bg-[#1a1a2e] rounded-2xl border border-blue-900/50 p-5 hover:border-blue-400/50 transition-all group shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-black text-white capitalize group-hover:text-yellow-400 transition-colors">{move.name}</h4>
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white mt-2 inline-block shadow-md" style={{ backgroundColor: typeColors[move.type] }}>{move.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border border-white/10 ${move.category === 'physical' ? 'bg-red-900/20 text-red-400' : move.category === 'special' ? 'bg-blue-900/20 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>{move.category}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#16213e] rounded-xl p-3 border border-blue-900/30 flex flex-col items-center shadow-inner">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Poder</span>
                      <span className="text-sm font-black text-white">{move.power}</span>
                    </div>
                    <div className="bg-[#16213e] rounded-xl p-3 border border-blue-900/30 flex flex-col items-center shadow-inner">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Precisión</span>
                      <span className="text-sm font-black text-white">{move.accuracy}%</span>
                    </div>
                  </div>
                  <div className="bg-[#0f3460]/20 rounded-xl p-3 border border-blue-900/20">
                    <p className="text-[11px] text-blue-200/70 italic leading-relaxed font-medium">"{move.effect}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;