const SEEDED_AT = "2026-05-03T00:00:00.000Z";

export const PILOT_SUBJECT_KEY = "IP";
const PRECALCULO_SUBJECT_KEY = "MATE-1201";
const CALCULO_DIFERENCIAL_SUBJECT_KEY = "MATE-1203";

export function normalizeLessonText(value) {
  return `${value ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function createAliases(...aliases) {
  return aliases.map((alias) => normalizeLessonText(alias));
}

export const PILOT_SUBJECT_ALIASES = createAliases(
  "IP",
  "Introduccion a la Programacion",
  "Introduccion a Programacion",
  "Intro a la Programacion",
  "Intro a Programacion"
);

const PRECALCULO_SUBJECT_ALIASES = createAliases(
  "MATE-1201",
  "MATE 1201",
  "MATE1201",
  "1201",
  "Precalculo",
  "Pre calculo",
  "Pre-calculo",
  "MATE-1201 Precalculo"
);

const CALCULO_DIFERENCIAL_SUBJECT_ALIASES = createAliases(
  "MATE-1203",
  "MATE 1203",
  "MATE1203",
  "1203",
  "Calculo Diferencial",
  "Calculo diferencial",
  "Cálculo Diferencial",
  "MATE-1203 Calculo Diferencial"
);

function createLesson({
  subjectName,
  id,
  topic,
  title,
  order,
  explanation,
  questions,
}) {
  return {
    id,
    subjectName,
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

const IP_LESSONS = [
  createLesson({
    subjectName: PILOT_SUBJECT_KEY,
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
    subjectName: PILOT_SUBJECT_KEY,
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
    subjectName: PILOT_SUBJECT_KEY,
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
    subjectName: PILOT_SUBJECT_KEY,
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
    subjectName: PILOT_SUBJECT_KEY,
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
    subjectName: PILOT_SUBJECT_KEY,
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
    subjectName: PILOT_SUBJECT_KEY,
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
    subjectName: PILOT_SUBJECT_KEY,
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

const PRECALCULO_LESSONS = [
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_reales",
    topic: "Números reales",
    title: "Ubicar y comparar números reales",
    order: 1,
    explanation:
      "Precálculo empieza reforzando el sistema de números reales. Vas a distinguir racionales e irracionales, interpretar valor absoluto y describir soluciones simples antes de pasar a expresiones algebraicas.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_reales_q1",
        "¿Cuál de estos números es irracional?",
        [
          { value: "irracional", label: "sqrt(2)" },
          { value: "racional", label: "3/4" },
          { value: "entero", label: "-5" },
        ],
        "irracional",
        {
          correct: "Exacto. sqrt(2) no puede escribirse como fracción de enteros.",
          incorrect: "Busca el número que no puede expresarse como una fracción exacta.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_reales_q2",
        "Todo número entero es racional.",
        "verdadero",
        {
          correct: "Sí. Cualquier entero n puede escribirse como n/1.",
          incorrect: "Recuerda que los enteros también pueden escribirse como fracción con denominador 1.",
        }
      ),
      createCodeFillQuestion(
        "precalculo_reales_q3",
        "Completa el valor absoluto.",
        "|-5| = ____",
        ["5"],
        {
          correct: "Bien. El valor absoluto mide distancia al cero, no signo.",
          incorrect: "El valor absoluto de -5 es su distancia al cero en la recta real.",
        },
        "5"
      ),
    ],
  }),
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_exponentes",
    topic: "Exponentes y radicales",
    title: "Reglas básicas de potencias y raíces",
    order: 2,
    explanation:
      "Las reglas de exponentes y radicales te permiten simplificar expresiones antes de resolver ecuaciones o modelar funciones. Aquí conviene pensar en patrones, no en memoria mecánica.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_exponentes_q1",
        "¿A qué es igual x^2 * x^3?",
        [
          { value: "x5", label: "x^5" },
          { value: "x6", label: "x^6" },
          { value: "doble", label: "2x^5" },
        ],
        "x5",
        {
          correct: "Correcto. Cuando multiplicas potencias de la misma base, sumas exponentes.",
          incorrect: "La base se mantiene y los exponentes se suman.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_exponentes_q2",
        "sqrt(9) = -3.",
        "falso",
        {
          correct: "Sí. La raíz principal de 9 es 3.",
          incorrect: "La raíz cuadrada principal se toma no negativa.",
        }
      ),
      createCodeFillQuestion(
        "precalculo_exponentes_q3",
        "Completa la raíz equivalente.",
        "16^(1/2) = ____",
        ["4"],
        {
          correct: "Bien. Un exponente 1/2 representa raíz cuadrada.",
          incorrect: "Piensa qué número multiplicado por sí mismo da 16.",
        },
        "4"
      ),
    ],
  }),
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_polinomios",
    topic: "Polinomios",
    title: "Reconocer grado y factorizar expresiones",
    order: 3,
    explanation:
      "El curso dedica tiempo a operar y factorizar polinomios. Factorizar ayuda a resolver ecuaciones, simplificar expresiones y detectar estructura antes de hacer cuentas largas.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_polinomios_q1",
        "¿Cuál es el grado de 3x^2 - 5x + 1?",
        [
          { value: "dos", label: "2" },
          { value: "uno", label: "1" },
          { value: "tres", label: "3" },
        ],
        "dos",
        {
          correct: "Exacto. El mayor exponente de x es 2.",
          incorrect: "El grado se determina con el exponente más alto de la variable.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_polinomios_q2",
        "x^2 - 9 puede factorizarse como (x - 3)(x + 3).",
        "verdadero",
        {
          correct: "Sí. Es una diferencia de cuadrados.",
          incorrect: "Recuerda la identidad a^2 - b^2 = (a - b)(a + b).",
        }
      ),
      createCodeFillQuestion(
        "precalculo_polinomios_q3",
        "Completa la factorización por factor común.",
        "x^2 + 5x = x(____)",
        ["x+5"],
        {
          correct: "Bien. Sacar factor común x deja adentro x + 5.",
          incorrect: "Extrae x de ambos términos y revisa qué queda dentro del paréntesis.",
        },
        "x + 5"
      ),
    ],
  }),
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_racionales",
    topic: "Expresiones racionales",
    title: "Simplificar fracciones algebraicas con cuidado",
    order: 4,
    explanation:
      "Las expresiones racionales aparecen durante todo el curso. Antes de simplificar, siempre conviene mirar restricciones del dominio para no perder información importante.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_racionales_q1",
        "¿Qué restricción tiene (x + 1) / (x - 2)?",
        [
          { value: "neq2", label: "x != 2" },
          { value: "neq1", label: "x != 1" },
          { value: "all", label: "No tiene restricciones" },
        ],
        "neq2",
        {
          correct: "Correcto. El denominador no puede ser cero.",
          incorrect: "Busca el valor que hace cero al denominador.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_racionales_q2",
        "La expresión (x^2 - 4) / (x - 2) es igual a x + 2 para todo x.",
        "falso",
        {
          correct: "Sí. Se simplifica a x + 2, pero x = 2 sigue excluido.",
          incorrect: "Aunque se simplifique, debes conservar la restricción original x != 2.",
        }
      ),
      createCodeFillQuestion(
        "precalculo_racionales_q3",
        "Completa la simplificación.",
        "(6/x) * (x/3) = ____",
        ["2"],
        {
          correct: "Bien. x se cancela y 6/3 deja 2.",
          incorrect: "Reduce factores comunes y luego simplifica el cociente numérico.",
        },
        "2"
      ),
    ],
  }),
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_ecuaciones",
    topic: "Ecuaciones y desigualdades",
    title: "Resolver igualdades y comparar soluciones",
    order: 5,
    explanation:
      "El segundo bloque del programa trabaja ecuaciones y desigualdades como lenguaje para modelar restricciones. La idea es transformar paso a paso sin perder equivalencia.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_ecuaciones_q1",
        "¿Cuál es la solución de 2x + 3 = 11?",
        [
          { value: "cuatro", label: "x = 4" },
          { value: "cinco", label: "x = 5" },
          { value: "dos", label: "x = 2" },
        ],
        "cuatro",
        {
          correct: "Correcto. Restas 3 y luego divides entre 2.",
          incorrect: "Aísla la x paso a paso: primero quita el 3 y luego divide.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_ecuaciones_q2",
        "La ecuación x^2 = 9 tiene dos soluciones reales.",
        "verdadero",
        {
          correct: "Sí. Sus soluciones reales son x = 3 y x = -3.",
          incorrect: "Piensa en los dos números cuyo cuadrado da 9.",
        }
      ),
      createCodeFillQuestion(
        "precalculo_ecuaciones_q3",
        "Completa la desigualdad equivalente.",
        "x - 5 > 1  =>  x > ____",
        ["6"],
        {
          correct: "Bien. Sumar 5 a ambos lados deja x > 6.",
          incorrect: "Haz la misma operación en ambos lados para aislar la variable.",
        },
        "6"
      ),
    ],
  }),
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_sistemas",
    topic: "Sistemas y modelación",
    title: "Pensar dos ecuaciones al mismo tiempo",
    order: 6,
    explanation:
      "Los sistemas lineales te obligan a encontrar valores que satisfacen varias condiciones a la vez. En modelación, eso sirve para traducir una situación verbal a relaciones entre cantidades.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_sistemas_q1",
        "¿Qué representa la solución de un sistema de ecuaciones?",
        [
          { value: "ambas", label: "Los valores que satisfacen ambas ecuaciones" },
          { value: "primera", label: "Los valores que satisfacen solo la primera" },
          { value: "grafica", label: "Cualquier punto dibujado en el plano" },
        ],
        "ambas",
        {
          correct: "Exacto. La solución debe cumplir todas las ecuaciones del sistema.",
          incorrect: "Una solución válida debe hacer verdaderas todas las ecuaciones a la vez.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_sistemas_q2",
        "Si dos rectas son paralelas y distintas, el sistema no tiene solución.",
        "verdadero",
        {
          correct: "Sí. Si nunca se cruzan, no hay punto común.",
          incorrect: "Piensa en la interpretación gráfica: rectas paralelas distintas no se intersectan.",
        }
      ),
      createCodeFillQuestion(
        "precalculo_sistemas_q3",
        "Completa el valor faltante del sistema.",
        "x + y = 10\nx = 4\ny = ____",
        ["6"],
        {
          correct: "Bien. Si x vale 4, entonces y debe valer 6 para sumar 10.",
          incorrect: "Sustituye el valor de x en la ecuación y despeja la otra variable.",
        },
        "6"
      ),
    ],
  }),
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_funciones",
    topic: "Funciones",
    title: "Dominio, rango y lectura de gráficas",
    order: 7,
    explanation:
      "Una parte central de Precálculo es interpretar funciones como reglas y como gráficas. Dominio y rango te dicen qué entradas y salidas tienen sentido dentro de un problema.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_funciones_q1",
        "¿Qué caracteriza a una función?",
        [
          { value: "una", label: "Cada entrada tiene una única salida" },
          { value: "muchas", label: "Cada entrada puede tener cualquier número de salidas" },
          { value: "ninguna", label: "No necesita relacionar entradas con salidas" },
        ],
        "una",
        {
          correct: "Correcto. Una función asigna una sola salida a cada entrada válida.",
          incorrect: "La idea clave es que una entrada no puede producir dos salidas distintas.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_funciones_q2",
        "El dominio real de sqrt(x) es x >= 0.",
        "verdadero",
        {
          correct: "Sí. En números reales no puedes sacar raíz cuadrada de negativos.",
          incorrect: "Para raíces cuadradas reales, la entrada debe ser no negativa.",
        }
      ),
      createCodeFillQuestion(
        "precalculo_funciones_q3",
        "Evalúa la función en el valor dado.",
        "f(x) = 2x + 1\nf(3) = ____",
        ["7"],
        {
          correct: "Bien. Sustituir x = 3 da 2(3) + 1 = 7.",
          incorrect: "Reemplaza x por 3 y realiza la operación completa.",
        },
        "7"
      ),
    ],
  }),
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_composicion",
    topic: "Composición e inversa",
    title: "Operar funciones sin perder la estructura",
    order: 8,
    explanation:
      "Después de reconocer funciones, el curso pide operarlas, componerlas e invertirlas cuando sea posible. Aquí importa seguir el orden correcto y revisar si la función es uno a uno.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_composicion_q1",
        "¿Qué significa (f o g)(x)?",
        [
          { value: "fog", label: "f(g(x))" },
          { value: "gof", label: "g(f(x))" },
          { value: "sum", label: "f(x) + g(x)" },
        ],
        "fog",
        {
          correct: "Exacto. Primero aplicas g y luego aplicas f al resultado.",
          incorrect: "La composición f o g se lee de derecha a izquierda sobre la entrada.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_composicion_q2",
        "La función f(x) = x + 4 tiene inversa en los reales.",
        "verdadero",
        {
          correct: "Sí. Es una función lineal uno a uno.",
          incorrect: "Una recta con pendiente no nula sí puede invertirse en los reales.",
        }
      ),
      createCodeFillQuestion(
        "precalculo_composicion_q3",
        "Completa la inversa.",
        "Si f(x) = x + 4, entonces f^-1(x) = ____",
        ["x-4", "-4+x"],
        {
          correct: "Bien. La inversa deshace la suma de 4 restando 4.",
          incorrect: "La inversa debe revertir la operación original.",
        },
        "x - 4"
      ),
    ],
  }),
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_expo_log",
    topic: "Exponenciales y logaritmos",
    title: "Relacionar crecimiento e inversa logarítmica",
    order: 9,
    explanation:
      "Las funciones exponenciales modelan crecimiento o decrecimiento, y los logaritmos aparecen como su proceso inverso. Este bloque es clave antes de entrar a cálculo.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_expo_log_q1",
        "¿Cuál es la función inversa de y = 2^x?",
        [
          { value: "log2", label: "y = log_2(x)" },
          { value: "ln", label: "y = ln(2x)" },
          { value: "square", label: "y = x^2" },
        ],
        "log2",
        {
          correct: "Correcto. El logaritmo en base 2 deshace la exponencial base 2.",
          incorrect: "La inversa debe deshacer la operación elevar 2 a una potencia.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_expo_log_q2",
        "log_10(100) = 2.",
        "verdadero",
        {
          correct: "Sí. 10^2 = 100.",
          incorrect: "Pregúntate a qué potencia debes elevar 10 para obtener 100.",
        }
      ),
      createCodeFillQuestion(
        "precalculo_expo_log_q3",
        "Completa la potencia.",
        "2^5 = ____",
        ["32"],
        {
          correct: "Bien. 2 multiplicado por sí mismo cinco veces da 32.",
          incorrect: "Cuenta la multiplicación repetida o usa la tabla de potencias de 2.",
        },
        "32"
      ),
    ],
  }),
  createLesson({
    subjectName: PRECALCULO_SUBJECT_KEY,
    id: "precalculo_trigonometria",
    topic: "Trigonometría",
    title: "Seno, coseno y medida de ángulos",
    order: 10,
    explanation:
      "El cuarto módulo del programa introduce funciones trigonométricas, identidades y gráficas. Antes de llegar allá, conviene tener claras las razones básicas y el paso entre grados y radianes.",
    questions: [
      createMultipleChoiceQuestion(
        "precalculo_trigonometria_q1",
        "En un triángulo rectángulo, sin(theta) es:",
        [
          { value: "seno", label: "cateto opuesto / hipotenusa" },
          { value: "coseno", label: "cateto adyacente / hipotenusa" },
          { value: "tangente", label: "cateto opuesto / cateto adyacente" },
        ],
        "seno",
        {
          correct: "Correcto. Esa es la razón seno.",
          incorrect: "Recuerda la definición de seno en triángulos rectángulos.",
        }
      ),
      createTrueFalseQuestion(
        "precalculo_trigonometria_q2",
        "cos(0) = 1.",
        "verdadero",
        {
          correct: "Sí. En el círculo unitario, el coseno de 0 es 1.",
          incorrect: "Revisa el punto inicial del círculo unitario.",
        }
      ),
      createCodeFillQuestion(
        "precalculo_trigonometria_q3",
        "Completa la equivalencia angular.",
        "180 grados = ____ radianes",
        ["pi"],
        {
          correct: "Bien. 180 grados corresponden a pi radianes.",
          incorrect: "La mitad de una vuelta completa equivale a pi radianes.",
        },
        "pi"
      ),
    ],
  }),
];

const CALCULO_DIFERENCIAL_LESSONS = [
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_funciones",
    topic: "Funciones y gráficas",
    title: "Leer funciones antes de derivar",
    order: 1,
    explanation:
      "Cálculo diferencial arranca repasando funciones y sus gráficas. Antes de hablar de cambio, necesitas identificar dominio, rango y comportamiento básico de la función.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_funciones_q1",
        "¿Qué describe mejor a una función?",
        [
          { value: "regla", label: "Una regla que asigna una única salida a cada entrada" },
          { value: "tabla", label: "Una lista sin relación entre valores" },
          { value: "grafica", label: "Solo un dibujo en el plano" },
        ],
        "regla",
        {
          correct: "Exacto. La gráfica es una representación, pero la idea base es la regla de asignación.",
          incorrect: "Una función no es solo una imagen; es una regla con entradas y salidas.",
        }
      ),
      createTrueFalseQuestion(
        "calculo_funciones_q2",
        "El dominio de 1 / (x - 2) excluye x = 2.",
        "verdadero",
        {
          correct: "Sí. El denominador no puede ser cero.",
          incorrect: "Busca el valor que anula el denominador.",
        }
      ),
      createCodeFillQuestion(
        "calculo_funciones_q3",
        "Evalúa la función.",
        "f(x) = x^2\nf(3) = ____",
        ["9"],
        {
          correct: "Bien. Al sustituir 3 obtienes 3^2 = 9.",
          incorrect: "Reemplaza x por 3 y luego calcula la potencia.",
        },
        "9"
      ),
    ],
  }),
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_algebra_funciones",
    topic: "Álgebra de funciones",
    title: "Composición e inversa con mirada de cálculo",
    order: 2,
    explanation:
      "El programa trabaja operaciones entre funciones, composición e inversa porque luego aparecen dentro de límites y derivadas. Si aquí el orden se enreda, después todo se vuelve más costoso.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_algebra_funciones_q1",
        "¿Qué significa (f o g)(x)?",
        [
          { value: "fog", label: "f(g(x))" },
          { value: "gof", label: "g(f(x))" },
          { value: "producto", label: "f(x) * g(x)" },
        ],
        "fog",
        {
          correct: "Correcto. Primero entras por g y luego por f.",
          incorrect: "La composición se aplica de adentro hacia afuera.",
        }
      ),
      createTrueFalseQuestion(
        "calculo_algebra_funciones_q2",
        "Una función invertible debe ser uno a uno en el dominio considerado.",
        "verdadero",
        {
          correct: "Sí. Si dos entradas distintas comparten salida, la inversa falla.",
          incorrect: "La inversa necesita poder recuperar una única entrada desde cada salida.",
        }
      ),
      createCodeFillQuestion(
        "calculo_algebra_funciones_q3",
        "Completa la inversa.",
        "Si f(x) = x + 5, entonces f^-1(x) = ____",
        ["x-5", "-5+x"],
        {
          correct: "Bien. La inversa deshace la suma de 5 restando 5.",
          incorrect: "Piensa qué operación revierte sumar 5.",
        },
        "x - 5"
      ),
    ],
  }),
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_exponenciales",
    topic: "Exponenciales y logaritmos",
    title: "Preparar funciones clave del curso",
    order: 3,
    explanation:
      "Las funciones exponenciales y logarítmicas reaparecen en límites, derivadas y aplicaciones. Conviene recordar que son inversas y que tienen dominios distintos.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_exponenciales_q1",
        "¿Qué función deshace a y = e^x?",
        [
          { value: "ln", label: "y = ln(x)" },
          { value: "exp", label: "y = e^(1/x)" },
          { value: "sqrt", label: "y = sqrt(x)" },
        ],
        "ln",
        {
          correct: "Exacto. ln(x) es la inversa natural de e^x.",
          incorrect: "Busca la función que responde: ¿a qué exponente debo elevar e?",
        }
      ),
      createTrueFalseQuestion(
        "calculo_exponenciales_q2",
        "ln(1) = 0.",
        "verdadero",
        {
          correct: "Sí. e^0 = 1.",
          incorrect: "Recuerda que ln pregunta qué exponente convierte e en ese valor.",
        }
      ),
      createCodeFillQuestion(
        "calculo_exponenciales_q3",
        "Completa el logaritmo decimal.",
        "log_10(100) = ____",
        ["2"],
        {
          correct: "Bien. 10^2 = 100.",
          incorrect: "Pregúntate qué potencia de 10 produce 100.",
        },
        "2"
      ),
    ],
  }),
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_limites",
    topic: "Límites",
    title: "Entender la idea de acercarse a un valor",
    order: 4,
    explanation:
      "El límite formaliza qué valor se aproxima una función aunque no necesariamente lo tome. Esa idea es la base conceptual de continuidad, derivada e integral.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_limites_q1",
        "¿Qué describe un límite cuando x se acerca a a?",
        [
          { value: "aproxima", label: "El valor al que f(x) se aproxima" },
          { value: "exacto", label: "Solo el valor exacto de f(a)" },
          { value: "dominio", label: "Todos los valores permitidos de x" },
        ],
        "aproxima",
        {
          correct: "Correcto. El límite habla de comportamiento cercano, no solo del valor puntual.",
          incorrect: "Piensa en qué pasa alrededor del punto, no únicamente en el punto.",
        }
      ),
      createTrueFalseQuestion(
        "calculo_limites_q2",
        "Una función puede tener límite en un punto aunque no esté definida exactamente allí.",
        "verdadero",
        {
          correct: "Sí. El límite depende del comportamiento alrededor del punto.",
          incorrect: "El valor en el punto y el comportamiento alrededor pueden ser cosas distintas.",
        }
      ),
      createCodeFillQuestion(
        "calculo_limites_q3",
        "Completa el límite directo.",
        "lim x->2 de (x + 1) = ____",
        ["3"],
        {
          correct: "Bien. Si la función es continua allí, basta con sustituir.",
          incorrect: "Prueba sustituyendo x por 2 en la expresión.",
        },
        "3"
      ),
    ],
  }),
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_calculo_limites",
    topic: "Cálculo de límites",
    title: "Resolver 0/0 sin caer en piloto automático",
    order: 5,
    explanation:
      "Cuando aparece una forma indeterminada como 0/0, el curso te pide transformar la expresión antes de concluir. Factorizar, simplificar o racionalizar suele destrabar el cálculo.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_calculo_limites_q1",
        "Si al sustituir aparece 0/0, ¿qué conviene hacer primero?",
        [
          { value: "transformar", label: "Transformar la expresión antes de concluir" },
          { value: "cero", label: "Decir inmediatamente que el límite es 0" },
          { value: "uno", label: "Decir inmediatamente que el límite es 1" },
        ],
        "transformar",
        {
          correct: "Exacto. 0/0 no decide nada por sí sola.",
          incorrect: "Una indeterminación exige reescribir la expresión antes de decidir.",
        }
      ),
      createTrueFalseQuestion(
        "calculo_calculo_limites_q2",
        "Si el denominador tiende a 0 y el numerador no, el límite puede no existir como número finito.",
        "verdadero",
        {
          correct: "Sí. Allí suelen aparecer explosiones a infinito o comportamientos laterales distintos.",
          incorrect: "Dividir entre algo que se acerca a 0 puede hacer crecer mucho la expresión.",
        }
      ),
      createCodeFillQuestion(
        "calculo_calculo_limites_q3",
        "Completa el resultado después de simplificar.",
        "lim x->3 de (x^2 - 9) / (x - 3) = ____",
        ["6"],
        {
          correct: "Bien. Factorizar deja x + 3, y luego sustituyes x = 3.",
          incorrect: "Prueba factorizar el numerador antes de sustituir.",
        },
        "6"
      ),
    ],
  }),
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_continuidad",
    topic: "Continuidad",
    title: "Cuándo una función no se rompe",
    order: 6,
    explanation:
      "La continuidad conecta el valor de la función con su límite. En cálculo, detectar discontinuidades te ayuda a anticipar problemas antes de derivar o integrar.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_continuidad_q1",
        "¿Qué se necesita para que f sea continua en x = a?",
        [
          { value: "tres", label: "Que exista f(a), exista el límite y ambos coincidan" },
          { value: "solo_valor", label: "Solo que exista f(a)" },
          { value: "solo_limite", label: "Solo que exista el límite" },
        ],
        "tres",
        {
          correct: "Correcto. Continuidad exige esas tres piezas juntas.",
          incorrect: "No basta con una sola condición; valor y límite deben existir y coincidir.",
        }
      ),
      createTrueFalseQuestion(
        "calculo_continuidad_q2",
        "Si f(a) existe y el límite existe pero son distintos, la función no es continua en a.",
        "verdadero",
        {
          correct: "Sí. Allí hay una ruptura entre el comportamiento cercano y el valor asignado.",
          incorrect: "Continuidad exige que el valor puntual y el límite sean el mismo.",
        }
      ),
      createCodeFillQuestion(
        "calculo_continuidad_q3",
        "Completa el punto de discontinuidad.",
        "Si f(x) = 1 / (x - 4), f no es continua en x = ____",
        ["4"],
        {
          correct: "Bien. En x = 4 el denominador se hace cero.",
          incorrect: "Busca el valor que anula el denominador.",
        },
        "4"
      ),
    ],
  }),
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_derivada",
    topic: "Derivada",
    title: "Razón de cambio instantánea y pendiente",
    order: 7,
    explanation:
      "La derivada resume qué tan rápido cambia una cantidad y, geométricamente, la pendiente de la recta tangente. Es el concepto central del curso.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_derivada_q1",
        "¿Qué interpreta la derivada de una función en un punto?",
        [
          { value: "cambio", label: "La razón de cambio instantánea" },
          { value: "area", label: "El área bajo la curva" },
          { value: "dominio", label: "Todos los valores posibles de entrada" },
        ],
        "cambio",
        {
          correct: "Exacto. La derivada mide cambio instantáneo y pendiente tangente.",
          incorrect: "Aquí estamos midiendo variación local, no área ni dominio.",
        }
      ),
      createTrueFalseQuestion(
        "calculo_derivada_q2",
        "Si f'(x) es positiva en una región, la función está creciendo allí.",
        "verdadero",
        {
          correct: "Sí. Una derivada positiva indica pendiente ascendente.",
          incorrect: "Relaciona el signo de la derivada con el crecimiento de la gráfica.",
        }
      ),
      createCodeFillQuestion(
        "calculo_derivada_q3",
        "Completa la derivada básica.",
        "Si f(x) = x^2, entonces f'(x) = ____",
        ["2x", "2*x"],
        {
          correct: "Bien. Esa es la derivada elemental de x^2.",
          incorrect: "Aplica la regla de la potencia: baja el exponente y réstale uno.",
        },
        "2x"
      ),
    ],
  }),
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_reglas_derivacion",
    topic: "Reglas de derivación",
    title: "Derivar sin volver siempre a la definición",
    order: 8,
    explanation:
      "Una vez entiendes la idea de derivada, el curso pasa a reglas prácticas para funciones elementales. Esa caja de herramientas permite analizar problemas reales con rapidez.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_reglas_derivacion_q1",
        "¿Cuál es la derivada de x^3?",
        [
          { value: "tresx2", label: "3x^2" },
          { value: "x2", label: "x^2" },
          { value: "cuatrox2", label: "4x^2" },
        ],
        "tresx2",
        {
          correct: "Correcto. La regla de la potencia da 3x^2.",
          incorrect: "Multiplica por el exponente y luego réstale uno al exponente original.",
        }
      ),
      createTrueFalseQuestion(
        "calculo_reglas_derivacion_q2",
        "La derivada de una constante es 0.",
        "verdadero",
        {
          correct: "Sí. Una constante no cambia.",
          incorrect: "Si no hay cambio, la razón de cambio es cero.",
        }
      ),
      createCodeFillQuestion(
        "calculo_reglas_derivacion_q3",
        "Completa la derivada lineal.",
        "d/dx (5x + 1) = ____",
        ["5"],
        {
          correct: "Bien. La pendiente de una función lineal ax + b es a.",
          incorrect: "Deriva término a término: 5x aporta 5 y la constante desaparece.",
        },
        "5"
      ),
    ],
  }),
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_optimizacion",
    topic: "Optimización y gráficas",
    title: "Usar la derivada para leer extremos",
    order: 9,
    explanation:
      "El curso usa derivadas y el teorema del valor medio para estudiar crecimiento, decrecimiento y extremos. Eso permite justificar máximos, mínimos y comportamientos de la gráfica.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_optimizacion_q1",
        "¿Qué suele indicar un punto crítico interior suave?",
        [
          { value: "cero", label: "Que f'(x) puede ser 0 allí" },
          { value: "infinito", label: "Que la función deja de existir" },
          { value: "constante", label: "Que la función es constante en todo el dominio" },
        ],
        "cero",
        {
          correct: "Correcto. Un máximo o mínimo interior suave suele pasar por f'(x) = 0.",
          incorrect: "En optimización, los candidatos interiores suelen aparecer cuando la derivada se anula.",
        }
      ),
      createTrueFalseQuestion(
        "calculo_optimizacion_q2",
        "Si f'(x) cambia de positiva a negativa, puede aparecer un máximo local.",
        "verdadero",
        {
          correct: "Sí. La función pasa de crecer a decrecer.",
          incorrect: "Revisa cómo el signo de la derivada cambia alrededor del punto.",
        }
      ),
      createCodeFillQuestion(
        "calculo_optimizacion_q3",
        "Completa la velocidad como derivada de la posición.",
        "Si s(t) = t^2, entonces v(t) = s'(t) = ____",
        ["2t", "2*t"],
        {
          correct: "Bien. La velocidad es la derivada de la posición.",
          incorrect: "Deriva t^2 con la regla de la potencia.",
        },
        "2t"
      ),
    ],
  }),
  createLesson({
    subjectName: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    id: "calculo_integral",
    topic: "Integral",
    title: "Acumulación, antiderivada y teorema fundamental",
    order: 10,
    explanation:
      "Aunque el curso se llama diferencial, el programa cierra conectando derivada e integral. La integral definida se entiende como acumulación y como límite de sumas de Riemann.",
    questions: [
      createMultipleChoiceQuestion(
        "calculo_integral_q1",
        "¿Qué interpreta mejor una integral definida en este nivel?",
        [
          { value: "acumulacion", label: "Acumulación o área neta en un intervalo" },
          { value: "pendiente", label: "La pendiente de la recta tangente" },
          { value: "dominio", label: "Los valores permitidos de la variable" },
        ],
        "acumulacion",
        {
          correct: "Exacto. La integral suma contribuciones pequeñas a lo largo de un intervalo.",
          incorrect: "Aquí la idea central es acumular cambio o área neta, no medir pendiente.",
        }
      ),
      createTrueFalseQuestion(
        "calculo_integral_q2",
        "Si F'(x) = f(x), entonces F es una antiderivada de f.",
        "verdadero",
        {
          correct: "Sí. Esa es la relación básica entre derivada y antiderivada.",
          incorrect: "Antiderivar significa encontrar una función cuya derivada sea f.",
        }
      ),
      createCodeFillQuestion(
        "calculo_integral_q3",
        "Completa la integral constante.",
        "integral de 0 a 1 de 1 dx = ____",
        ["1"],
        {
          correct: "Bien. El área de un rectángulo de base 1 y altura 1 es 1.",
          incorrect: "Piensa en el área bajo la recta y = 1 entre 0 y 1.",
        },
        "1"
      ),
    ],
  }),
];

export const SEEDED_SUBJECTS = [
  {
    key: PILOT_SUBJECT_KEY,
    codes: ["ISIS1221"],
    lessons: IP_LESSONS,
  },
  {
    key: PRECALCULO_SUBJECT_KEY,
    codes: ["MATE1201"],
    lessons: PRECALCULO_LESSONS,
  },
  {
    key: CALCULO_DIFERENCIAL_SUBJECT_KEY,
    codes: ["MATE1203"],
    lessons: CALCULO_DIFERENCIAL_LESSONS,
  },
];

export const SEEDED_LESSONS = SEEDED_SUBJECTS.flatMap((subject) => subject.lessons);
export const PILOT_LESSONS = IP_LESSONS;

function getSubjectCode(subject) {
  return normalizeCourseCode(subject?.code);
}

export function getSeededSubjectConfig(subject) {
  const code = getSubjectCode(subject);
  return SEEDED_SUBJECTS.find((seededSubject) =>
    seededSubject.codes.includes(code)
  ) ?? null;
}

export function isSeededSubject(subject) {
  return Boolean(getSeededSubjectConfig(subject));
}

export function isPilotSubject(subject) {
  return getLessonSubjectKey(subject) === PILOT_SUBJECT_KEY;
}

export function getLessonSubjectKey(subject) {
  return getSeededSubjectConfig(subject)?.key ?? subject?.name ?? "";
}

export function getSeededLessonsForSubject(subject) {
  return getSeededSubjectConfig(subject)?.lessons ?? [];
}

export function normalizeCourseCode(value) {
  return `${value ?? ""}`
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}


