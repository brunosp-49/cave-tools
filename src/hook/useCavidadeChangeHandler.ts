import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateCavidadeData } from '../redux/cavitySlice';
// Adjust the import path based on your project structure

/**
 * A custom hook that provides a memoized change handler function
 * for form inputs linked to the cavity slice state.
 * It expects input elements to have a 'name' attribute corresponding
 * to the state path (using dot notation, e.g., "entradas.0.coordenadas.utm.utm_e").
 */
export function useCavidadeChangeHandler() {
  const dispatch = useDispatch();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = event.target;
      const name = target.name; // Path to the state field (e.g., "nome_cavidade", "entradas.0.foto")

      // Ensure the input has a name attribute, otherwise we don't know where to update
      if (!name) {
        console.warn('Input element is missing a crucial "name" attribute for state updates.', target);
        return;
      }

      // Determine the correct value from the input event
      let value: any;
      if (target instanceof HTMLInputElement) {
        switch (target.type) {
          case 'checkbox':
            value = target.checked;
            break;
          case 'number':
            // Handle empty string for optional numbers, otherwise parse
            value = target.value === '' ? undefined : parseFloat(target.value);
             // Handle NaN case if parsing fails
            if (isNaN(value)) {
                value = undefined; // Or null, or keep original string? Depends on requirements.
            }
            break;
          case 'file':
              // Handle file inputs if needed (value might be target.files)
              // This example doesn't handle file uploads, just placeholder
              value = target.files; // Or process files as needed
              console.warn(`File input change detected for '${name}'. Implement file handling logic.`);
              break;
          default:
            value = target.value; // Default for text, email, password, etc.
        }
      } else {
        // For <select> and <textarea>
        value = target.value;
      }

      // Parse the name attribute (e.g., "entradas.0.foto") into a path array (e.g., ['entradas', 0, 'foto'])
      const path = name.split('.').map(part => {
        // Convert parts that are purely digits into numbers (for array indices)
        return /^\d+$/.test(part) ? parseInt(part, 10) : part;
      });

      // Dispatch the generic update action
      dispatch(updateCavidadeData({ path, value }));
    },
    [dispatch] // useCallback dependency
  );

  // Return the memoized handler function
  return handleChange;
}