import { useState, useEffect } from 'react';
import './App.css';
import { MachineSelector } from './components/MachineSelector';
import { QuestionPanel } from './components/QuestionPanel';
import { AnswerPanel } from './components/AnswerPanel';
import { ProgressIndicator } from './components/ProgressIndicator';
import { GameCompletionModal } from './components/GameCompletionModal';
import { machines } from './data/machines';
import { Question } from './types';

function App() {
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    if (selectedMachine) {
      const machine = machines.find(m => m.id === selectedMachine);
      if (machine) {
        setQuestions(machine.questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnsweredQuestions(new Set());
        setGameComplete(false);
      }
    }
  }, [selectedMachine]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (answeredQuestions.has(currentQuestionIndex)) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestionIndex]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-center mb-4"><img src="/logo.png" alt="Pinball Coach" className="h-[100px]" /></div>
        
        {!selectedMachine ? (
          <MachineSelector 
            machines={machines}
            onSelect={setSelectedMachine}
          />
        ) : (
          <>
            <ProgressIndicator 
              current={currentQuestionIndex}
              total={questions.length}
              score={score}
            />
            
            <QuestionPanel 
              question={questions[currentQuestionIndex]}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
            />
            
            <AnswerPanel 
              answers={questions[currentQuestionIndex].answers}
              selectedAnswer={selectedAnswer}
              correctAnswer={questions[currentQuestionIndex].correctAnswer}
              showResult={showResult}
              onAnswerSelect={handleAnswerSelect}
              isAnswered={answeredQuestions.has(currentQuestionIndex)}
              onNext={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setSelectedAnswer(null);
                  setShowResult(false);
                } else {
                  setGameComplete(true);
                }
              }}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
            />
            
            <button
              onClick={() => {
                setSelectedMachine('');
                setSelectedAnswer(null);
                setShowResult(false);
              }}
              className="mt-6 w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              ← Back to Machine Selection
            </button>
          </>
        )}
      </div>
      
      {gameComplete && (
        <GameCompletionModal 
          score={score}
          total={questions.length}
          onClose={() => {
            setSelectedMachine('');
            setSelectedAnswer(null);
            setShowResult(false);
            setGameComplete(false);
          }}
        />
      )}
    </div>
  );
}

export default App;