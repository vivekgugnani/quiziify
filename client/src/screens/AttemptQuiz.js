import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebase from '../firebase/firebase';
import LoadingScreen from './LoadingScreen';
import AttemptedModal from './AttemptedModal';

const AttemptQuiz = ({ match }) => {
    const quizCode = match.params.quizCode;
    const [marks, setMarks] = useState(0);
    const [disable, setDisable] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [attemptedQuestions, setAttemptedQuestions] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState({});
    const [showModal, setShowModal] = useState(false);
    const uid = firebase.auth().currentUser.uid;
    useEffect(() => {
        const fetchQuiz = async () => {
            const res = await fetch('/API/quizzes/join', {
                method: 'POST',
                body: JSON.stringify({ quizId: quizCode, uid }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const quizData = await res.json();
            setLoading(false);
            if (quizData.error) setQuizTitle(quizData.error);
            else {
                setQuizTitle(quizData.title);
                setQuestions(quizData.questions);
                const temp = quizData.questions.map((question) => {
                    console.log(question);
                    return {
                        id: question.id,
                        title: question.title,
                        optionType: question.optionType,
                        selectedOptions: [],
                        optionsLength: question.options.length,
                    };
                });
                setAttemptedQuestions(temp);
            }
        };
        fetchQuiz();
    }, [quizCode, uid]);

    const handleOptionSelect = (e, option, index) => {
        const temp = [...attemptedQuestions];
        const options = temp[index].selectedOptions;

        console.log('index:' + index);
        if (!options.includes(option) && e.target.checked) {
            if (attemptedQuestions[index].optionType === 'radio') options[0] = option;
            else options.push(option);
        }
        if (options.includes(option) && !e.target.checked) {
            const i = options.indexOf(option);
            options.splice(i, 1);
        }
        temp[index].selectedOptions = options;

        setAttemptedQuestions(temp);
    };
    const submitQues = async () => {
        const att = attemptedQuestions.filter((e) => {
            if (e.selectedOptions.length > 0) return true;

            return false;
        });
        console.log(attemptedQuestions);
        try {
            const res = await fetch('/API/quizzes/ques', {
                method: 'POST',
                body: JSON.stringify({
                    uid,
                    quizId: quizCode,
                    questions: att,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const body = await res.json();
            console.log(body);
            setMarks(body.score);
            setDisable(true);
            // console.log(att.length + ' this');
            for (let i = 0; i < att.length; i++) {
                for (let j = 0; j < att[i].optionsLength; j++) {
                    // console.log(`${i}${j}`);
                    try {
                        document.getElementById(`${i}${j}`).disabled = true;
                    } catch (e) {}
                }
            }
            const pass = body.score / attemptedQuestions.length;
            console.log(pass + ' you got passed');
            if (pass > 0.6) {
                alert('Congratulations you passed the quiz. you can now submit');
            }
        } catch (e) {
            console.log('Error Submitting quiz', e);
        }
    };
    const submitQuiz = async () => {
        // send attemped Questions to backend
        try {
            const res = await fetch('/API/quizzes/submit', {
                method: 'POST',
                body: JSON.stringify({
                    uid,
                    quizId: quizCode,
                    questions: attemptedQuestions,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const body = await res.json();
            setResult(body);
            setShowModal(true);
            console.log('res body : ', body);
        } catch (e) {
            console.log('Error Submitting quiz', e);
        }
    };

    if (loading) return <LoadingScreen />;
    // For Quiz not Found
    if (quizTitle === 'ERR:QUIZ_NOT_FOUND')
        return (
            <div className="loading">
                <h1>404 Quiz Not Found!</h1>
                <div id="logo-name">
                    <b>Quiz</b>ify
                </div>
                <h3>
                    Go back to <Link to="/join-quiz">Join Quiz </Link>Page.
                </h3>
            </div>
        );
    // For Quiz not accessible
    else if (quizTitle === 'ERR:QUIZ_ACCESS_DENIED')
        return (
            <div className="loading">
                <h2>Quiz Access is Not Granted by the Creator. Please contact Quiz Creator.</h2>
                <div id="logo-name">
                    <b>Quiz</b>ify
                </div>
                <h3>
                    Go back to <Link to="/join-quiz">Join Quiz </Link>Page.
                </h3>
            </div>
        );
    else if (quizTitle === 'ERR:QUIZ_ALREADY_ATTEMPTED')
        return (
            <div className="loading">
                <h2>You have already taken the Quiz.</h2>
                <div id="logo-name">
                    <b>Quizzy</b>Learning
                </div>
                <h3>
                    Go back to <Link to="/join-quiz">Join Quiz </Link>Page.
                </h3>
            </div>
        );
    else
        return (
            <div id="main-body">
                <div id="create-quiz-body">
                    <div className="quiz-header">
                        <div></div>
                        <h2>{quizTitle}</h2>
                        <div id="marksQuiz">
                            Marks: {marks}/{attemptedQuestions.length}
                        </div>
                    </div>
                    {questions.map((question, index) => (
                        <div className="attempQuestionCard" key={index}>
                            <div id="title">{question.title}</div>
                            <div className="option-div">
                                {question.options.map((option, ind) => (
                                    <div className="option" key={ind}>
                                        {question.optionType === 'radio' ? (
                                            <input id={`${index}${ind}`} type="radio" name={`option${index}`} onChange={(e) => handleOptionSelect(e, option.text, index)} />
                                        ) : (
                                            <input id={`${index}${ind}`} type="checkbox" name="option" onChange={(e) => handleOptionSelect(e, option.text, index)} />
                                        )}
                                        <label className="label" style={{ padding: '0px 5px' }}>
                                            {option.text}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="submit">
                                <button className="add-bn" onClick={submitQues}>
                                    Mark
                                </button>
                            </div>
                        </div>
                    ))}
                    <button className="button wd-200" onClick={submitQuiz}>
                        Submit
                    </button>
                    <AttemptedModal result={result} showModal={showModal} totalScore={questions.length} />
                </div>
            </div>
        );
};

export default AttemptQuiz;
