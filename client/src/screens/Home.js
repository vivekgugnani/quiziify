import React, { useState, useEffect } from 'react';
import './Home.css';
import { StyledFirebaseAuth } from 'react-firebaseui';
import firebase from '../firebase/firebase';
import LoadingScreen from './LoadingScreen';
import { Col, Container, Row } from 'react-bootstrap';
import Cookies from 'universal-cookie';

const Home = ({ setUser }) => {
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState('student');
    var uiConfig = {
        signInflow: 'popup',
        signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID, firebase.auth.EmailAuthProvider.PROVIDER_ID],
        callbacks: {
            signInSuccessWithAuthResult: () => false,
        },
    };
    const cookies = new Cookies();
    const roleStuChange = () => {
        setRole('student');
        console.log(role);
        cookies.set('role', 'student');
    };
    const roleTecChange = () => {
        setRole('teacher');
        cookies.set('role', 'teacher');
        console.log(role);
    };
    useEffect(() => {
        async function fetchData() {
            if (await cookies.get('role')) {
                setRole(cookies.get('role'));
            }
        }
        fetchData();
    }, [setUser, setRole]);

    useEffect(() => {
        // const radioButtons = document.querySelectorAll('input[name="role"]');
        // const teacher = document.getElementById('#stuid').checked;
        // console.log(teacher);
        // console.log(radioButtons);

        firebase.auth().onAuthStateChanged((user) => {
            console.log(user);
            let isMounted = true;
            if (user && isMounted) {
                setUser({
                    uid: firebase.auth().currentUser.uid,
                    name: firebase.auth().currentUser.displayName,
                    email: firebase.auth().currentUser.email,
                    role: role,
                });
                console.log('User Logged In');
            } else {
                console.log('User Signed Out');
                setUser({});
            }
            console.log('auth change');

            if (isMounted) {
                setLoading(false);
            }
        });
        // if (isMounted) {
        //     setRole(cookies.get('role'));
        // }
    }, [setUser, role]);
    return (
        <Container fluid>
            {loading ? (
                <LoadingScreen />
            ) : (
                <Container className="Home">
                    <Row className="row">
                        <Col className="logo" lg={6}>
                            <Col className="logo-name">
                                <b>Quizzy</b>Learning
                            </Col>
                            <Col>
                                <Row>
                                    <div id="studentid">
                                        <input type="radio" name="role" onChange={() => roleStuChange()} value="student" />
                                        <label>Student</label>
                                    </div>
                                </Row>

                                <Row>
                                    <div id="teacherid">
                                        <input type="radio" onChange={() => roleTecChange()} name="role" value="teacher" />
                                        <label>Teacher</label>
                                    </div>
                                </Row>
                            </Col>
                        </Col>

                        <Col className="login-card" lg={6}>
                            <label className="login-label">
                                <b>Q</b>
                            </label>
                            <StyledFirebaseAuth borderRadius="40px" uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
                        </Col>
                    </Row>
                </Container>
            )}
        </Container>
    );
};

export default Home;
