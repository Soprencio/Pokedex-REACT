import PokemonCard from './PokemonCard.jsx';

function PokemonList({ pokemons, onSelect, currentUser, voteCounts, userVotes, onVoteUpdate, typeMap, mode = 'vote', onAdd }) {
  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 justify-items-center">
      {pokemons?.map(pokemon => (
        <div key={pokemon.id} className="w-full max-w-[320px]">
          <PokemonCard 
            pokemon={pokemon} 
            onSelect={onSelect} 
            currentUser={currentUser} 
            initialVoteCount={(voteCounts && voteCounts[pokemon.id]) || 0}
            initialHasVoted={userVotes?.some(v => v.email === currentUser?.email && v.pokemon_id === pokemon.id)}
            onVoteUpdate={onVoteUpdate}
            typeMap={typeMap}
            mode={mode}
            onAdd={onAdd}
          />
        </div>
      ))}
    </div>
  );
}

export default PokemonList;