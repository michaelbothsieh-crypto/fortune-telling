import { useState } from 'react';
import { UserInput, Gender, AnalysisResponse, CalendarType, AnalysisMode } from '../types';


export const useFortuneTelling = () => {
    const [input, setInput] = useState<UserInput>({
        birthDate: '1989-02-10',
        birthTime: '13:30',
        gender: Gender.MALE,
        calendarType: CalendarType.GREGORIAN,
        isLeapMonth: false,
    });
    const [secondInput, setSecondInput] = useState<UserInput>({
        birthDate: '1990-06-15',
        birthTime: '12:00',
        gender: Gender.FEMALE,
        calendarType: CalendarType.GREGORIAN,
        isLeapMonth: false,
    });
    const [apiKey, setApiKey] = useState('');
    const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.BASIC);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleNavClick = (e: React.MouseEvent, selectedMode: AnalysisMode) => {
        e.preventDefault();
        setMode(selectedMode);
        if (result) {
            setResult(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let data;
            if (mode === AnalysisMode.COMPATIBILITY) {
                // Import lazily or use the direct import if check avoids circular deps
                // Assuming analyzeBaZi handles mode switching internally or export a new function
                // Let's modify analyzeBaZi or export a new one. I'll stick to a unified analyze function update next.
                const { analyzeCompatibility } = await import('../services/geminiService');
                data = await analyzeCompatibility(input, secondInput, apiKey);
            } else {
                const { analyzeBaZi } = await import('../services/geminiService');
                data = await analyzeBaZi(input, mode, apiKey);
            }
            setResult(data);
        } catch (err: any) {
            setError(err.message || "論命過程中發生錯誤，請稍後再試。");
        } finally {
            setLoading(false);
        }
    };

    const resetResult = () => setResult(null);

    return {
        input,
        setInput,
        secondInput,
        setSecondInput,
        apiKey,
        setApiKey,
        mode,
        loading,
        result,
        error,
        handleNavClick,
        handleSubmit,
        resetResult
    };
};
