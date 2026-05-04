const SEEDED_AT = "2026-05-03T00:00:00.000Z";

export const PILOT_SUBJECT_KEY = "IP";
export const PILOT_SUBJECT_ALIASES = [
  "ip",
  "introduccion a la programacion",
  "introduccion a programacion",
  "intro a la programacion",
  "intro a programacion",
];

export function normalizeLessonText(value) {
  return `${value ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function isPilotSubject(subject) {
  const candidates = [subject?.name, subject?.code];
  return candidates.some((candidate) =>
    PILOT_SUBJECT_ALIASES.includes(normalizeLessonText(candidate))
  );
}

export function getLessonSubjectKey(subject) {
  return isPilotSubject(subject) ? PILOT_SUBJECT_KEY : subject?.name ?? "";
}

function createLesson({
  id,
  topic,
  title,
  order,
  explanation,
  questions,
}) {
  return {
    id,
    subjectName: PILOT_SUBJECT_KEY,
    topic,
    title,
    order,
    estimatedMinutes: 5,
    xpReward: 10,
    content: {
      explanation,
      questions,
    },
    createdAt: SEEDED_AT,
  };
}

function createMultipleChoiceQuestion(id, prompt, options, correctAnswer, feedback) {
  return {
    id,
    type: "multiple_choice",
    prompt,
    options,
    correctAnswer,
    feedback,
  };
}

function createTrueFalseQuestion(id, prompt, correctAnswer, feedback) {
  return {
    id,
    type: "true_false",
    prompt,
    options: [
      { value: "verdadero", label: "Verdadero" },
      { value: "falso", label: "Falso" },
    ],
    correctAnswer,
    feedback,
  };
}

function createCodeFillQuestion(id, prompt, template, acceptedAnswers, feedback, placeholder = "") {
  return {
    id,
    type: "code_fill",
    prompt,
    template,
    acceptedAnswers,
    correctAnswer: acceptedAnswers[0],
    placeholder,
    feedback,
  };
}

export const PILOT_LESSONS = [
  createLesson({
    id: "ip_variables",
    topic: "Variables",
    title: "Tus primeras variables en Python",
    order: 1,
    explanation:
      "En IP empezarás resolviendo problemas con Python. Una variable guarda información para reutilizarla después, y en Python se crea asignando un valor con =. Para mostrar resultados básicos se usa print().",
    questions: [
      createMultipleChoiceQuestion(
        "ip_variables_q1",
        "¿Para qué sirve una variable en Python?",
        [
          { value: "guardar", label: "Para guardar un dato y reutilizarlo" },
          { value: "borrar", label: "Para borrar automáticamente el programa" },
          { value: "cerrar", label: "Para cerrar una función" },
        ],
        "guardar",
        {
          correct: "Exacto. Una variable guarda un valor para usarlo cuando lo necesites.",
          incorrect: "Piensa en una variable como una caja con nombre donde guardas un dato.",
        }
      ),
      createTrueFalseQuestion(
        "ip_variables_q2",
        "En Python basta con usar = para crear una variable.",
        "verdadero",
        {
          correct: "Correcto. En Python basta con escribir el nombre, = y el valor.",
          incorrect: "IP trabaja con Python, y allí las variables se crean por asignación directa.",
        }
      ),
      createCodeFillQuestion(
        "ip_variables_q3",
        "Completa el valor para guardar el nombre de una estudiante.",
        "nombre = ____",
        ['"Ana"', "'Ana'"],
        {
          correct: "Bien. En Python el texto se escribe entre comillas.",
          incorrect: "Un nombre es texto, así que en Python debe ir entre comillas.",
        },
        '"Ana"'
      ),
    ],
  }),
  createLesson({
    id: "ip_tipos_datos",
    topic: "Tipos de datos",
    title: "Números, cadenas y booleanos en Python",
    order: 2,
    explanation:
      "El programa del curso menciona tipos básicos de Python como números, cadenas y booleanos. Estos tipos permiten modelar entradas, resultados y decisiones dentro de un problema.",
    questions: [
      createMultipleChoiceQuestion(
        "ip_tipos_datos_q1",
        "¿Cuál de estas opciones es un booleano en Python?",
        [
          { value: "boolean", label: "True" },
          { value: "string", label: '"True"' },
          { value: "number", label: "42" },
        ],
        "boolean",
        {
          correct: "Exacto. True es un booleano en Python.",
          incorrect: "En Python, True y False sin comillas representan booleanos.",
        }
      ),
      createTrueFalseQuestion(
        "ip_tipos_datos_q2",
        "Las cadenas de texto en Python normalmente se escriben entre comillas.",
        "verdadero",
        {
          correct: "Sí. Las comillas indican que el valor es texto.",
          incorrect: "En Python, el texto también se representa entre comillas.",
        }
      ),
      createCodeFillQuestion(
        "ip_tipos_datos_q3",
        "Completa el valor booleano para indicar que la cuenta está activa.",
        "esta_activa = ____",
        ["True"],
        {
          correct: "Bien. True es el booleano positivo en Python.",
          incorrect: "Aquí necesitas un booleano de Python: True o False, sin comillas.",
        },
        "True"
      ),
    ],
  }),
  createLesson({
    id: "ip_operadores",
    topic: "Operadores",
    title: "Operaciones y comparaciones básicas en Python",
    order: 3,
    explanation:
      "Los operadores permiten calcular y comparar valores. En Python, + suma números y == compara si dos valores son iguales. También usarás >, <, *, / y % para resolver problemas.",
    questions: [
      createMultipleChoiceQuestion(
        "ip_operadores_q1",
        "¿Qué operador usarías para sumar dos números?",
        [
          { value: "sum", label: "+" },
          { value: "compare", label: "==" },
          { value: "assign", label: "=" },
        ],
        "sum",
        {
          correct: "Correcto. + es el operador de suma.",
          incorrect: "Para sumar se usa +; = asigna y == compara.",
        }
      ),
      createTrueFalseQuestion(
        "ip_operadores_q2",
        "En Python, == se usa para comparar si dos valores son iguales.",
        "verdadero",
        {
          correct: "Correcto. == evalúa igualdad entre valores.",
          incorrect: "En Python la comparación de igualdad se hace con ==.",
        }
      ),
      createCodeFillQuestion(
        "ip_operadores_q3",
        "Completa el operador para sumar a y b.",
        "total = a ____ b",
        ["+"],
        {
          correct: "Bien. Con + obtienes la suma de ambos valores.",
          incorrect: "La operación pedida es una suma, así que necesitas +.",
        },
        "+"
      ),
    ],
  }),
  createLesson({
    id: "ip_condicionales",
    topic: "Condicionales",
    title: "Tomar decisiones con if, elif y else",
    order: 4,
    explanation:
      "El Nivel 2 del curso se enfoca en tomar decisiones. En Python, if, elif y else permiten ejecutar caminos distintos según una condición. La indentación es parte obligatoria de la sintaxis.",
    questions: [
      createMultipleChoiceQuestion(
        "ip_condicionales_q1",
        "¿Para qué sirve un if?",
        [
          { value: "decision", label: "Para ejecutar código según una condición" },
          { value: "repeat", label: "Para repetir código muchas veces" },
          { value: "save", label: "Para guardar un dato en memoria" },
        ],
        "decision",
        {
          correct: "Sí. if se usa para tomar decisiones en el flujo del programa.",
          incorrect: "if no repite ni guarda; evalúa una condición para decidir qué hacer.",
        }
      ),
      createTrueFalseQuestion(
        "ip_condicionales_q2",
        "Si la condición de un if es falsa, el bloque de else puede ejecutarse.",
        "verdadero",
        {
          correct: "Correcto. else es la alternativa cuando la condición no se cumple.",
          incorrect: "Cuando el if falla, else permite definir el camino alterno.",
        }
      ),
      createCodeFillQuestion(
        "ip_condicionales_q3",
        "Completa la instrucción que se ejecuta si no llueve.",
        'if llueve:\n    print("Paraguas")\nelse:\n    ____',
        ['print("Normal")', "print('Normal')"],
        {
          correct: "Bien. else cubre el caso en el que la condición no se cumple.",
          incorrect: "Dentro de else debes escribir la instrucción alternativa usando sintaxis de Python.",
        },
        'print("Normal")'
      ),
    ],
  }),
  createLesson({
    id: "ip_ciclos",
    topic: "Ciclos",
    title: "Repetir acciones con while y for",
    order: 5,
    explanation:
      "El Nivel 3 introduce repeticiones. En Python, while repite mientras una condición sea verdadera y for suele recorrerse con range o con estructuras como listas.",
    questions: [
      createMultipleChoiceQuestion(
        "ip_ciclos_q1",
        "¿Qué estructura usarías para repetir un bloque mientras una condición siga siendo verdadera?",
        [
          { value: "while", label: "while" },
          { value: "if", label: "if" },
          { value: "const", label: "const" },
        ],
        "while",
        {
          correct: "Correcto. while depende directamente de una condición.",
          incorrect: "while es la estructura diseñada para repetir mientras una condición sea verdadera.",
        }
      ),
      createTrueFalseQuestion(
        "ip_ciclos_q2",
        "Un while mal planteado puede volverse infinito.",
        "verdadero",
        {
          correct: "Sí. Si la condición nunca deja de cumplirse, el ciclo no termina.",
          incorrect: "Hay que actualizar la condición; si no, el ciclo puede quedar infinito.",
        }
      ),
      createCodeFillQuestion(
        "ip_ciclos_q3",
        "Completa el iterable de este ciclo for en Python.",
        "for i in ____:\n    print(i)",
        ["range(3)"],
        {
          correct: "Bien. range(3) genera 0, 1 y 2.",
          incorrect: "En Python, un for suele recorrer un iterable como range(3).",
        },
        "range(3)"
      ),
    ],
  }),
  createLesson({
    id: "ip_funciones",
    topic: "Funciones",
    title: "Definir funciones con def y return",
    order: 6,
    explanation:
      "Las funciones permiten descomponer un problema en subproblemas, algo central en el programa del curso. En Python se definen con def y pueden devolver resultados con return.",
    questions: [
      createMultipleChoiceQuestion(
        "ip_funciones_q1",
        "¿Cuál es una ventaja principal de usar funciones?",
        [
          { value: "reuse", label: "Reutilizar lógica sin repetir código" },
          { value: "delete", label: "Borrar variables automáticamente" },
          { value: "style", label: "Cambiar el color de la interfaz" },
        ],
        "reuse",
        {
          correct: "Exacto. Las funciones ayudan a reutilizar y organizar el código.",
          incorrect: "Piensa en funciones como bloques reutilizables de instrucciones.",
        }
      ),
      createTrueFalseQuestion(
        "ip_funciones_q2",
        "Una función puede devolver un resultado con return.",
        "verdadero",
        {
          correct: "Sí. return entrega un valor para usarlo fuera de la función.",
          incorrect: "return permite que la función devuelva un valor calculado.",
        }
      ),
      createCodeFillQuestion(
        "ip_funciones_q3",
        "Completa el valor que devuelve la función.",
        "def duplicar(numero):\n    return ____",
        ["numero * 2", "numero*2"],
        {
          correct: "Bien. La función devuelve el doble del número recibido.",
          incorrect: "Dentro de return debe ir la expresión que produce el resultado.",
        },
        "numero * 2"
      ),
    ],
  }),
  createLesson({
    id: "ip_listas",
    topic: "Estructuras de datos",
    title: "Listas, tuplas y diccionarios en Python",
    order: 7,
    explanation:
      "El programa del curso menciona listas, tuplas y diccionarios como tipos básicos de Python. Estas estructuras permiten organizar varios datos en una sola variable y modelar mejor un problema.",
    questions: [
      createMultipleChoiceQuestion(
        "ip_listas_q1",
        "¿Qué estructura de Python guarda pares clave-valor?",
        [
          { value: "dict", label: "Diccionario" },
          { value: "tuple", label: "Tupla" },
          { value: "boolean", label: "Booleano" },
        ],
        "dict",
        {
          correct: "Correcto. Un diccionario relaciona claves con valores.",
          incorrect: "La estructura clave-valor en Python es el diccionario.",
        }
      ),
      createTrueFalseQuestion(
        "ip_listas_q2",
        "En Python, el primer elemento de una lista está en la posición 0.",
        "verdadero",
        {
          correct: "Sí. Los índices empiezan en 0.",
          incorrect: "En Python, igual que en muchos lenguajes, las listas empiezan en índice 0.",
        }
      ),
      createCodeFillQuestion(
        "ip_listas_q3",
        "Completa el segundo valor de esta lista de Python.",
        'colores = ["amarillo", ____]',
        ['"negro"', "'negro'"],
        {
          correct: "Bien. Así agregas otro string dentro de la lista.",
          incorrect: "Aquí debe ir otro elemento de la lista, escrito como texto entre comillas.",
        },
        '"negro"'
      ),
    ],
  }),
  createLesson({
    id: "ip_debugging",
    topic: "Pruebas y debugging",
    title: "Ejecutar, probar y corregir en Python",
    order: 8,
    explanation:
      "El programa del curso enfatiza ejecutar, probar y corregir soluciones usando el ambiente del curso. Depurar no es adivinar: es leer errores, revisar valores con print() y corregir paso a paso.",
    questions: [
      createMultipleChoiceQuestion(
        "ip_debugging_q1",
        "¿Para qué sirve print() cuando estás probando un programa?",
        [
          { value: "inspect", label: "Para ver valores y entender qué está pasando" },
          { value: "compile", label: "Para compilar el programa" },
          { value: "save", label: "Para guardar archivos automáticamente" },
        ],
        "inspect",
        {
          correct: "Correcto. print() ayuda a inspeccionar valores durante la ejecución.",
          incorrect: "print() no compila ni guarda; muestra información útil para depurar.",
        }
      ),
      createTrueFalseQuestion(
        "ip_debugging_q2",
        "Leer el mensaje y la línea donde aparece un error ayuda a encontrar la causa más rápido.",
        "verdadero",
        {
          correct: "Sí. La línea y el mensaje suelen dar la primera pista útil.",
          incorrect: "El mensaje y la línea del error son parte clave del proceso de depuración.",
        }
      ),
      createCodeFillQuestion(
        "ip_debugging_q3",
        "Completa el valor que quieres inspeccionar en consola.",
        "print(____)",
        ["resultado"],
        {
          correct: "Bien. Ahora podrías ver en consola qué contiene esa variable.",
          incorrect: "Dentro de print() debes poner la variable o expresión que quieres inspeccionar.",
        },
        "resultado"
      ),
    ],
  }),
];
