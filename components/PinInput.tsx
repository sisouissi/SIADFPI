import React, { useRef, createRef, useEffect } from 'react';

interface PinInputProps {
    pin: string[];
    onPinChange: (pin: string[]) => void;
    disabled?: boolean;
    resetTrigger?: number;
}

const PinInput: React.FC<PinInputProps> = ({ pin, onPinChange, disabled, resetTrigger }) => {
    const inputRefs = useRef<React.RefObject<HTMLInputElement>[]>(
        Array(4).fill(null).map(() => createRef<HTMLInputElement>())
    );

    useEffect(() => {
        // This effect runs on mount (when resetTrigger is 0 or undefined)
        // and every time resetTrigger changes, focusing the first input.
        inputRefs.current[0]?.current?.focus();
    }, [resetTrigger]);


    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newPin = [...pin];
        newPin[index] = value.slice(-1); // Only take the last digit
        onPinChange(newPin);

        if (value && index < 3) {
            inputRefs.current[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1].current?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (pasteData.length === 4) {
            onPinChange(pasteData.split(''));
            inputRefs.current[3].current?.focus();
        }
    };

    return (
        <div className="flex justify-center gap-4" onPaste={handlePaste}>
            {Array(4).fill(null).map((_, index) => (
                <input
                    key={index}
                    ref={inputRefs.current[index]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={pin[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={disabled}
                    className="w-16 h-20 bg-slate-100 border-2 border-slate-300 rounded-lg text-center text-4xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
                    aria-label={`PIN digit ${index + 1}`}
                />
            ))}
        </div>
    );
};

export default PinInput;
