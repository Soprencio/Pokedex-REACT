import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronLeft, faChevronRight, faBolt } from '@fortawesome/free-solid-svg-icons';

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
  ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
  psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
  dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

function MoveDetails({ move, onBack, onSelectPokemon }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const learners = move.learned_by_pokemon || [];
  const totalPages = Math.ceil(learners.length / itemsPerPage);
  const paginatedLearners = learners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const type = move.type.name;
  const color = typeColors[type];

  return (
    <div className="animate-fadeIn w-full max-w-6xl mx-auto flex flex-col gap-8 pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-blue-400 hover:text-white font-black uppercase text-[10px] tracking-widest self-start">
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </button>

      <div className="bg-[#16213e] rounded-[40px] p-8 shadow-2xl border-b-8 relative overflow-hidden" style={{ borderBottomColor: color }}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <span className="px-5 py-1.5 rounded-full text-white font-black text-xs uppercase tracking-tighter mb-4 inline-block" style={{ backgroundColor: color }}>{type}</span>
            <h2 className="text-5xl md:text-7xl font-black text-white capitalize mb-6 tracking-tighter">{move.name.replace('-', ' ')}</h2>
            <p className="text-xl text-gray-300 italic max-w-2xl">
              {move.effect_entries?.find(e => e.language.name === 'en')?.effect.replace('$effect_chance', move.effect_chance) || 'Sin descripción.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-black/40 p-6 rounded-3xl text-center border border-white/5">
                <span className="block text-[10px] text-gray-500 uppercase mb-1">Poder</span>
                <span className="text-3xl font-black text-white">{move.power || '--'}</span>
             </div>
             <div className="bg-black/40 p-6 rounded-3xl text-center border border-white/5">
                <span className="block text-[10px] text-gray-500 uppercase mb-1">Precisión</span>
                <span className="text-3xl font-black text-white">{move.accuracy ? `${move.accuracy}%` : '--'}</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Quién lo aprende</h3>
          <div className="flex items-center gap-3">
             <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="w-8 h-8 rounded-lg bg-blue-900/20 disabled:opacity-20 transition-all"><FontAwesomeIcon icon={faChevronLeft} /></button>
             <span className="text-[10px] font-black text-gray-500">{currentPage} / {totalPages || 1}</span>
             <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="w-8 h-8 rounded-lg bg-blue-900/20 disabled:opacity-20 transition-all"><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {paginatedLearners.map(p => {
            const id = p.url.split('/').filter(Boolean).pop();
            return (
              <div key={p.name} onClick={() => onSelectPokemon(p)} className="bg-[#16213e] p-4 rounded-3xl border border-blue-900/30 hover:border-yellow-400/50 cursor-pointer transition-all group flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-[#1a1a2e] flex items-center justify-center relative shadow-inner overflow-hidden">
                   <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                    alt={p.name}
                    className="w-12 h-12 object-contain z-10 group-hover:scale-110 transition-transform"
                    onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
                   />
                </div>
                <span className="text-xs font-black text-white capitalize text-center">{p.name.replace('-', ' ')}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MoveDetails;