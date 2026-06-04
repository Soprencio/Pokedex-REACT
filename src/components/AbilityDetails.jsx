import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronLeft, faChevronRight, faStar } from '@fortawesome/free-solid-svg-icons';

function AbilityDetails({ ability, onBack, onSelectPokemon }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const users = ability.pokemon || [];
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="animate-fadeIn w-full max-w-6xl mx-auto flex flex-col gap-8 pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-blue-400 hover:text-white font-black uppercase text-[10px] tracking-widest self-start">
        <FontAwesomeIcon icon={faArrowLeft} /> Volver
      </button>

      <div className="bg-[#16213e] rounded-[40px] p-8 md:p-12 shadow-2xl border-b-8 border-yellow-400 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white capitalize mb-6 tracking-tighter">{ability.name.replace('-', ' ')}</h2>
          <div className="bg-black/20 p-8 rounded-3xl border border-white/5">
            <p className="text-xl md:text-2xl text-gray-300 italic leading-relaxed">
              {ability.effect_entries?.find(e => e.language.name === 'en')?.effect || 'Sin descripción disponible.'}
            </p>
          </div>
        </div>
        <FontAwesomeIcon icon={faStar} className="absolute -top-10 -right-10 text-[20rem] opacity-5 rotate-12 pointer-events-none text-yellow-400" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Pokémon con esta habilidad</h3>
          <div className="flex items-center gap-3">
             <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="w-8 h-8 rounded-lg bg-blue-900/20 disabled:opacity-20 transition-all"><FontAwesomeIcon icon={faChevronLeft} /></button>
             <span className="text-[10px] font-black text-gray-500">{currentPage} / {totalPages || 1}</span>
             <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="w-8 h-8 rounded-lg bg-blue-900/20 disabled:opacity-20 transition-all"><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {paginatedUsers.map(u => {
            const p = u.pokemon;
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

export default AbilityDetails;