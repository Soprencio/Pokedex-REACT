import { useState, useEffect } from 'react';
import axios from 'axios';

function AbilityList({ abilities, onSelect }) {
  const [abilityDetails, setAbilityDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const newDetails = { ...abilityDetails };
      const toFetch = abilities.filter(a => !newDetails[a.name]);
      
      try {
        const responses = await Promise.all(toFetch.map(a => axios.get(a.url)));
        responses.forEach(r => {
          newDetails[r.data.name] = r.data;
        });
        setAbilityDetails(newDetails);
      } catch (e) {
        console.error("Error fetching abilities", e);
      } finally {
        setLoading(false);
      }
    };
    if (abilities.length > 0) fetchDetails();
  }, [abilities]);

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {abilities.map(ability => {
        const detail = abilityDetails[ability.name];

        return (
          <div
            key={ability.name}
            onClick={() => detail && onSelect(detail)}
            className="group relative bg-[#16213e] rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg border border-blue-900/30 hover:border-yellow-400/50 flex flex-col gap-3 h-full"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-black text-white capitalize group-hover:text-yellow-400 transition-colors">
                {ability.name.replace('-', ' ')}
              </h3>
              <div className="bg-blue-900/30 px-2 py-1 rounded text-[8px] font-black text-blue-400 uppercase tracking-tighter">
                Habilidad
              </div>
            </div>

            <p className="text-[10px] text-gray-400 line-clamp-3 italic leading-relaxed">
              {detail?.effect_entries?.find(e => e.language.name === 'en')?.short_effect || 'Cargando efecto...'}
            </p>

            <div className="mt-auto pt-2 flex items-center gap-2">
               <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
               <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">PokeVote Wiki</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AbilityList;