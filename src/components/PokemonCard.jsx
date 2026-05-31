import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../supabase';

const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

function PokemonCard({ pokemon, onSelect, currentUser, initialVoteCount, initialHasVoted, onVoteUpdate }) {
  const [isVoting, setIsVoting] = useState(false);

  if (!pokemon) return null;

  const handleVote = async (e) => {
    e.stopPropagation();
    if (!currentUser || isVoting || initialHasVoted) return;

    setIsVoting(true);

    try {
      // Check if user already voted globally
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

      // Insert real vote
      const { error: insertError } = await supabase
        .from('votes')
        .insert([{ email: currentUser.email, pokemon_id: pokemon.id }]);

      if (insertError) throw insertError;

      alert(`¡Has votado por ${pokemon.name.toUpperCase()}!`);
      if (onVoteUpdate) onVoteUpdate(); // Refresh global counts in App.jsx
    } catch (err) {
      console.error('Error al votar:', err.message);
      alert(`Error al registrar el voto: ${err.message}`);
    } finally {
      setIsVoting(false);
    }
  };

  const sprite = pokemon.sprites?.other?.['official-artwork']?.front_default || 
                 pokemon.sprites?.front_default || 
                 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

  const id = pokemon.id ? pokemon.id.toString().padStart(3, '0') : '???';

  return (
    <div
      className="group bg-[#16213e] rounded-xl shadow-lg p-4 cursor-pointer flex flex-col items-center transition-all duration-300 ease-out hover:-translate-y-2 border border-blue-900/30 hover:border-blue-500/50"
      onClick={() => onSelect && onSelect(pokemon)}
    >
      <div className="relative mb-3 w-24 h-24 flex items-center justify-center bg-[#1a1a2e] rounded-full group-hover:bg-[#0f3460] transition-colors duration-300">
        <img
          src={sprite}
          alt={pokemon.name || 'Pokemon'}
          className="w-20 h-20 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
        />
        <span className="absolute -top-1 -right-1 bg-blue-900 text-blue-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-md">
          #{id}
        </span>
      </div>

      <h3 className="text-lg font-bold mb-2 text-white capitalize tracking-tight group-hover:text-yellow-400 transition-colors">
        {pokemon.name || 'Unknown'}
      </h3>

      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {pokemon.types?.map(type => {
          const bgColor = typeColors[type.type.name] || '#777';
          return (
            <div
              key={type.type.name}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-white text-[10px] font-bold shadow-sm"
              style={{ backgroundColor: bgColor }}
            >
              {type.type.name.toUpperCase()}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleVote}
        disabled={initialHasVoted || isVoting}
        className={`mt-auto w-full py-2.5 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-lg border-b-4 ${
          initialHasVoted 
            ? 'bg-blue-900/30 text-blue-400 border-blue-900/50 cursor-default opacity-50'
            : 'bg-[#e94560] hover:bg-[#ff2e63] text-white border-[#9b1d33] hover:translate-y-[1px] hover:border-b-2'
        }`}
      >
        <FontAwesomeIcon icon={faHeart} className={initialHasVoted ? 'text-blue-500' : 'text-white'} />
        {isVoting ? 'PROCESANDO...' : initialHasVoted ? 'MI FAVORITO' : 'VOTAR'}
      </button>

      <div className="mt-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
        <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
          {initialVoteCount} {initialVoteCount === 1 ? 'Voto Global' : 'Votos Globales'}
        </span>
      </div>
    </div>
  );
}

export default PokemonCard;