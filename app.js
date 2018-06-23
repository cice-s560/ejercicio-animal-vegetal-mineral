const inquirer = require("inquirer");
const fs = require("fs");

// Cargo mi base de datos
const dbPath = "./data.json";
// Cargamos el archivo y lo parseamos a objeto, 
// pues lo que recibimos es un String
const dbFile = JSON.parse(fs.readFileSync(dbPath, "utf8"));
// Respuestas del Usuario
const userAnswers = {
    nombre: null,
    tipo: null,
    userItem: null,
    userIdentifyItem: null
};
// Intentos del usuario
const maxTries = 2;
let currentTry = 0;
// Almacenaré índices aleatorios
// para no repetir
let selectedTypeRaw = [];

// Función de validación
const stringValidator = value => value.length > 0 || "Debes introducir un valor";

// Objeto de preguntas al usuario
const questions = {
    step1: {
        type: "input",
        name: "nombre",
        message: "¿Cuál es tu nombre?",
        validate: stringValidator
    },

    step2: {
        type: "list",
        name: "tipo",
        message: "¿En qué tipo de elemento estás pensando?",
        choices: ["Animal", "Vegetal", "Mineral"]
    },

    stepUserItem: {
        type: "input",
        name: "userItem",
        message: "¿En qué estabas pensando?",
        validate: stringValidator
    },

    stepUserAnswer: {
        type: "input",
        name: "userIdentifyItem",
        message: "Escribe una pregunta que lo identifique",
        validate: stringValidator
    }
};


function saveData() {
    // Modelo datos según la estructura de mi DB
    const newItem = {
        name: userAnswers.userItem,
        author: userAnswers.nombre,
        question: userAnswers.userIdentifyItem
    };

    // Añado el nuevo item a mi obj
    // representativo de mi DB
    dbFile[userAnswers.tipo].push(newItem);

    // Salvo en mi DB
    const fileToString = JSON.stringify(dbFile);
    fs.writeFile(dbPath, fileToString, err => {
        if (err) {
            throw new Error("Algo salió mal al escribir");
        }

        console.log(`Gracias ${userAnswers.nombre}, gracias a ti ahora ya conozco:
        
        ${dbFile.animal.length} animales
        ${dbFile.vegetal.length} vegetales
        ${dbFile.mineral.length} minerales

        Vuelve a jugar cuando quieras :)
        `);
    });
}


async function endGame() {
    const answerEnd = await inquirer.prompt([
        questions.stepUserItem,
        questions.stepUserAnswer
    ]);

    userAnswers.userItem = answerEnd.userItem;
    userAnswers.userIdentifyItem = answerEnd.userIdentifyItem;

    saveData();
}

function winGame() {
    console.log(`Genial! He acertado!
Muchas gracias por jugar, vuelve cuando quieras :)`);
}

async function resolveGame(subject) {
    const stepResolve = await inquirer.prompt([
        {
            type: "confirm",
            name: "isResolved",
            message: `¿Estás pensando en ${subject}?`
        }
    ]);

    // Si acertamos, hemos ganado
    if (stepResolve.isResolved) {
        return winGame(); 
    }

    currentTry ++;

    tryAnswer();
}


async function tryAnswer() {
    // Si el usuario lo intenta
    // pero no le quedan oportunidades
    if (currentTry >= maxTries || selectedTypeRaw.length === 0) {
        console.log("Ok, me rindo :( No acierto a adivinar lo que tu mente es capaz de imaginar");

        return endGame();
    }

    // genero un número aleatorio de entre sus posiciones posibles
    const posRandom = Math.round(Math.random() * (selectedTypeRaw.length - 1));

    // Elijo el obj con esa posición
    // creo un obj nuevo para no perder la ref
    const choice = {...selectedTypeRaw[posRandom]};

    // elimino ese obj
    // ya lo he usado
    selectedTypeRaw.splice(posRandom, 1);

    const stepTry = await inquirer.prompt([
        {
            type: "confirm",
            name: "isTryOk",
            message: choice.question
        }
    ]);

    // Sumo el try
    currentTry ++;

    // Compruebo si he acertado
    if (stepTry.isTryOk) {
        return resolveGame(choice.name);
    }

    // Si no acierta y tengo intentos
    // pruebo de nuevo
    tryAnswer();
}


async function playGame() {
    console.log("Biervenido al juego Animal, Vegetal, Mineral de CICE");
    console.log("----------------------------------------------------");
    console.log("----------------------------------------------------");

    // Pregunto el nombre del usuario
    const step1 = await inquirer.prompt([questions.step1]);
    userAnswers.nombre = step1.nombre;

    // Pregunto el tipo de elemento
    const step2 = await inquirer.prompt([questions.step2]);
    userAnswers.tipo = step2.tipo.toString().toLowerCase();

    console.log(`
Ummmmmmmmmmm........ déjame que piense.......
    `);

    // Creamos un delay. Emoción...
    setTimeout(() => {
        // Compruebo que tenga algún elemento en mi DB
        const tipoItemsDB = dbFile[userAnswers.tipo];

        if (tipoItemsDB.length === 0) {
            // Si no tengo nada, me rindo. 
            console.log("Oooooh. Aún no conozco ningún elemento de ese tipo");
            // GAME OVER
            endGame();
        }

        // Referencio el tipo con sus objs
        const typeSelected = dbFile[userAnswers.tipo];
        // Clono el array en mi array independiente
        selectedTypeRaw = [...typeSelected];

        tryAnswer();
    }, 1500);
}


// Ejecuto el juego
playGame();