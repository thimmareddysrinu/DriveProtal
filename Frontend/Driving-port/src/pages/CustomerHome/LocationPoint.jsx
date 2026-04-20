import { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import '../CustomerHome/Locationpoint.css'
import { FaLocationArrow } from "react-icons/fa";

const LocationInput = ({ placeholder, field, setSearchInput,value }) => {
  const inputRef = useRef(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      componentRestrictions: { country: 'in' },
      fields: ['geometry', 'formatted_address']
    };

    const autocomplete = new places.Autocomplete(inputRef.current, options);

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place?.geometry?.location) return;

      setSearchInput(prev => ({
        ...prev,
        [`${field}_address`]: place.formatted_address || '',
        [`${field}_lat`]: place.geometry.location.lat(),
        [`${field}_lon`]: place.geometry.location.lng()
      }));
    });

    return () => {
      if (listener) listener.remove();
    };
  }, [places, field, setSearchInput]);
   useEffect(() => {
    if (inputRef.current && value !== undefined) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
   <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
       defaultValue={value || ''}  
      className="location-input"
   />
   
  
  
   
   
  );
};

export default LocationInput;