import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabase';

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
  ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
  psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

function PokemonCard({ pokemon, onSelect, currentUser, initialVoteCount, initialHasVoted, onVoteUpdate, typeMap }) {
  const [isVoting, setIsVoting] = useState(false);

  if (!pokemon) return null;

  const handleVote = async (e) => {
    e.stopPropagation();
    if (!currentUser || isVoting || initialHasVoted) return;
    setIsVoting(true);

    try {
      const { data: globalCheck, error: checkError } = await supabase
        .from('votes')
        .select('*')
        .eq('email', currentUser.email)
        .maybeSingle();

      if (checkError) throw checkError;
      if (globalCheck) {
        alert('Solo puedes votar por un Pokémon en total.');
        setIsVoting(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('votes')
        .insert([{ email: currentUser.email, pokemon_id: pokemon.id }]);

      if (insertError) throw insertError;
      if (onVoteUpdate) onVoteUpdate();
    } catch (err) {
      alert(`Error al registrar el voto: ${err.message}`);
    } finally {
      setIsVoting(false);
    }
  };

  const id = pokemon.id;
  const displayId = id?.toString().padStart(3, '0') || '???';
  const types = (typeMap && typeMap[id]) || [];

  return (
    <div
      className="group bg-[#16213e] rounded-2xl shadow-lg p-5 cursor-pointer flex flex-col items-center transition-all duration-300 ease-out hover:-translate-y-2 border border-blue-900/30 hover:border-blue-400/50 hover:bg-[#1f2b4e] w-full"
      onClick={() => onSelect && onSelect(pokemon)}
    >
      <div className="relative mb-4 w-28 h-28 flex items-center justify-center bg-[#1a1a2e] rounded-full group-hover:bg-[#0f3460] transition-colors duration-300 shadow-inner">
        {/* Sprites desactivados para diagnóstico */}
        <div className="w-16 h-16 rounded-full border-4 border-blue-900/20 flex items-center justify-center bg-blue-950/30 shadow-inner group-hover:scale-110 transition-transform duration-300">
           <span className="text-xl font-black text-blue-800 tracking-tighter opacity-40">PK</span>
        </div>
        <span className="absolute -top-1 -right-1 bg-blue-900 text-blue-200 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md border border-blue-500/20">
          #{displayId}
        </span>
      </div>

      <h3 className="text-xl font-black mb-2 text-white capitalize tracking-tighter group-hover:text-yellow-400 transition-colors truncate w-full text-center">
        {pokemon.name || 'Unknown'}
      </h3>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {types.map(typeName => (
          <div
            key={typeName}
            className="px-3 py-0.5 rounded-md text-white text-[9px] font-black uppercase tracking-widest shadow-md"
            style={{ backgroundColor: typeColors[typeName] || '#777' }}
          >
            {typeName}
          </div>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={initialHasVoted || isVoting}
        className={`mt-auto w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-xl border-b-4 ${
          initialHasVoted 
            ? 'bg-blue-900/30 text-blue-400 border-blue-900/50 cursor-default opacity-50'
            : 'bg-[#e94560] hover:bg-[#ff2e63] text-white border-[#9b1d33] hover:translate-y-[2px]'
        }`}
      >
        <FontAwesomeIcon icon={faHeart} className={initialHasVoted ? 'text-blue-500' : 'text-white'} />
        {isVoting ? '...' : initialHasVoted ? 'FAVORITO' : 'VOTAR'}
      </button>

      <div className="mt-4 flex items-center gap-2 opacity-50">
        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
        <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
          {initialVoteCount} {initialVoteCount === 1 ? 'Voto' : 'Votos'}
        </span>
      </div>
    </div>
  );
}

export default PokemonCard;