import { useState, useEffect } from 'react';
import axios from 'axios';

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
  ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
  psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

function MoveList({ moves, onSelect, selectedTypes, moveTypeMap }) {
  const [moveDetails, setMoveDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const newDetails = { ...moveDetails };
      const toFetch = moves.filter(m => !newDetails[m.name]);
      
      try {
        const responses = await Promise.all(toFetch.map(m => axios.get(`https://pokeapi.co/api/v2/move/${m.id}`)));
        responses.forEach(r => {
          newDetails[r.data.name] = r.data;
        });
        setMoveDetails(newDetails);
      } catch (e) {
        console.error("Error fetching moves", e);
      } finally {
        setLoading(false);
      }
    };
    if (moves.length > 0) fetchDetails();
  }, [moves]);

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {moves.map(move => {
        const detail = moveDetails[move.name];
        const type = moveTypeMap[move.id] || 'normal';
        const color = typeColors[type];

        return (
          <div
            key={move.name}
            onClick={() => detail && onSelect(detail)}
            className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg border border-white/5 overflow-hidden flex flex-col gap-3 h-[200px] ${!detail ? 'animate-pulse opacity-50' : ''}`}
            style={{ 
              backgroundColor: `${color}15`,
              borderColor: `${color}40`
            }}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-black text-white capitalize truncate pr-2 group-hover:text-yellow-400 transition-colors">
                {move.name.replace('-', ' ')}
              </h3>
              <div 
                className="px-3 py-1 rounded-md text-[10px] font-black uppercase text-white shadow-md"
                style={{ backgroundColor: color }}
              >
                {type}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-auto">
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <span className="block text-[8px] text-gray-400 font-black uppercase">Poder</span>
                <span className="text-xs font-bold text-white">{detail?.power || '--'}</span>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <span className="block text-[8px] text-gray-400 font-black uppercase">Prec.</span>
                <span className="text-xs font-bold text-white">{detail?.accuracy ? `${detail.accuracy}%` : '--'}</span>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <span className="block text-[8px] text-gray-400 font-black uppercase">Cat.</span>
                {detail && (
                    <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/emerald/${detail.damage_class.name}.png`}
                    alt="cat"
                    className="h-3 mx-auto mt-0.5 invert opacity-70"
                    />
                )}
              </div>
            </div>

            <p className="text-[10px] text-gray-300 line-clamp-2 italic leading-relaxed opacity-80 h-8">
              {detail?.effect_entries?.find(e => e.language.name === 'en')?.short_effect.replace('$effect_chance', detail.effect_chance) || 'Cargando registros...'}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default MoveList;