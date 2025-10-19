import React, { useState, useMemo } from 'react';
import { ExclamationTriangleIcon, ClipboardListIcon } from '../constants';

// Define the structure for patient data state
interface PatientData {
  cvfBaseline: number | '';
  cvfCurrent: number | '';
  dlcoBaseline: number | '';
  dlcoCurrent: number | '';
  tm6Baseline: number | '';
  tm6Current: number | '';
}

// Component to render a single input field
const DataInput: React.FC<{ label: string; id: keyof PatientData; value: number | ''; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, id, value, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        <input
            type="number"
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder="0"
            className="w-full bg-slate-100 border border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue"
        />
    </div>
);

// Component to display a result with a potential warning
const ResultDisplay: React.FC<{ label: string; value: string; unit: string; isWarning: boolean; warningText: string; }> = ({ label, value, unit, isWarning, warningText }) => (
    <div className={`flex items-center justify-between p-3 rounded-md ${isWarning ? 'bg-amber-100' : 'bg-slate-100'}`}>
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`text-lg font-bold ${isWarning ? 'text-amber-600' : 'text-slate-700'}`}>
                {value} <span className="text-sm font-normal">{unit}</span>
            </p>
        </div>
        {isWarning && (
            <div className="flex items-center gap-2 text-amber-600">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="text-xs font-semibold">{warningText}</span>
            </div>
        )}
    </div>
);


const ProgressionCalculator: React.FC = () => {
    const [data, setData] = useState<PatientData>({
        cvfBaseline: '',
        cvfCurrent: '',
        dlcoBaseline: '',
        dlcoCurrent: '',
        tm6Baseline: '',
        tm6Current: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prevData => ({
            ...prevData,
            [name]: value === '' ? '' : parseFloat(value),
        }));
    };
    
    const results = useMemo(() => {
        const { cvfBaseline, cvfCurrent, dlcoBaseline, dlcoCurrent, tm6Baseline, tm6Current } = data;

        const cvfAbsDecline = (typeof cvfBaseline === 'number' && typeof cvfCurrent === 'number') ? cvfBaseline - cvfCurrent : 0;
        const cvfRelDecline = (typeof cvfBaseline === 'number' && cvfBaseline > 0 && typeof cvfCurrent === 'number') ? ((cvfBaseline - cvfCurrent) / cvfBaseline) * 100 : 0;
        const dlcoRelDecline = (typeof dlcoBaseline === 'number' && dlcoBaseline > 0 && typeof dlcoCurrent === 'number') ? ((dlcoBaseline - dlcoCurrent) / dlcoBaseline) * 100 : 0;
        const tm6Decline = (typeof tm6Baseline === 'number' && typeof tm6Current === 'number') ? tm6Baseline - tm6Current : 0;

        const cvfAbsWarning = cvfAbsDecline >= 5;
        const cvfRelWarning = cvfRelDecline >= 10;
        const dlcoRelWarning = dlcoRelDecline >= 15;
        const tm6Warning = tm6Decline >= 50;

        const hasProgression = cvfAbsWarning || cvfRelWarning || dlcoRelWarning || tm6Warning;

        return {
            cvfAbsDecline,
            cvfRelDecline,
            dlcoRelDecline,
            tm6Decline,
            cvfAbsWarning,
            cvfRelWarning,
            dlcoRelWarning,
            tm6Warning,
            hasProgression
        };
    }, [data]);

    return (
         <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 md:col-span-2">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-sky-100 rounded-full mr-4">
                    <ClipboardListIcon className="w-6 h-6 text-accent-blue" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Calculateur de Progression de la Maladie</h3>
            </div>
            <p className="text-slate-600 mb-6">Saisissez les valeurs de référence et actuelles pour évaluer si les critères de progression sont atteints. Les indicateurs s'allumeront si un seuil est dépassé.</p>
            
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* CVF */}
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-700 text-center">CVF (% prédit)</h4>
                    <DataInput label="Valeur de référence" id="cvfBaseline" value={data.cvfBaseline} onChange={handleInputChange} />
                    <DataInput label="Valeur actuelle" id="cvfCurrent" value={data.cvfCurrent} onChange={handleInputChange} />
                </div>
                {/* DLCO */}
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-700 text-center">DLCO (% prédit)</h4>
                    <DataInput label="Valeur de référence" id="dlcoBaseline" value={data.dlcoBaseline} onChange={handleInputChange} />
                    <DataInput label="Valeur actuelle" id="dlcoCurrent" value={data.dlcoCurrent} onChange={handleInputChange} />
                </div>
                {/* TM6 */}
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-700 text-center">TM6 (mètres)</h4>
                    <DataInput label="Valeur de référence" id="tm6Baseline" value={data.tm6Baseline} onChange={handleInputChange} />
                    <DataInput label="Valeur actuelle" id="tm6Current" value={data.tm6Current} onChange={handleInputChange} />
                </div>
            </div>

            {/* Results Section */}
            <div>
                 <h4 className="font-semibold text-slate-700 text-lg mb-4">Résultats et Seuils de Progression</h4>
                 <div className="space-y-3">
                    <ResultDisplay 
                        label="Déclin absolu CVF"
                        value={results.cvfAbsDecline.toFixed(1)}
                        unit="%"
                        isWarning={results.cvfAbsWarning}
                        warningText="Progression (≥ 5%)"
                    />
                     <ResultDisplay 
                        label="Déclin relatif CVF"
                        value={results.cvfRelDecline.toFixed(1)}
                        unit="%"
                        isWarning={results.cvfRelWarning}
                        warningText="Progression (≥ 10%)"
                    />
                    <ResultDisplay 
                        label="Déclin relatif DLCO"
                        value={results.dlcoRelDecline.toFixed(1)}
                        unit="%"
                        isWarning={results.dlcoRelWarning}
                        warningText="Progression (≥ 15%)"
                    />
                    <ResultDisplay 
                        label="Diminution distance TM6"
                        value={results.tm6Decline.toFixed(0)}
                        unit="m"
                        isWarning={results.tm6Warning}
                        warningText="Progression (≥ 50m)"
                    />
                 </div>

                 {results.hasProgression && (
                     <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-6 h-6"/>
                        <p className="font-bold">Attention : Un ou plusieurs critères de progression de la maladie sont remplis.</p>
                     </div>
                 )}
            </div>
         </div>
    );
};

export default ProgressionCalculator;