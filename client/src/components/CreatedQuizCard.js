import { IconButton } from '@material-ui/core';
import { DeleteOutline, EditRounded } from '@material-ui/icons';
import React from 'react';
import { Link } from 'react-router-dom';
import './QuizCard.css';

const CreatedQuizCard = ({ title, responses, code, questions, isOpen, index, setEditQuiz, setDeleteQuiz }) => {
    return (
        <div className="quiz-card">
            <div>
                <h1 className="created-quiz-title">{title}</h1>
                <p className="card-code">Code : {code}</p>
            </div>
            <div id="horizontal-line"></div>
            <div id="row">
                <div id="responses">
                    {responses !== undefined ? (
                        <Link to={`/responses/${code}`} style={{ fontWeight: 'bold' }} className="respo">
                            Responses : {responses}
                        </Link>
                    ) : (
                        <></>
                    )}
                </div>
                <div id="questions">Questions : {questions}</div>
            </div>
            {responses !== undefined ? (
                <div className="bottom-bar">
                    {isOpen ? <div id="open">open</div> : <div id="closed">closed</div>}
                    <div>
                        <IconButton onClick={() => setEditQuiz([index])} color="secondary">
                            <EditRounded color="secondary" />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => setDeleteQuiz([index])}>
                            <DeleteOutline color="secondary" />
                        </IconButton>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};

export default CreatedQuizCard;
