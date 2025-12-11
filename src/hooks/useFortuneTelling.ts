import { useState, useEffect } from 'react';
import { UserInput, Gender, AnalysisResponse, CalendarType, AnalysisMode } from '../types';

const STORAGE_KEYS = {
    INPUT: 'fortune_user_input',
    SECOND_INPUT: 'fortune_user_input_2',
    API_KEY: 'fortune_api_key'
};

const DEFAULT_INPUT: UserInput = {
    birthDate: '1989-02-10',
    birthTime: '13:30',
    gender: Gender.MALE,
    calendarType: CalendarType.GREGORIAN,
    isLeapMonth: false,
};

const DEFAULT_SECOND_INPUT: UserInput = {
    birthDate: '1990-06-15',
    birthTime: '12:00',
    gender: Gender.FEMALE,
    calendarType: CalendarType.GREGORIAN,
    isLeapMonth: false,
};

export const useFortuneTelling = () => {
    // Lazy initialization for persistence
    const [input, setInput] = useState<UserInput>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.INPUT);
        return saved ? JSON.parse(saved) : DEFAULT_INPUT;
    });

    const [secondInput, setSecondInput] = useState<UserInput>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.SECOND_INPUT);
        return saved ? JSON.parse(saved) : DEFAULT_SECOND_INPUT;
    });

    const [apiKey, setApiKey] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    });

    const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.BASIC);

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.INPUT, JSON.stringify(input));
    }, [input]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SECOND_INPUT, JSON.stringify(secondInput));
    }, [secondInput]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    }, [apiKey]);
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
