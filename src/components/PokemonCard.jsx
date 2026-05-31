import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

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

function PokemonCard({ pokemon, onSelect, currentUser }) {
  const [voteCount, setVoteCount] = useState(0);
  const [hasVotedForThis, setHasVotedForThis] = useState(false);

  useEffect(() => {
    if (!pokemon) return;

    const allVotes = JSON.parse(localStorage.getItem('pokedex_votes') || '[]');
    const count = allVotes.filter(v => v.pokemonId === pokemon.id).length;
    setVoteCount(count);

    if (currentUser) {
      const userVote = allVotes.find(v => v.email === currentUser.email && v.pokemonId === pokemon.id);
      setHasVotedForThis(!!userVote);
    }
  }, [pokemon, currentUser]);

  if (!pokemon) return null;

  const handleVote = (e) => {
    e.stopPropagation();
    if (!currentUser) return;

    const allVotes = JSON.parse(localStorage.getItem('pokedex_votes') || '[]');
    const existingVote = allVotes.find(v => v.email === currentUser.email);

    if (existingVote) {
      if (existingVote.pokemonId === pokemon.id) {
        alert('Ya has votado por este Pokémon.');
      } else {
        alert('Solo puedes votar por un Pokémon en total. Ya has votado por otro.');
      }
      return;
    }

    const newVote = { email: currentUser.email, pokemonId: pokemon.id };
    allVotes.push(newVote);
    localStorage.setItem('pokedex_votes', JSON.stringify(allVotes));
    
    setVoteCount(prev => prev + 1);
    setHasVotedForThis(true);
    alert(`¡Has votado por ${pokemon.name.toUpperCase()}!`);
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
        <span className="absolute -top-1 -right-1 bg-blue-900 text-blue-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
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
        disabled={hasVotedForThis}
        className={`mt-auto w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-md ${
          hasVotedForThis 
            ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30 cursor-default'
            : 'bg-[#e94560] hover:bg-[#ff2e63] text-white'
        }`}
      >
        <FontAwesomeIcon icon={faHeart} className={hasVotedForThis ? 'text-blue-400' : 'text-white'} />
        {hasVotedForThis ? 'VOTADO' : 'VOTAR'}
      </button>

      <div className="mt-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
        {voteCount} {voteCount === 1 ? 'Voto' : 'Votos'}
      </div>
    </div>
  );
}

export default PokemonCard;