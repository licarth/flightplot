import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

type MouseMode = 'command' | 'command+shift' | 'none';

export const MouseModeContext = createContext<{
    mouseMode: MouseMode;
}>({ mouseMode: 'none' });

export const MouseModeProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [shiftPressed, setShiftPressed] = React.useState<boolean>(false);
    const [commandPressed, setCommandPressed] = React.useState<boolean>(false);
    const onBlur = () => {
        setShiftPressed(false);
        setCommandPressed(false);
    };

    useEffect(() => {
        window.addEventListener('blur', onBlur);
        return () => {
            window.removeEventListener('blur', onBlur);
        };
    }, []);

    useHotkeys(
        '*',
        (event) => {
            const { key } = event;
            if (key === 'Shift') {
                setShiftPressed(false);
            }
            if (key === 'Meta') {
                setCommandPressed(false);
            }
        },
        { keyup: true },
    );
    useHotkeys(
        '*',
        (event) => {
            const { key } = event;

            if (key === 'Shift') {
                setShiftPressed(true);
            }
            if (key === 'Meta') {
                setCommandPressed(true);
            }
        },
        { keydown: true },
    );

    const mouseMode = (() => {
        if (commandPressed && shiftPressed) {
            return 'command+shift';
        } else if (commandPressed) {
            return 'command';
        } else {
            return 'none';
        }
    })();

    return <MouseModeContext.Provider value={{ mouseMode }}>{children}</MouseModeContext.Provider>;
};

export const useMouseMode = () => {
    return useContext(MouseModeContext);
};
