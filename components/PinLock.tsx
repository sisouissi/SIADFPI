import React, { useState, useEffect, useCallback } from 'react';
import PinInput from './PinInput';

interface PinLockProps {
    onUnlock: () => void;
}

const LockIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const PIN_STORAGE_KEY = 'siad-fpi-pin-hash';

const hashPin = async (pin: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

const PinLock: React.FC<PinLockProps> = ({ onUnlock }) => {
    type Mode = 'SET' | 'CONFIRM' | 'ENTER';
    
    const [mode, setMode] = useState<Mode>('ENTER');
    const [pin, setPin] = useState<string[]>(Array(4).fill(''));
    const [firstPin, setFirstPin] = useState('');
    const [message, setMessage] = useState('');
    const [subMessage, setSubMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [resetTrigger, setResetTrigger] = useState(0);

    useEffect(() => {
        const storedPinHash = localStorage.getItem(PIN_STORAGE_KEY);
        if (storedPinHash) {
            setMode('ENTER');
            setMessage('Entrez votre code PIN');
            setSubMessage('Pour accéder aux dossiers des patients.');
        } else {
            setMode('SET');
            setMessage('Créez un code PIN à 4 chiffres');
            setSubMessage('Ce code protégera l\'accès local aux dossiers des patients.');
        }
        setIsLoading(false);
    }, []);

    const resetPinInput = () => {
        setPin(Array(4).fill(''));
        setResetTrigger(c => c + 1);
    };

    const handlePinComplete = useCallback(async (completedPin: string) => {
        setIsLoading(true);

        if (mode === 'SET') {
            setFirstPin(completedPin);
            setMode('CONFIRM');
            setMessage('Confirmez votre code PIN');
            setSubMessage('Veuillez entrer le même code à nouveau.');
            resetPinInput();
        } else if (mode === 'CONFIRM') {
            if (completedPin === firstPin) {
                const pinHash = await hashPin(completedPin);
                localStorage.setItem(PIN_STORAGE_KEY, pinHash);
                onUnlock();
            } else {
                setMode('SET');
                setMessage('Les codes ne correspondent pas. Veuillez réessayer.');
                setSubMessage('Créez un code PIN à 4 chiffres.');
                resetPinInput();
            }
        } else if (mode === 'ENTER') {
            const storedPinHash = localStorage.getItem(PIN_STORAGE_KEY);
            const enteredPinHash = await hashPin(completedPin);
            if (storedPinHash === enteredPinHash) {
                onUnlock();
            } else {
                setMessage('Code PIN incorrect');
                setSubMessage('Veuillez réessayer.');
                resetPinInput();
            }
        }
        setIsLoading(false);
    }, [mode, firstPin, onUnlock]);
    
    useEffect(() => {
        if (pin.join('').length === 4) {
            handlePinComplete(pin.join(''));
        }
    }, [pin, handlePinComplete]);

    const handleForgotPin = () => {
        if (window.confirm("Êtes-vous sûr de vouloir réinitialiser votre code PIN ? Vous devrez en créer un nouveau.")) {
            localStorage.removeItem(PIN_STORAGE_KEY);
            setMode('SET');
            setMessage('Créez un nouveau code PIN');
            setSubMessage('Votre ancien code a été supprimé.');
            resetPinInput();
        }
    };
    
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center justify-center min-h-[500px]">
            <div className="w-full max-w-sm text-center">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-sky-100 rounded-full mb-6">
                    <LockIcon className="w-8 h-8 text-accent-blue" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{message}</h2>
                <p className="text-slate-500 mb-8">{subMessage}</p>

                <PinInput pin={pin} onPinChange={setPin} disabled={isLoading} resetTrigger={resetTrigger} />

                {mode === 'ENTER' && (
                    <div className="mt-8">
                        <button onClick={handleForgotPin} className="text-sm text-slate-500 hover:text-accent-blue hover:underline">
                            Code PIN oublié ?
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PinLock;
