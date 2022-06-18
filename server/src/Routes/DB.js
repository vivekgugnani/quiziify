const MongoClient = require('mongodb');
const Evaluate = require('../utils/EvaluateQuiz');
const ObjectId = require('mongodb').ObjectId;
const API_KEY = 'mongodb://127.0.0.1:27017/quizApp';
let db;

const DBStart = async () => {
    console.log('DB server connecting...');
    const client = await MongoClient.connect(API_KEY, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('DB Connected Successfully.');
    db = client.db('quizdom-project');
};

DBStart();

const withDB = async (operations, res) => {
    try {
        await operations(db);
        // client.close()
    } catch (error) {
        console.log('Error connecting to DB : ', error);
        res.status(500).json({ message: 'Error Connecting to db ', error });
    }
};

const createUser = async (uid, name, email, role, res) => {
    await withDB(async (db) => {
        const user = await db.collection('users').findOne({ uid: uid });
        if (!user) {
            const result = await db.collection('users').insertOne({
                uid,
                name,
                email,
                role,
                createdQuiz: [],
                attemptedQuiz: [],
            });
            res.status(200).json({ message: 'User Created successfully.' });
        } else {
            res.status(200).json({ message: 'User Record Exist' });
        }
    });
};

const createQuiz = async (quiz, res) => {
    try {
        await withDB(async (db) => {
            quiz['responses'] = [];
            const result = await db.collection('quizzes').insertOne(quiz);
            res.status(200).json({
                message: 'Quiz created successfully',
                quizId: result.insertedId,
            });
            console.log('quiz ID', result.insertedId);
            const query = { uid: quiz.uid };
            const addQuiz = {
                $push: { createdQuiz: result.insertedId },
            };
            await db.collection('users').updateOne(query, addQuiz);
            console.log('Quiz Added to Creator Document: ', result.insertedId);
        });
    } catch (error) {
        res.status(200).json({ message: 'Error creating quiz', error });
        console.log('Error : ', error);
    }
};

const submitQues = async (submittedQuestion, res) => {
    withDB(async (db) => {
        try {
            const cursor = db
                .collection('quizzes')
                .find({ _id: new ObjectId(submittedQuestion.quizId) })
                .project({ questions: 1 });

            const quiz = await cursor.toArray();
            const remQues = quiz[0].questions.slice(0, submittedQuestion.questions.length);

            const score = Evaluate(remQues, submittedQuestion.questions);
            console.log(score);
            res.send({
                score: score,
            });
        } catch (error) {
            console.log('Error:', error);
            res.status(500).json({ error });
        }
    });
};

const submitQuiz = async (submittedQuiz, res) => {
    withDB(async (db) => {
        try {
            // Check whether the user has already submitted the Quiz
            const validationCursor = db.collection('users').find({
                $and: [{ uid: submittedQuiz.uid }, { attemptedQuiz: ObjectId(submittedQuiz.quizId) }],
            });

            const quizData = await validationCursor.toArray();

            // console.log({ quizData });
            // If the quiz is already submitted, DONOT submit it.
            if (quizData[0]) {
                console.log('in quiz already attempted');
                return res.status(200).json({
                    error: 'ERR:QUIZ_ALREADY_ATTEMPTED',
                });
            }
            const cursor = db
                .collection('quizzes')
                .find({ _id: new ObjectId(submittedQuiz.quizId) })
                .project({ questions: 1 });

            const quiz = await cursor.toArray();
            console.log(quiz);
            console.log('in quiz store');
            const score = Evaluate(quiz[0].questions, submittedQuiz.questions);
            console.log('score : ', score);
            res.status(200).json({ score });

            // Update in quizzes responses
            await db.collection('quizzes').updateOne(
                { _id: new ObjectId(submittedQuiz.quizId) },
                {
                    $push: {
                        responses: { uid: submittedQuiz.uid, score: score },
                    },
                },
            );
            // Update user's attempted quizzes
            await db.collection('users').updateOne(
                { uid: submittedQuiz.uid },
                {
                    $push: {
                        attemptedQuiz: ObjectId(submittedQuiz.quizId),
                    },
                },
            );
        } catch (error) {
            console.log('Error:', error);
            res.status(500).json({ error });
        }
    });
};

const getResponses = (obj, res) => {
    withDB(async (db) => {
        const cursor = db
            .collection('quizzes')
            .find({ _id: new ObjectId(obj.quizCode), uid: obj.uid })
            .project({ responses: 1 });
        const cursorData = await cursor.toArray();
        const responses = cursorData[0].responses;
        const uidList = responses.map((response) => response.uid);

        const cursor2 = db
            .collection('users')
            .find({ uid: { $in: uidList } })
            .project({ uid: 1, name: 1, email: 1 });

        const cursor2Data = await cursor2.toArray();
        const finalResponse = [];
        cursor2Data.forEach((data) => {
            let index = responses.findIndex((resp) => resp.uid === data.uid);
            finalResponse.push({
                name: data.name,
                email: data.email,
                score: responses[index].score,
            });
        });
        res.status(200).json({ finalResponse });
    }, res);
};

module.exports.withDB = withDB;
module.exports.createUser = createUser;
module.exports.createQuiz = createQuiz;
module.exports.submitQuiz = submitQuiz;
module.exports.submitQues = submitQues;
module.exports.getResponses = getResponses;
const obj = {
    uid: 'DEN1nd1YzLfT1YvvNMXcAVt79D12',
    quizId: '62ad95edd6ca5e0af4d3b412',
    questions: [
        {
            id: 1,
            title: '1+1',
            optionType: 'radio',
            selectedOptions: ['2'],
        },
    ],
};

const check = {
    uid: 'DEN1nd1YzLfT1YvvNMXcAVt79D12',
    quizId: '62ad9cf1f4875d4b886d482f',
    questions: [
        {
            id: 1,
            title: 'hi bye',
            optionType: 'radio',
            selectedOptions: ['2'],
        },
    ],
};
const newobj = {
    _id: {
        $oid: '62ad9cf1f4875d4b886d482f',
    },
    title: 'new quiz',
    uid: 'DEN1nd1YzLfT1YvvNMXcAVt79D12',
    questions: [
        {
            title: 'hi bye',
            optionType: 'radio',
            options: [
                {
                    text: 'why why',
                    isCorrect: false,
                },
                {
                    text: 'naah naah',
                    isCorrect: false,
                },
                {
                    text: 'baah baah',
                    isCorrect: true,
                },
            ],
            id: 1,
        },
        {
            title: 'why why',
            optionType: 'radio',
            options: [
                { text: 'nhiii', isCorrect: true },
                { text: 'why', isCorrect: false },
                { text: 'nnn', isCorrect: false },
            ],
        },
        {
            title: 'hello hi',
            optionType: 'radio',
            options: [
                { text: 'why why', isCorrect: false },
                { text: 'nhinhi', isCorrect: true },
                { text: 'haan nhi', isCorrect: false },
            ],
        },
    ],
    isOpen: true,
    responses: [],
};
