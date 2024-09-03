'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingDots from '@/components/ui/LoadingDots';

type Question = {
    id: string;
    challenge_id: string;
    question_number: number;
    flashcard_id: string;
    question: string;
    choice_a: string;
    choice_b: string;
    choice_c: string;
    choice_d: string;
    answer: string;
    user_answer: string | null;
    status: string;
    shuffle_index: number;
    created_at: string;
};

export default function ChallengeStart() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isChallengeStarted, setIsChallengeStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFinishing, setIsFinishing] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const challengeId = searchParams.get('challenge_id');
    const deckId = searchParams.get('deck_id');
    const mode = searchParams.get('mode') || 'standard';

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userResponse = await fetch('/api/user');

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error: unknown) {
                setUser(null);
                setMessage('Error fetching user details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    useEffect(() => {
        if (challengeId) {
            fetchQuestions();
        } else {
            setMessage('Challenge ID is missing.');
            setIsLoading(false);
        }
    }, [challengeId]);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/challenge/questions?challenge_id=${challengeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setQuestions(data.questions);
                setIsChallengeStarted(true);
                setStartTime(Date.now());

                if (mode === 'timed') {
                    startTimer(300);
                }
            } else {
                setMessage('Error fetching questions.');
            }
        } catch (error) {
            console.error('An unknown error occurred while fetching questions:', error);
            setMessage('An unknown error occurred while fetching questions.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuestionInDatabase = async (questionId: string, selectedAnswer: string) => {
        const currentQuestion = questions.find(q => q.id === questionId);
        if (!currentQuestion) {
            setMessage('Question not found.');
            return;
        }

        try {
            const response = await fetch('/api/challenge/questions/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: currentQuestion.id,
                    user_answer: selectedAnswer,
                    status: 'completed',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error updating question:', errorData);
                setMessage('Error updating question.');
            } else {
                setQuestions(prevQuestions =>
                    prevQuestions.map(q =>
                        q.id === currentQuestion.id ? { ...q, user_answer: selectedAnswer, status: 'completed' } : q
                    )
                );
            }
        } catch (error) {
            console.error('An unknown error occurred while updating the question:', error);
            setMessage('An unknown error occurred while updating the question.');
        }
    };

    const finishChallenge = async () => {
        setIsFinishing(true);
        await createChallengeHistoryRecord();
        await updateChallengeStatistics();
        setIsChallengeStarted(false);
        router.push('/challenge/history');
    };

    const createChallengeHistoryRecord = async () => {
        if (!challengeId) return;

        const correctAnswers = questions.filter(q => {
            const correctChoice = q[q.answer as keyof Question];
            return q.user_answer === correctChoice;
        }).length;

        const totalQuestions = questions.length;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const accuracy = correctAnswers / totalQuestions;
        const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

        try {
            const response = await fetch('/api/challenge/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    challenge_id: challengeId,
                    accuracy,
                    incorrect: incorrectAnswers,
                    correct: correctAnswers,
                    time_taken: timeTaken,
                    attempt_number: 1,
                    ai_suggestion: ""
                }),
            });

            if (!response.ok) {
                setMessage('Error creating challenge history record.');
            }
        } catch {
            setMessage('An unknown error occurred while creating the challenge history.');
        }
    };

    const updateChallengeStatistics = async () => {
        if (!challengeId) return;

        const correctAnswers = questions.filter(q => {
            const correctChoice = q[q.answer as keyof Question];
            return q.user_answer === correctChoice;
        }).length;

        const totalQuestions = questions.length;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const accuracy = correctAnswers / totalQuestions;

        try {
            const response = await fetch('/api/challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: challengeId,
                    deck_id: deckId,
                    user_id: user.id,
                    overall_correct: correctAnswers,
                    overall_incorrect: incorrectAnswers,
                    overall_accuracy: accuracy,
                    times_taken: 1,
                    status: 'completed',
                }),
            });

            if (!response.ok) {
                setMessage('Error updating challenge statistics.');
            }
        } catch {
            setMessage('An unknown error occurred while updating the challenge statistics.');
        }
    };

    const handleAnswerSelection = (selectedAnswer: string) => {
        const currentQuestion = questions[currentQuestionIndex];
        setSelectedAnswer(selectedAnswer);
        updateQuestionInDatabase(currentQuestion.id, selectedAnswer);
    };

    const handleContinue = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
        } else {
            finishChallenge();
        }
    };

    const startTimer = (seconds: number) => {
        setTimeLeft(seconds);

        const interval = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime && prevTime > 0) {
                    return prevTime - 1;
                } else {
                    clearInterval(interval);
                    finishChallenge();
                    return 0;
                }
            });
        }, 1000);
    };

    if (isLoading || !isChallengeStarted) {
        return <p className="text-center text-zinc-200">Loading...</p>;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion[currentQuestion.answer as keyof Question];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-800 text-white">
            <div className="w-full max-w-2xl p-6 bg-black rounded-lg shadow-lg pb-20 relative">
                <h1 className="text-2xl font-bold text-center mb-6">Challenge</h1>
                {mode === 'timed' && timeLeft !== null && (
                    <div className="text-center text-lg mb-4">
                        Time Left: <span className="font-bold">{timeLeft}</span> seconds
                    </div>
                )}
                {questions && questions.length > 0 && (
                    <div>
                        <p className="text-xl mb-4">
                            Question {currentQuestionIndex + 1}/{questions.length}
                        </p>
                        <p className="text-lg mb-6">{currentQuestion.question}</p>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {(['choice_a', 'choice_b', 'choice_c', 'choice_d'] as const).map((choice, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelection(currentQuestion[choice])}
                                    className={`p-4 rounded transition ${selectedAnswer
                                            ? currentQuestion[choice] === correctAnswer
                                                ? 'bg-green-500'
                                                : currentQuestion[choice] === selectedAnswer
                                                    ? 'bg-red-500'
                                                    : 'bg-zinc-700'
                                            : 'bg-zinc-700 hover:bg-zinc-600'
                                        }`}
                                    disabled={!!selectedAnswer}
                                >
                                    {currentQuestion[choice]}
                                </button>
                            ))}
                        </div>
                        {selectedAnswer && (
                            <button
                                onClick={handleContinue}
                                className="p-4 bg-zinc-700 rounded hover:bg-zinc-600 transition absolute bottom-4 right-6"
                            >
                                Continue
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
