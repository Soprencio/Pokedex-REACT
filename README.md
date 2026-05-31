# PokéApp

Una aplicación interactiva construida con React, Tailwind CSS y PokéAPI que muestra todos los Pokemons.

## Características

- **Lista de Pokémon:** Visualización en cuadrícula responsiva.
- **Tarjetas Interactivas:** Cada Pokémon se muestra en una tarjeta con su arte oficial, nombre, número de ID y tipos.
- **Detalles Expandidos:** Al hacer clic en un Pokémon, se muestra una vista detallada con:
  - Descripción oficial de la Pokédex.
  - Estadísticas base (HP, Ataque, Defensa, etc.) con barras de progreso animadas.
  - Peso, altura y habilidades.
- **Diseño Moderno:** Interfaz limpia con animaciones de entrada, efectos de hover y feedback táctil.
- **Sistema de Votación (Demo):** Interfaz preparada para un sistema de votación de Pokémon favoritos.

## Tecnologías Utilizadas

- **React 19**
- **Vite**
- **Tailwind CSS**
- **Axios** (para peticiones a la API)
- **FontAwesome** (iconografía)

## Cómo Ejecutar

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estrategia de Votación (LocalStorage)

Para implementar el sistema de votación solicitado:
1. **Almacenamiento:** Usaríamos `localStorage` para guardar el ID del Pokémon votado por el usuario (ej: `votedPokemonId: 25`).
2. **Restricción:** Antes de registrar un voto, verificaríamos si ya existe un valor en `localStorage`. Si existe, se le notifica al usuario que ya ha votado.
3. **Persistencia Global:** Dado que `localStorage` es local al navegador, para un conteo real de votos por todos los usuarios, se requeriría una base de datos (Firebase, Supabase, etc.).
4. **Verificación de Identidad:** Para asegurar "1 voto por persona" real, lo ideal sería integrar autenticación (OAuth con Google/GitHub) y guardar el voto asociado al correo electrónico del usuario en el servidor.
