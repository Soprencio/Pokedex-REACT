import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faSave, faSearch, faTrash, faChevronLeft, faChevronRight, faChevronDown, faChevronUp, faEdit } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabase';
import axios from 'axios';
import PokemonList from './PokemonList';

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
  ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
  psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

function TeamBuilder({ 
  currentUser, 
  pokemonTypeMap, 
  onSelectPokemonDetails, 
  paginatedList,
  totalPages,
  currentPage,
  onPageChange,

  // Receive lifted state from props
  isCreating, setIsCreating,
  editingTeamId, setEditingTeamId,
  teamName, setTeamName,
  currentTeam, setCurrentTeam,
  editingSlot, setEditingSlot,
  isSelectingPokemon, setIsSelectingPokemon
}) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Local UI states for moves selection (stay local as they are deeply nested)
  const [isSelectingMove, setIsSelectingMove] = useState(false);
  const [moveSlotIndex, setMoveSlotIndex] = useState(null);
  const [moveSearchQuery, setMoveSearchQuery] = useState('');
  const [movePage, setMovePage] = useState(1);
  const [moveDetailsCache, setMoveDetailsCache] = useState({});
  const MOVES_PER_PAGE_SELECTOR = 15;

  useEffect(() => { if (currentUser) fetchTeams(); }, [currentUser]);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('teams').select('*').eq('user_email', currentUser.email).order('created_at', { ascending: false });
    if (error) console.error('Error teams:', error); else setTeams(data || []);
    setLoading(false);
  };

  const handleAddPokemon = async (summary) => {
    setLoading(true);
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${summary.id}`);
      const pokemonData = res.data;
      const newTeam = [...currentTeam];
      newTeam[editingSlot === null ? 0 : editingSlot] = { // Use editingSlot if was set, or first null
        id: pokemonData.id,
        name: pokemonData.name,
        nickname: pokemonData.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonData.id}.png`,
        types: pokemonData.types.map(t => t.type.name),
        moves: [null, null, null, null],
        ability: null,
        fullData: pokemonData
      };
      setCurrentTeam(newTeam);
      setIsSelectingPokemon(false);
      setEditingSlot(editingSlot); // Keep focus
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadMoveDetails = async (movesToFetch) => {
    const newCache = { ...moveDetailsCache };
    const missing = movesToFetch.filter(m => !newCache[m.move.name]);
    if (missing.length === 0) return;
    try {
      const responses = await Promise.all(missing.map(m => axios.get(m.move.url)));
      responses.forEach(res => {
        const d = res.data;
        newCache[d.name] = {
          type: d.type.name, power: d.power, accuracy: d.accuracy, category: d.damage_class.name,
          effect: d.effect_entries?.find(e => e.language.name === 'en')?.short_effect || 'Sin registros.'
        };
      });
      setMoveDetailsCache(newCache);
    } catch (e) { console.error('Error moves:', e); }
  };

  useEffect(() => {
    if (isSelectingMove && editingSlot !== null) {
      const editingPokemon = currentTeam[editingSlot];
      const filtered = editingPokemon?.fullData?.moves?.filter(m => m.move.name.includes(moveSearchQuery.toLowerCase())) || [];
      const pageItems = filtered.slice((movePage - 1) * MOVES_PER_PAGE_SELECTOR, movePage * MOVES_PER_PAGE_SELECTOR);
      loadMoveDetails(pageItems);
    }
  }, [isSelectingMove, movePage, moveSearchQuery, editingSlot]);

  const saveTeam = async () => {
    const members = currentTeam.filter(p => p !== null).map(p => ({
      id: p.id, name: p.name, nickname: p.nickname, moves: p.moves, ability: p.ability
    }));
    if (members.length === 0) return alert('Agrega al menos un Pokémon');
    const finalName = teamName || `Equipo #${teams.length + 1}`;
    let error;
    if (editingTeamId) {
      error = (await supabase.from('teams').update({ team_name: finalName, members }).eq('id', editingTeamId)).error;
    } else {
      error = (await supabase.from('teams').insert([{ user_email: currentUser.email, team_name: finalName, members }])).error;
    }
    if (error) alert(error.message); else { setIsCreating(false); setEditingTeamId(null); setTeamName(''); setCurrentTeam(Array(6).fill(null)); fetchTeams(); }
  };

  const handleModifyTeam = (team) => {
    setEditingTeamId(team.id);
    setTeamName(team.team_name || '');
    const newTeam = Array(6).fill(null);
    team.members.forEach((member, i) => { if (i < 6) newTeam[i] = { ...member, sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${member.id}.png` }; });
    setCurrentTeam(newTeam);
    setIsCreating(true);
  };

  const loadFullDataForEditing = async (index) => {
    if (currentTeam[index].fullData) { setEditingSlot(index); return; }
    setLoading(true);
    try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${currentTeam[index].id}`);
        const nt = [...currentTeam];
        nt[index].fullData = res.data;
        nt[index].types = res.data.types.map(t => t.type.name);
        setCurrentTeam(nt);
        setEditingSlot(index);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (isSelectingPokemon) {
    return (
      <div className="animate-fadeIn w-full flex flex-col gap-6">
        <div className="flex justify-between items-center bg-[#16213e] p-6 rounded-[30px] border border-blue-900/30 shadow-xl">
          <h2 className="text-xl font-black text-white uppercase tracking-widest leading-none">Seleccionar Miembro</h2>
          <button onClick={() => setIsSelectingPokemon(false)} className="bg-red-600/20 text-red-500 px-6 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-md">Cancelar Selección</button>
        </div>
        <PokemonList pokemons={paginatedList} onSelect={onSelectPokemonDetails} currentUser={currentUser} voteCounts={{}} userVotes={[]} onVoteUpdate={() => {}} typeMap={pokemonTypeMap} mode="add" onAdd={handleAddPokemon} />
      </div>
    );
  }

  if (isCreating) {
    const editingPokemon = editingSlot !== null ? currentTeam[editingSlot] : null;

    return (
      <div className="animate-fadeIn w-full max-w-[1400px] mx-auto flex flex-col gap-10 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#16213e] p-8 rounded-[40px] border border-blue-900/20 shadow-2xl gap-6">
          <button onClick={() => { setIsCreating(false); setEditingTeamId(null); setCurrentTeam(Array(6).fill(null)); }} className="text-blue-400 font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2 hover:text-white transition-colors shrink-0"><FontAwesomeIcon icon={faTimes} /> Volver</button>
          <div className="flex-1 flex flex-col items-center">
             <div className="flex items-center gap-3">
                <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={editingTeamId ? "Editar Nombre..." : `Equipo #${teams.length + 1}`} className="bg-transparent border-b-2 border-blue-900 focus:border-yellow-400 text-2xl md:text-3xl font-black text-white text-center outline-none transition-all placeholder-blue-900/50 uppercase tracking-tighter w-full max-w-md" />
                <FontAwesomeIcon icon={faEdit} className="text-blue-900/30 text-xs" />
             </div>
          </div>
          <button onClick={saveTeam} className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center gap-4 transition-all active:scale-95 shrink-0 border-b-4 border-green-800"><FontAwesomeIcon icon={faSave} /> {editingTeamId ? 'Actualizar' : 'Guardar'}</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {currentTeam.map((slot, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <button 
                onClick={() => { setEditingSlot(idx); setIsSelectingPokemon(true); }}
                className={`aspect-square rounded-[40px] border-4 border-dashed transition-all flex flex-col items-center justify-center gap-4 group relative overflow-hidden ${slot ? 'border-blue-500 bg-[#16213e] shadow-2xl scale-105' : 'border-blue-900/20 bg-blue-900/5 hover:bg-blue-900/10 hover:border-blue-500/50'}`}
              >
                {slot ? (
                  <>
                    <div className="w-full h-full p-4 flex items-center justify-center">
                       <img src={slot.sprite} alt="pk" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="absolute bottom-2 left-0 right-0 text-center"><span className="bg-blue-600 px-3 py-0.5 rounded-full text-[8px] font-black text-white uppercase shadow-lg">Slot #{idx + 1}</span></div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-900/10 flex items-center justify-center border-2 border-blue-900/20 group-hover:bg-blue-600 transition-colors"><FontAwesomeIcon icon={faPlus} className="text-blue-900/50 group-hover:text-white" /></div><span className="text-[8px] font-black text-blue-900/40 uppercase tracking-widest">Añadir</span></div>
                )}
              </button>
              {slot && (
                <button onClick={() => loadFullDataForEditing(idx)} className={`py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md ${editingSlot === idx ? 'bg-yellow-400 text-black border-b-4 border-yellow-700' : 'bg-[#0f3460] text-blue-400 hover:bg-blue-600 hover:text-white border-b-4 border-blue-900'}`}>{editingSlot === idx ? 'Ocultar' : 'Ajustar'}</button>
              )}
            </div>
          ))}
        </div>

        {editingPokemon && (
          <div className="bg-[#16213e] rounded-[50px] p-10 border border-blue-900/50 shadow-2xl animate-slideUp relative">
            <button onClick={() => setEditingSlot(null)} className="absolute top-8 right-8 text-gray-600 hover:text-red-500 transition-colors"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex flex-col items-center gap-8 lg:w-1/3 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-10"></div>
                    <div className="w-56 h-56 bg-[#1a1a2e] rounded-full flex items-center justify-center shadow-inner border-4 border-blue-900/30 relative z-10">
                        <img src={editingPokemon.sprite} alt="pk" className="w-44 h-44 object-contain" />
                    </div>
                </div>
                <div className="w-full">
                   <p className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.3em] mb-3">Mote Personalizado</p>
                   <input type="text" value={editingPokemon.nickname} onChange={(e) => { const nt = [...currentTeam]; nt[editingSlot].nickname = e.target.value; setCurrentTeam(nt); }} className="w-full bg-[#1a1a2e] border-2 border-blue-900/50 rounded-2xl py-4 px-6 text-white text-center text-xl font-black focus:border-yellow-400 outline-none transition-all shadow-inner" />
                </div>
                <div className="w-full flex flex-col gap-4 text-left">
                  <p className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.3em] ml-2">Habilidad</p>
                  {editingPokemon.fullData?.abilities?.map(a => {
                    const isSel = editingPokemon.ability === a.ability.name;
                    return (
                      <button key={a.ability.name} onClick={() => { const nt = [...currentTeam]; nt[editingSlot].ability = a.ability.name; setCurrentTeam(nt); }} className={`w-full p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${isSel ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-black/20 border-white/5 hover:border-blue-900'}`}>
                          <span className={`text-sm font-black capitalize block mb-1 ${isSel ? 'text-yellow-400' : 'text-white'}`}>{a.ability.name.replace('-', ' ')}</span>
                          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{a.is_hidden ? 'Oculta' : 'Estándar'}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3"><div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div> Configurar Ataques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editingPokemon.moves.map((moveName, mIdx) => {
                    const d = moveDetailsCache[moveName];
                    const color = moveName && d ? typeColors[d.type] : '#333';
                    return (
                        <div key={mIdx} className="flex flex-col gap-2">
                          <button onClick={() => { setMoveSlotIndex(mIdx); setIsSelectingMove(moveSlotIndex === mIdx ? !isSelectingMove : true); setMovePage(1); }} className="w-full p-6 rounded-3xl border-2 text-left transition-all flex flex-col gap-3 relative overflow-hidden" style={{ borderColor: moveName && d ? `${color}60` : '#1a1a2e', backgroundColor: moveName && d ? `${color}10` : 'rgba(0,0,0,0.1)' }}>
                            <div className="flex justify-between items-start w-full">
                               <div className="flex flex-col"><span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Slot #{mIdx + 1}</span><span className={`font-black uppercase tracking-tighter leading-none ${moveName ? 'text-white text-base' : 'text-gray-700 text-sm'}`}>{moveName ? moveName.replace('-', ' ') : 'Seleccionar Ataque'}</span></div>
                               <FontAwesomeIcon icon={isSelectingMove && moveSlotIndex === mIdx ? faChevronUp : faChevronDown} className="text-blue-900/30" />
                            </div>
                            {moveName && d && (
                                <>
                                    <div className="flex gap-2 items-center"><span className="px-2 py-0.5 rounded text-[7px] font-black text-white uppercase" style={{ backgroundColor: color }}>{d.type}</span><span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">{d.category}</span></div>
                                    <div className="grid grid-cols-2 gap-2"><div className="bg-black/20 p-2 rounded-lg text-center"><span className="block text-[7px] text-gray-500 uppercase">Poder</span><span className="text-xs font-bold text-white">{d.power || '--'}</span></div><div className="bg-black/20 p-2 rounded-lg text-center"><span className="block text-[7px] text-gray-500 uppercase">Prec.</span><span className="text-xs font-bold text-white">{d.accuracy ? `${d.accuracy}%` : '--'}</span></div></div>
                                    <p className="text-[9px] text-gray-400 italic line-clamp-2 leading-tight">"{d.effect}"</p>
                                </>
                            )}
                          </button>
                          {isSelectingMove && moveSlotIndex === mIdx && (
                            <div className="bg-[#1a1a2e] rounded-[30px] border border-blue-400/30 overflow-hidden shadow-2xl animate-fadeIn z-50">
                              <div className="p-5 border-b border-blue-900/30 flex flex-col gap-4 bg-black/20">
                                <div className="relative"><input type="text" placeholder="Filtrar ataques..." value={moveSearchQuery} onChange={(e) => { setMoveSearchQuery(e.target.value); setMovePage(1); }} className="w-full bg-[#16213e] border border-blue-900/50 rounded-xl py-3 px-5 pl-10 text-xs text-white focus:border-yellow-400 outline-none" /><FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-900" /></div>
                                <div className="flex justify-between items-center"><span className="text-[9px] font-black text-blue-500 uppercase">Página {movePage}</span><div className="flex gap-2"><button disabled={movePage === 1} onClick={() => setMovePage(p => p - 1)} className="w-8 h-8 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center disabled:opacity-10"><FontAwesomeIcon icon={faChevronLeft} size="xs" /></button><button onClick={() => setMovePage(p => p + 1)} className="w-8 h-8 rounded-lg bg-blue-900/20 text-blue-400 flex items-center justify-center"><FontAwesomeIcon icon={faChevronRight} size="xs" /></button></div></div>
                              </div>
                              <div className="max-h-[300px] overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
                                {editingPokemon.fullData?.moves?.filter(m => m.move.name.toLowerCase().includes(moveSearchQuery.toLowerCase())).slice((movePage-1)*MOVES_PER_PAGE_SELECTOR, movePage*MOVES_PER_PAGE_SELECTOR).map(m => {
                                      const md = moveDetailsCache[m.move.name];
                                      return (
                                        <button key={m.move.name} onClick={() => { const nt = [...currentTeam]; nt[editingSlot].moves[moveSlotIndex] = m.move.name; setCurrentTeam(nt); setIsSelectingMove(false); setMoveSearchQuery(''); }} className="p-4 bg-black/20 hover:bg-blue-600 rounded-2xl text-left transition-all border border-transparent hover:border-white/20 flex justify-between items-center group">
                                           <div className="flex flex-col"><span className="text-xs font-black text-white capitalize">{m.move.name.replace('-', ' ')}</span>{md && <div className="flex gap-2 mt-1"><span className="text-[7px] font-black uppercase text-blue-400">{md.type}</span><span className="text-[7px] font-black uppercase text-gray-500">{md.category}</span></div>}</div>
                                           {md && <div className="text-[10px] font-black text-white opacity-40">P: {md.power || '--'} | A: {md.accuracy || '--'}</div>}
                                        </button>
                                      );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full flex flex-col gap-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-left"><h2 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">Gestión de Equipos</h2><p className="text-blue-400 text-xs font-black uppercase tracking-[0.4em] opacity-60">Competitive Strategy Hub</p></div>
        <button onClick={() => { setIsCreating(true); setCurrentTeam(Array(6).fill(null)); }} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[25px] font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 border-b-8 border-blue-800">Nuevo Escuadrón</button>
      </div>
      <div className="flex flex-col gap-8">
        {teams.map((team, tIdx) => (
          <div key={team.id} className="bg-[#16213e] p-10 rounded-[50px] border border-blue-900/30 flex flex-col lg:flex-row items-center gap-12 shadow-2xl hover:border-blue-400/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex flex-wrap justify-center gap-4">
              {team.members.map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-[30px] bg-[#1a1a2e] border-4 border-[#16213e] flex items-center justify-center shadow-xl relative group-hover:scale-105 transition-transform duration-500">
                        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`} alt="pk" className="w-16 h-16 object-contain" />
                    </div>
                    <span className="text-[9px] font-black text-blue-400 capitalize tracking-tighter">{p.nickname}</span>
                </div>
              ))}
            </div>
            <div className="flex-1 text-center lg:text-left">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{team.team_name || `Equipo #${teams.length - tIdx}`}</h3>
               <div className="flex flex-wrap justify-center lg:justify-start gap-3"><span className="bg-blue-900/20 px-4 py-1.5 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest border border-blue-500/20">Estrategia PokéVote</span></div>
            </div>
            <div className="flex gap-4">
               <button onClick={async () => { if(confirm('¿Borrar este equipo?')) { await supabase.from('teams').delete().eq('id', team.id); fetchTeams(); } }} className="w-14 h-14 rounded-[20px] bg-red-950/20 text-red-500 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-lg"><FontAwesomeIcon icon={faTrash} size="lg" /></button>
               <button onClick={() => handleModifyTeam(team)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-2xl transition-all border-b-4 border-blue-900 active:translate-y-1 active:border-b-0">Modificar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamBuilder;