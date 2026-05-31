import PokemonCard from './PokemonCard.jsx';

function PokemonList({ pokemons, onSelect, currentUser, voteCounts, userVotes, onVoteUpdate }) {
  return (
    <div className="w-full grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
      {pokemons.map(pokemon => (
        <div key={pokemon.id} className="w-full">
          <PokemonCard 
            pokemon={pokemon} 
            onSelect={onSelect} 
            currentUser={currentUser} 
            initialVoteCount={voteCounts[pokemon.id] || 0}
            initialHasVoted={userVotes?.some(v => v.email === currentUser?.email && v.pokemon_id === pokemon.id)}
            onVoteUpdate={onVoteUpdate}
          />
        </div>
      ))}
    </div>
  );
}

export default PokemonList;