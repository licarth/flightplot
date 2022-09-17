import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

type ModalProps = {
    children: React.ReactNode;
    fade: boolean;
    defaultOpened: boolean;
};

export type ModalHandle = {
    open: () => void;
    close: () => void;
};

const Component = (
    { children, fade = false, defaultOpened = false }: ModalProps,
    ref: React.ForwardedRef<ModalHandle>,
) => {
    const [modalElement, setModalElement] = useState<HTMLElement | null>();
    // const modalElement = document.getElementById('modal-root');
    const [isOpen, setIsOpen] = useState(defaultOpened);
    useEffect(() => {
        setModalElement(document.getElementById('modal-root'));
    }, []);
    const close = useCallback(() => setIsOpen(false), []);

    useImperativeHandle(
        ref,
        () => ({
            open: () => setIsOpen(true),
            close,
        }),
        [close],
    );

    const handleEscape = useCallback(
        (event) => {
            if (event.keyCode === 27) close();
        },
        [close],
    );

    useEffect(() => {
        if (isOpen) document.addEventListener('keydown', handleEscape, false);
        return () => {
            document.removeEventListener('keydown', handleEscape, false);
        };
    }, [handleEscape, isOpen]);

    return modalElement ? (
        createPortal(
            isOpen ? (
                <ModalContainer fade={fade}>
                    <ModalOverlay onClick={close} />
                    <ModalClose role="button" aria-label="close" onClick={close}>
                        x
                    </ModalClose>
                    <ModalBody>{children}</ModalBody>
                </ModalContainer>
            ) : null,
            modalElement,
        )
    ) : (
        <></>
    );
};
const newLocal = forwardRef<ModalHandle, ModalProps>(Component);

export default newLocal;

const ModalContainer = styled.div<{ fade: boolean }>`
    @media screen {
        position: fixed;
        overflow: hidden;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.65);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5em 1em;
        z-index: 999999;
        box-sizing: border-box;

        ${({ fade }) =>
            fade
                ? `animation: fade-in 1s 1 linear;
      animation-fill-mode: forwards;
      opacity: 0;`
                : ``};

        @keyframes fade-in {
            0% {
                animation-timing-function: cubic-bezier(0.2242, 0.7499, 0.3142, 0.8148);
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }
    }
`;

const ModalOverlay = styled.div`
    @media screen {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
`;

const ModalClose = styled.span`
    @media screen {
        position: absolute;
        right: 15px;
        top: 10px;
        color: #5e5e5e;
        cursor: pointer;
        font-size: 1.25em;
        padding: 7px;
        background: rgba(255, 255, 255, 0.749);
        border: 1px solid #c3c0c0;
        border-radius: 50%;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        box-sizing: border-box;
        display: inline-block;
        text-align: center;

        :hover {
            background: rgba(255, 255, 255, 0.989);
        }
    }
    @media print {
        display: none;
    }
`;

const ModalBody = styled.div`
    @media screen {
        z-index: 2;
        position: relative;
        margin: 0 auto;
        background-color: rgba(255, 255, 255, 1);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 3px;
        overflow-x: hidden;
        overflow-y: auto;
        max-height: 100%;
        padding: 15px 20px;
    }
`;
