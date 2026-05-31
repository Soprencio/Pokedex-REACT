import PokemonCard from './PokemonCard.jsx';

function PokemonList({ pokemons, onSelect, currentUser }) {
  return (
    <div className="w-full grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
      {pokemons.map(pokemon => (
        <div key={pokemon.id} className="w-full">
          <PokemonCard pokemon={pokemon} onSelect={onSelect} currentUser={currentUser} />
        </div>
      ))}
    </div>
  );
}

export default PokemonList;