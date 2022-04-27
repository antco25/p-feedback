import { useState, useEffect, useRef } from 'react';

export default function useOutsideClick(isActive, callback) {
    const [isComponentActive, setIsComponentActive] = useState(isActive);
    const ref = useRef(null);

    const handleHideDropdown = (event) => {
        if (!isComponentActive)
            return;

        if (event.key === 'Escape') {
            callback();
        }
    };

    const handleClickOutside = (event) => {
        if (!isComponentActive)
            return;

        if (ref.current && !ref.current.contains(event.target)) {
            callback();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleHideDropdown, true);
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('keydown', handleHideDropdown, true);
            document.removeEventListener('click', handleClickOutside, true);
        };
    });

    return { ref, isComponentActive, setIsComponentActive };
}