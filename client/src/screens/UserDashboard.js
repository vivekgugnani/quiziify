import React, { useState, useEffect } from 'react';
import './UserDashBoard.css';
import CreatedQuizCard from '../components/CreatedQuizCard';
import JoinedQuizCard from '../components/JoinedQuizCard';
import LoadingScreen from './LoadingScreen';
import CreateQuiz from './CreateQuiz';

const UserDashboard = ({ user }) => {
    const [createdQuizzes, setCreatedQuizzes] = useState([]);
    const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editQuiz, setEditQuiz] = useState([]);
    const [DeleteQuiz, setDeleteQuiz] = useState([]);
    // Fetch Data from the API

    useEffect(() => {
        if (!user.uid) {
            setLoading(false);
            return;
        }
        const fetchQuizData = async () => {
            const results = await fetch(`/API/users/${user.uid}`);
            const quizData = await results.json();
            if (quizData.createdQuiz) setCreatedQuizzes(quizData.createdQuiz);
            if (quizData.attemptedQuiz) setAttemptedQuizzes(quizData.attemptedQuiz);
            setLoading(false);
        };
        if (user) fetchQuizData();
    }, [user]);

    const editQuizHandle = async (title, questions, isOpen) => {
        if (!title) setEditQuiz([]);
        else {
            setLoading(true);
            console.dir({
                quizId: createdQuizzes[editQuiz]._id,
                uid: user.uid,
                title,
                questions,
                isOpen,
            });
            const results = await fetch('/API/quizzes/edit', {
                method: 'POST',
                body: JSON.stringify({
                    quizId: createdQuizzes[editQuiz]._id,
                    uid: user.uid,
                    title,
                    questions,
                    isOpen,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const submitData = await results.json();
            console.dir(submitData);
            const temp = [...createdQuizzes];
            temp[editQuiz[0]].title = title;
            temp[editQuiz[0]].questions = questions;
            temp[editQuiz[0]].isOpen = isOpen;
            setCreatedQuizzes(temp);
            setEditQuiz([]);
            setLoading(false);
        }
    };

    if (loading) return <LoadingScreen />;
    const deleteQuizHandle = async () => {
        setLoading(true);
        const result = await fetch('/API/quizzes/delete', {
            method: 'DELETE',
            body: JSON.stringify({
                quizId: createdQuizzes[DeleteQuiz]._id,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const submitData = await result.json();
        console.log(submitData);
        const temp = [...createdQuizzes];
        delete temp[DeleteQuiz];

        setCreatedQuizzes(temp);
        setDeleteQuiz([]);
        setLoading(false);
    };
    if (DeleteQuiz.length) {
        deleteQuizHandle();
    }

    if (editQuiz.length)
        return (
            <CreateQuiz
                user={user}
                quizTitle={createdQuizzes[editQuiz].title}
                questions={createdQuizzes[editQuiz].questions}
                isOpen={createdQuizzes[editQuiz].isOpen}
                editQuizHandle={editQuizHandle}
            />
        );
    return (
        <div className="dash-body">
            <div className="quizzes">
                <div className="heading">
                    <div className="line-left" />
                    {user.role === 'teacher' ? <h2>Created </h2> : <h2>Quizzes</h2>}

                    <div className="line" />
                </div>
                <div className="card-holder">
                    {user.role === 'teacher' ? (
                        createdQuizzes.map((quiz, key) => (
                            <CreatedQuizCard
                                key={key}
                                index={key}
                                setEditQuiz={setEditQuiz}
                                title={quiz.title}
                                code={quiz._id}
                                responses={quiz.responses}
                                questions={quiz.questions.length}
                                isOpen={quiz.isOpen}
                                setDeleteQuiz={setDeleteQuiz}
                            />
                        ))
                    ) : (
                        <h2>hello</h2>
                    )}
                </div>
            </div>
            <div className="quizzes">
                <div className="heading">
                    <div className="line-left" />
                    <h2>Attempted </h2>
                    <div className="line" />
                </div>
                <div className="card-holder">
                    {attemptedQuizzes.map((quiz, key) => (
                        <JoinedQuizCard key={key} title={quiz.title} score={quiz.responses[0].score} questions={quiz.totalQuestions} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
