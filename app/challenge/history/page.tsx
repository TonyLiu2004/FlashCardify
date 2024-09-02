'use client';
import React, { useState, useEffect } from 'react';

type ChallengeHistory = {
    id: string;
    challenge_id: string | null;
    deck_name: string;
    accuracy: number | null;
    incorrect: number | null;
    correct: number | null;
    ai_suggestion: string | null;
    time_taken: number | null;
    attempt_number: number | null;
    created_at: string | null;
};

export default function ChallengeHistory() {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [challengeHistories, setChallengeHistories] = useState<ChallengeHistory[]>([]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userResponse = await fetch('/api/user');

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData);

                    const historyResponse = await fetch(`/api/challenge/history?user_id=${userData.id}`);
                    if (historyResponse.ok) {
                        const historyData = await historyResponse.json();
                        setChallengeHistories(historyData.data || []);
                    } else {
                        console.error('Failed to fetch challenge history.');
                    }
                } else {
                    setUser(null);
                }
            } catch (error: unknown) {
                setUser(null);
                console.error('An error occurred:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    if (isLoading) {
        return <p className="text-center text-zinc-200">Loading...</p>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-zinc-800 text-white p-4" style={{marginTop: "80px"}}>
            <h1 className="text-3xl font-bold mb-6 mt-4">Challenge History</h1>
            {challengeHistories.length > 0 ? (
                <div className="w-full max-w-4xl bg-black rounded-lg shadow-lg p-6">
                    {challengeHistories.map((history, index) => (
                        <div key={history.id} className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">Attempt #{history.attempt_number}</h2>
                            <p className="mb-1">Deck Name: {history.deck_name}</p>
                            <p className="mb-1">Accuracy: {(history.accuracy || 0) * 100}%</p>
                            <p className="mb-1">Correct Answers: {history.correct}</p>
                            <p className="mb-1">Incorrect Answers: {history.incorrect}</p>
                            <p className="mb-1">Time Taken: {history.time_taken} seconds</p>
                            {history.ai_suggestion && (
                                <p className="mb-1">AI Suggestion: {history.ai_suggestion}</p>
                            )}
                            <p className="text-sm text-gray-400">
                                Completed on: {new Date(history.created_at || '').toLocaleString()}
                            </p>
                            {index < challengeHistories.length - 1 && <hr className="my-4" />}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-zinc-200">No challenge history found.</p>
            )}
        </div>
    );
}
