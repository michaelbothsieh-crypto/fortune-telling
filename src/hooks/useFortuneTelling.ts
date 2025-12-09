import { useState } from 'react';
import { UserInput, Gender, AnalysisResponse, CalendarType, AnalysisMode } from '../types';
import { analyzeBaZi } from '../services/geminiService';

export const useFortuneTelling = () => {
    const [input, setInput] = useState<UserInput>({
        birthDate: '1989-02-10',
        birthTime: '13:30',
        gender: Gender.MALE,
        calendarType: CalendarType.GREGORIAN,
        isLeapMonth: false,
    });
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
            const data = await analyzeBaZi(input, mode);
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
        mode,
        loading,
        result,
        error,
        handleNavClick,
        handleSubmit,
        resetResult
    };
};
