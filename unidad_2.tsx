"use client"

import { useState, useRef, useEffect } from "react"
import { Star, ArrowLeft, Volume2, Check, X, HelpCircle, Award, Lightbulb, VolumeX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAudio } from "./app/contexts/AudioContext"
import useProgress from "./app/hooks/useProgress"
import confetti from "canvas-confetti"

// Datos para las reglas de mayúsculas
const reglasData = [
    {
        titulo: "Inicio de Oración",
        descripcion: "Siempre se escribe con mayúscula la primera letra de una oración.",
        ejemplos: [
            {
                correcto: "El perro ladra fuerte.",
                incorrecto: "el perro ladra fuerte.",
                explicacion: "Toda oración debe comenzar con mayúscula",
            },
            {
                correcto: "Mañana iremos al parque.",
                incorrecto: "mañana iremos al parque.",
                explicacion: "La primera palabra siempre va con mayúscula",
            },
            {
                correcto: "¿Cómo estás hoy?",
                incorrecto: "¿cómo estás hoy?",
                explicacion: "Las preguntas también empiezan con mayúscula",
            },
            {
                correcto: "¡Qué hermoso día!",
                incorrecto: "¡qué hermoso día!",
                explicacion: "Las exclamaciones inician con mayúscula",
            },
        ],
    },
    {
        titulo: "Nombres Propios",
        descripcion: "Los nombres de personas, lugares y cosas específicas van con mayúscula.",
        ejemplos: [
            {
                correcto: "María vive en España.",
                incorrecto: "maría vive en españa.",
                explicacion: "Los nombres de personas y países van con mayúscula",
            },
            {
                correcto: "El río Amazonas es muy largo.",
                incorrecto: "el río amazonas es muy largo.",
                explicacion: "Los nombres de ríos son nombres propios",
            },
            {
                correcto: "Mi perro se llama Max.",
                incorrecto: "mi perro se llama max.",
                explicacion: "Los nombres de mascotas van con mayúscula",
            },
            {
                correcto: "Visitamos el museo del Prado.",
                incorrecto: "visitamos el museo del prado.",
                explicacion: "Los nombres de lugares específicos van con mayúscula",
            },
        ],
    },
    {
        titulo: "Después de Punto",
        descripcion: "Después de un punto siempre se escribe con mayúscula.",
        ejemplos: [
            {
                correcto: "Llueve mucho. El cielo está gris.",
                incorrecto: "llueve mucho. el cielo está gris.",
                explicacion: "Después de punto seguido va mayúscula",
            },
            {
                correcto: "Terminé la tarea. Ahora puedo jugar.",
                incorrecto: "terminé la tarea. ahora puedo jugar.",
                explicacion: "La palabra después del punto inicia con mayúscula",
            },
            {
                correcto: "Es tarde. Debo irme a casa.",
                incorrecto: "es tarde. debo irme a casa.",
                explicacion: "Siempre mayúscula después de punto",
            },
            {
                correcto: "Me gusta leer. Los libros son geniales.",
                incorrecto: "me gusta leer. los libros son geniales.",
                explicacion: "Nueva oración, nueva mayúscula",
            },
        ],
    },
]

// Oraciones para completar
const oracionesCompletar = [
    {
        oracion: "_aria y _edro van a _adrid.",
        opciones: ["M", "m"],
        correctas: ["M", "P", "M"],
        pista: "Nombres de personas y lugares",
    },
    {
        oracion: "el _ío _bro pasa por _eville.",
        opciones: ["R", "r"],
        correctas: ["r", "E", "S"],
        pista: "Río es común, pero Ebro y Sevilla son propios",
    },
    {
        oracion: "_oy es _unes. _iene a visitarme.",
        opciones: ["H", "h"],
        correctas: ["H", "l", "V"],
        pista: "Inicio de oración y después de punto",
    },
    {
        oracion: "mi _erro se llama _oby.",
        opciones: ["P", "p"],
        correctas: ["p", "T"],
        pista: "Perro es común, Toby es nombre propio",
    },
    {
        oracion: "_stamos en _iciembre. _ace mucho frío.",
        opciones: ["E", "e"],
        correctas: ["E", "d", "H"],
        pista: "Inicio de oración y después de punto",
    },
    {
        oracion: "el _lanet _ierra es _zul.",
        opciones: ["P", "p"],
        correctas: ["p", "T", "a"],
        pista: "Planeta es común, Tierra es nombre propio",
    },
    {
        oracion: "_éxico está en _mérica. _s un _aís hermoso.",
        opciones: ["M", "m"],
        correctas: ["M", "A", "E", "p"],
        pista: "Países y continentes son nombres propios",
    },
    {
        oracion: "la _aestra _aría enseña _atemáticas.",
        opciones: ["M", "m"],
        correctas: ["m", "M", "m"],
        pista: "Maestra es común, María es nombre propio",
    },
    {
        oracion: "_l _ol sale por el _ste.",
        opciones: ["E", "e"],
        correctas: ["E", "s", "e"],
        pista: "Inicio de oración, sol es común, este es dirección",
    },
    {
        oracion: "¿_ónde vives? _ivo en _arcelona.",
        opciones: ["D", "d"],
        correctas: ["D", "V", "B"],
        pista: "Inicio de pregunta, respuesta y nombre de ciudad",
    },
]

// Textos para corregir
const textosCorregir = [
    {
        texto: "ayer fui al cine con ana. vimos una película muy divertida.",
        errores: [0, 21], // posiciones de los errores
        correccion: "Ayer fui al cine con Ana. Vimos una película muy divertida.",
        explicacion: "Inicio de oración y nombre propio",
    },
    {
        texto: "mi ciudad favorita es parís. está en francia.",
        errores: [0, 22, 37],
        correccion: "Mi ciudad favorita es París. Está en Francia.",
        explicacion: "Nombres de ciudades y países",
    },
    {
        texto: "el río nilo está en áfrica. es muy largo.",
        errores: [0, 20, 28],
        correccion: "El río Nilo está en África. Es muy largo.",
        explicacion: "Inicio de oración y nombres propios",
    },
    {
        texto: "¿conoces a juan? vive en madrid.",
        errores: [1, 11, 25],
        correccion: "¿Conoces a Juan? Vive en Madrid.",
        explicacion: "Nombres de personas y lugares",
    },
    {
        texto: "hoy es martes. mañana es miércoles.",
        errores: [0, 15],
        correccion: "Hoy es martes. Mañana es miércoles.",
        explicacion: "Inicio de oración y después de punto",
    },
]

// Nombres propios para sopa de letras
const nombresPropios = ["MARIA", "JUAN", "MADRID", "ESPAÑA", "LUNA", "TIERRA"]

// Tipos de actividades
type Actividad = "diferencias" | "completar" | "dictado" | "sopa"



export default function Unidad2() {
    const router = useRouter()
    const [actividad, setActividad] = useState<Actividad>("diferencias")
    const [reglaActual, setReglaActual] = useState(0)
    const [preguntaActual, setPreguntaActual] = useState(0)
    const [respuestas, setRespuestas] = useState<boolean[]>([])
    const [mostrarResultado, setMostrarResultado] = useState<boolean | null>(null)
    const [puntuacion, setPuntuacion] = useState(0)
    const [actividadCompletada, setActividadCompletada] = useState(false)
    const [textoActual, setTextoActual] = useState("")
    const [erroresEncontrados, setErroresEncontrados] = useState<number[]>([])
    const [sopaLetras, setSopaLetras] = useState<string[][]>([])
    const [palabrasEncontradas, setPalabrasEncontradas] = useState<string[]>([])
    const [seleccionInicio, setSeleccionInicio] = useState<{ row: number; col: number } | null>(null)
    const [seleccionActual, setSeleccionActual] = useState<{ row: number; col: number } | null>(null)
    const [palabrasSeleccionadas, setPalabrasSeleccionadas] = useState<
        { palabra: string; celdas: { row: number; col: number }[] }[]
    >([])
    const sopaRef = useRef<HTMLDivElement>(null)
    const { isMusicPlaying, isMuted, toggleMusic, toggleMute } = useAudio()
    const [selectedAvatar, setSelectedAvatar] = useState("🐱")
    // Modificado para usar el sistema de progreso
    const { progress, updateActivity } = useProgress("unidad2")
    const [puntosUnidad, setPuntosUnidad] = useState(0)
    const [estrellasUnidad, setEstrellasUnidad] = useState(0)
    const [fallos, setFallos] = useState(0);

    useEffect(() => {
        const savedAvatar = localStorage.getItem("ortografia-avatar")
        if (savedAvatar) {
            setSelectedAvatar(savedAvatar)
        }
    }, [])

    // Cargar puntos y estrellas de la unidad
    useEffect(() => {
        if (progress && progress.units && progress.units.unidad2) {
            const unidad = progress.units.unidad2;

            let totalPuntos = 0;
            Object.values(unidad.activities).forEach(activity => {
                if (activity && activity.lastScore) {
                    totalPuntos += Math.round((activity.lastScore / 100) * 50);
                }
            });
            setPuntosUnidad(totalPuntos);
            setEstrellasUnidad(unidad.stars);
        }
    }, [progress]);

    // Función para reproducir sonido de texto
    const reproducirSonido = (texto: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(texto)
            utterance.lang = "es-ES"
            speechSynthesis.speak(utterance)
        }
    }

    const verificarRespuesta = (respuesta: string, correcta: string) => {
        const esCorrecta = respuesta === correcta;
        setMostrarResultado(esCorrecta);

        const nuevosFallos = esCorrecta ? fallos : fallos + 1;
        if (!esCorrecta) {
            setFallos(n => n + 1);
        }

        if (esCorrecta) setPuntuacion(p => p + 10);
        setRespuestas(r => [...r, esCorrecta]);

        setTimeout(() => {
            setMostrarResultado(null);
            if (preguntaActual < 9) {
                setPreguntaActual(p => p + 1);
            } else {
                setActividadCompletada(true);
                const respuestasCorrectas = [...respuestas, esCorrecta].filter(Boolean).length;
                const porcentajeExito = (respuestasCorrectas / 10) * 100;

                if (nuevosFallos < 3) {
                    updateActivity("completar", {
                        attempts: 1,
                        lastScore: porcentajeExito,
                        completed: true,
                        stars: porcentajeExito >= 90 ? 1 : 0,
                    });
                }
            }
        }, 1500);
    };


    const handleTextoClick = (posicion: number) => {
        const textoData = textosCorregir[preguntaActual];

        if (textoData.errores.includes(posicion)) {
            if (!erroresEncontrados.includes(posicion)) {
                const nuevosErrores = [...erroresEncontrados, posicion];
                setErroresEncontrados(nuevosErrores);
                setPuntuacion((prev) => prev + 20);
                if (nuevosErrores.length === textoData.errores.length) {
                    setTimeout(() => {
                        if (preguntaActual < textosCorregir.length - 1) {
                            setPreguntaActual((prev) => prev + 1);
                            setErroresEncontrados([]);
                        } else {
                            const totalErrores = textosCorregir.reduce((acc, texto) => acc + texto.errores.length, 0);
                            const erroresEncontradosTotal = nuevosErrores.length +
                                textosCorregir.slice(0, preguntaActual).reduce((acc, texto) => acc + texto.errores.length, 0);
                            const porcentajeExito = (erroresEncontradosTotal / totalErrores) * 100;

                            if (fallos < 3) {
                                updateActivity("dictado", {
                                    attempts: 1,
                                    lastScore: porcentajeExito,
                                    completed: true,
                                    stars: 1
                                });
                            }

                            setActividadCompletada(true);
                        }
                    }, 1000);
                }
            }
        } else {
            setFallos(prev => prev + 1);
        }
    };

    // Función para cambiar de actividad
    const cambiarActividad = (nuevaActividad: Actividad) => {
        if (actividad !== nuevaActividad && actividad === "diferencias") {
            updateActivity("diferencias", {
                attempts: 1,
                lastScore: 100,
                completed: true,
                stars: 1,
            });
        }

        setActividad(nuevaActividad);
        setPreguntaActual(0);
        setRespuestas([]);
        setMostrarResultado(null);
        setActividadCompletada(false);
        setErroresEncontrados([]);

        if (nuevaActividad === "dictado") {
            setTextoActual(textosCorregir[0].texto);
        } 
    };
    // Generar sopa de letras
    
    // Inicializar actividades
    useEffect(() => {
        if (actividad === "dictado" && textoActual === "") {
            setTextoActual(textosCorregir[0].texto)
        } 
    }, [actividad, textoActual])

    const [palabrasSinClasificar, setPalabrasSinClasificar] = useState([
  "mayo", "Carlos", "jueves", "parque", "María", "diciembre", 
  "Barcelona", "lunes", "hospital", "Ana", "febrero", "escuela"
]);

type CategoriaKey = "mayuscula" | "minuscula";

const [categorias, setCategorias] = useState<Record<CategoriaKey, string[]>>({
  mayuscula: [],
  minuscula: []
});

const [palabraSeleccionada, setPalabraSeleccionada] = useState<string | null>(null);
const [feedback, setFeedback] = useState<Record<string, boolean>>({});

// Palabras que deben ir con mayúscula (nombres propios, ciudades, personas)
const palabrasConMayuscula = ["Carlos", "María", "Barcelona", "Ana"];

// Función para asignar palabra a categoría
const asignarPalabra = (categoria: CategoriaKey) => {
  if (palabraSeleccionada) {
    const nuevasCategorias = { ...categorias };
    
    setPalabrasSinClasificar(palabrasSinClasificar.filter(p => p !== palabraSeleccionada));
    
    nuevasCategorias[categoria] = [
      ...nuevasCategorias[categoria],
      palabraSeleccionada
    ];
    
    setCategorias(nuevasCategorias);
    setPalabraSeleccionada(null);
  }
};

// Función para comprobar clasificación
const comprobarClasificacion = () => {
  const nuevoFeedback: Record<string, boolean> = {};
  let errores = 0;
  
  // Verificar categoría de mayúsculas
  categorias.mayuscula.forEach(palabra => {
    const esCorrecta = palabrasConMayuscula.includes(palabra);
    nuevoFeedback[palabra] = esCorrecta;
    if (!esCorrecta) errores++;
  });
  
  // Verificar categoría de minúsculas
  categorias.minuscula.forEach(palabra => {
    const esCorrecta = !palabrasConMayuscula.includes(palabra);
    nuevoFeedback[palabra] = esCorrecta;
    if (!esCorrecta) errores++;
  });
  
  setFeedback(nuevoFeedback);
  setFallos(errores);
  setActividadCompletada(true);
  
  if (errores <= 3) {
    updateActivity("sopa", {
      attempts: 1,
      lastScore: 100,
      completed: true,
      stars: errores === 0 ? 3 : errores <= 2 ? 2 : 1
    });
  }
};

// Función para reiniciar la actividad clasificatoria
const reiniciarClasificacion = () => {
  setPalabrasSinClasificar([
    "mayo", "Carlos", "jueves", "parque", "María", "diciembre", 
    "Barcelona", "lunes", "hospital", "Ana", "febrero", "escuela"
  ]);
  setCategorias({
    mayuscula: [],
    minuscula: []
  });
  setPalabraSeleccionada(null);
  setFeedback({});
  setFallos(0);
  setActividadCompletada(false);
};

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-300 to-purple-200 overflow-hidden relative">
            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Encabezado */}
                <header className="p-4 flex justify-between items-center relative z-10 mb-8">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver</span>
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-800">Unidad 2: Uso de Mayúsculas</h1>

                    <div className="flex items-center gap-2">


                        <div className="text-3xl bg-white p-2 rounded-full shadow-md">{selectedAvatar}</div>

                        <button
                            onClick={toggleMute}
                            className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
                            title={isMuted ? "Activar sonido" : "Silenciar"}
                        >
                            {isMuted ? (
                                <VolumeX className="w-6 h-6 text-purple-600" />
                            ) : (
                                <Volume2 className="w-6 h-6 text-purple-600" />
                            )}
                        </button>
                    </div>
                </header>


                {/* Selector de actividades */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button
                        onClick={() => cambiarActividad("diferencias")}
                        className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "diferencias" ? "bg-purple-600 text-white" : "bg-white/70 text-purple-600 hover:bg-white"
                            } transition-colors`}
                    >
                        Reglas de Mayúsculas
                    </button>
                    <button
                        onClick={() => cambiarActividad("completar")}
                        className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "completar" ? "bg-pink-500 text-white" : "bg-white/70 text-pink-600 hover:bg-white"
                            } transition-colors`}
                    >
                        Completar Oraciones
                    </button>
                    <button
                        onClick={() => cambiarActividad("dictado")}
                        className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "dictado" ? "bg-indigo-500 text-white" : "bg-white/70 text-indigo-600 hover:bg-white"
                            } transition-colors`}
                    >
                        Corregir Textos
                    </button>
                    <button
                        onClick={() => cambiarActividad("sopa")}
                        className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "sopa" ? "bg-green-500 text-white" : "bg-white/70 text-green-600 hover:bg-white"
                            } transition-colors`}
                    >
                        Sopa de Nombres
                    </button>
                </div>

                {/* Contenido principal */}
                <div className="bg-white/80 rounded-3xl p-6 shadow-lg max-w-4xl mx-auto">
                    {/* Reglas de mayúsculas */}
                    {actividad === "diferencias" && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-purple-800 mb-6 flex items-center justify-center">
                                <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
                                {reglasData[reglaActual].titulo}
                            </h2>

                            <p className="text-lg text-purple-700 mb-6">{reglasData[reglaActual].descripcion}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {reglasData[reglaActual].ejemplos.map((ejemplo, index) => (
                                    <div key={index} className="bg-purple-100 p-4 rounded-xl">
                                        <div className="mb-3">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Check className="w-5 h-5 text-green-500" />
                                                <span className="text-lg font-bold text-green-700">Correcto:</span>
                                            </div>
                                            <p className="text-purple-800 font-medium">{ejemplo.correcto}</p>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <X className="w-5 h-5 text-red-500" />
                                                <span className="text-lg font-bold text-red-700">Incorrecto:</span>
                                            </div>
                                            <p className="text-purple-800 line-through">{ejemplo.incorrecto}</p>
                                        </div>

                                        <div className="bg-yellow-100 p-2 rounded-lg">
                                            <p className="text-sm text-purple-700">{ejemplo.explicacion}</p>
                                        </div>

                                        <button
                                            onClick={() => reproducirSonido(ejemplo.correcto)}
                                            className="mt-2 bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 transition-colors cursor-pointer"
                                        >
                                            <Volume2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setReglaActual((prev) => (prev > 0 ? prev - 1 : reglasData.length - 1))}
                                    className="bg-pink-500 text-white px-6 py-3 rounded-full font-bold hover:bg-pink-600 transition-colors cursor-pointer"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setReglaActual((prev) => (prev < reglasData.length - 1 ? prev + 1 : 0))}
                                    className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors cursor-pointer"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Completar oraciones */}
                    {actividad === "completar" && (
                        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
                            <div className="max-w-4xl mx-auto">
                                {!actividadCompletada ? (
                                    <div className="space-y-8">
                                        {/* Header con progreso mejorado */}
                                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {preguntaActual + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-purple-800">Pregunta {preguntaActual + 1}</h3>
                                                        <p className="text-purple-600 text-sm">de 10 preguntas</p>
                                                    </div>
                                                </div>

                                                {/* Barra de progreso visual */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex gap-1.5">
                                                        {[...Array(10)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-3 h-3 rounded-full transition-all duration-300 ${i < preguntaActual
                                                                    ? (respuestas[i] ? "bg-green-400 shadow-lg shadow-green-200" : "bg-red-400 shadow-lg shadow-red-200")
                                                                    : i === preguntaActual
                                                                        ? "bg-purple-400 animate-pulse shadow-lg shadow-purple-200"
                                                                        : "bg-gray-200"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                                                            style={{ width: `${((preguntaActual + 1) / 10) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-6 mb-6">
                                            {/* Indicador de estrella mejorado */}
                                            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                                                <div className="relative">
                                                    <Star
                                                        className={`w-6 h-6 transition-all duration-300 ${fallos < 3
                                                            ? "text-yellow-400 drop-shadow-sm"
                                                            : "text-gray-300"
                                                            }`}
                                                        fill={fallos < 3 ? "currentColor" : "none"}
                                                    />
                                                    {fallos < 3 && (
                                                        <div className="absolute -inset-1 bg-yellow-400 rounded-full opacity-20 animate-ping" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`font-semibold text-sm transition-all duration-300 ${fallos < 3
                                                        ? "text-yellow-600"
                                                        : "text-gray-400 line-through"
                                                        }`}
                                                >
                                                    {fallos < 3 ? "¡Estrella disponible!" : "Estrella perdida"}
                                                </span>
                                            </div>

                                            {/* Contador de fallos mejorado */}
                                            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3].map((fallo) => (
                                                        <div
                                                            key={fallo}
                                                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${fallo <= fallos
                                                                ? "bg-red-400 border-red-400 scale-110"
                                                                : "border-gray-300"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className={`font-semibold text-sm ${fallos === 0 ? "text-green-600" :
                                                    fallos === 1 ? "text-yellow-600" :
                                                        fallos === 2 ? "text-orange-600" : "text-red-600"
                                                    }`}>
                                                    {fallos === 0 ? "¡Perfecto!" :
                                                        fallos === 1 ? "1 fallo" :
                                                            fallos === 2 ? "2 fallos" : "3 fallos"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Título principal con animación */}
                                        <div className="text-center">
                                            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                                Elige la letra correcta
                                            </h2>
                                            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto"></div>
                                        </div>

                                        {/* Pista mejorada */}
                                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/30 shadow-lg">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                                                    💡
                                                </div>
                                                <h3 className="text-lg font-semibold text-purple-800">Pista</h3>
                                            </div>
                                            <p className="text-purple-700 text-lg font-medium leading-relaxed">
                                                {oracionesCompletar[preguntaActual].pista}
                                            </p>
                                        </div>

                                        {/* Oración principal mejorada */}
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur-xl"></div>
                                            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-xl">
                                                <div className="text-center">
                                                    <div className="text-3xl md:text-4xl font-bold text-purple-800 leading-relaxed tracking-wide">
                                                        {oracionesCompletar[preguntaActual].oracion}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>



                                        {/* Opciones mejoradas */}
                                        <div className="flex flex-wrap justify-center gap-6 px-4">
                                            {oracionesCompletar[preguntaActual].opciones.map((opcion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => verificarRespuesta(opcion, oracionesCompletar[preguntaActual].correctas[0])}
                                                    className={`group relative w-24 h-24 md:w-28 md:h-28 text-4xl md:text-5xl font-bold rounded-3xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${mostrarResultado !== null
                                                        ? opcion === oracionesCompletar[preguntaActual].correctas[0]
                                                            ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-2xl shadow-green-300/50 scale-110 animate-bounce"
                                                            : "bg-gray-100 text-gray-400 scale-95"
                                                        : "bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 text-purple-800 shadow-lg hover:shadow-xl border-2 border-purple-200/30 hover:border-purple-300"
                                                        } ${mostrarResultado !== null ? "pointer-events-none" : "cursor-pointer active:scale-95"}`}
                                                >
                                                    {/* Efecto de brillo en hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <span className="relative z-10">{opcion}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Resultado mejorado */}
                                        {mostrarResultado !== null && (
                                            <div className="flex justify-center">
                                                <div className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xl font-bold shadow-lg transform animate-in slide-in-from-bottom-4 duration-500 ${mostrarResultado
                                                    ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-300/50"
                                                    : "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-300/50"
                                                    }`}>
                                                    {mostrarResultado ? (
                                                        <>
                                                            <Check size={28} className="animate-bounce" />
                                                            <span>¡Excelente! 🎉</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X size={28} className="animate-pulse" />
                                                            <span>¡Inténtalo otra vez! 💪</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Pantalla de completado mejorada */
                                    <div className="text-center py-12">
                                        <div className="relative mb-8">
                                            <div className="text-8xl mb-6 animate-bounce">🎉</div>
                                            <div className="absolute inset-0 flex justify-center items-center">
                                                <div className="w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-ping"></div>
                                            </div>
                                        </div>

                                        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                                            ¡Actividad Completada!
                                        </h2>

                                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/30 shadow-xl max-w-md mx-auto">
                                            <div className="text-6xl font-bold text-purple-800 mb-2">
                                                {respuestas.filter((r) => r).length}/10
                                            </div>
                                            <p className="text-xl text-purple-600 font-medium">
                                                respuestas correctas
                                            </p>

                                            {/* Barra de logros */}
                                            <div className="mt-6">
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${(respuestas.filter((r) => r).length / 10) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-sm text-purple-600 mt-2 font-medium">
                                                    {respuestas.filter((r) => r).length >= 8 ? "¡Excelente trabajo! 🌟" :
                                                        respuestas.filter((r) => r).length >= 6 ? "¡Buen trabajo! 👏" :
                                                            "¡Sigue practicando! 💪"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                                            <button
                                                onClick={() => cambiarActividad(actividad)}
                                                className="group bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-pink-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                            >
                                                <HelpCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                                                <span>Jugar de nuevo</span>
                                            </button>
                                            <button
                                                onClick={() => cambiarActividad("diferencias")}
                                                className="group bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                            >
                                                <Award size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                                                <span>Volver a reglas</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Corregir textos */}
                    {/* Corregir textos - VERSIÓN MEJORADA */}
                    {actividad === "dictado" && (
                        <div className="text-center">
                            {!actividadCompletada ? (
                                <>
                                    {/* Header mejorado con progreso visual */}
                                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg mb-6 relative overflow-hidden">
                                        <div className="absolute top-2 left-2 text-3xl">🔍</div>
                                        <div className="absolute top-2 right-2 text-3xl">✨</div>
                                        <div className="absolute bottom-2 left-2 text-3xl">📝</div>
                                        <div className="absolute bottom-2 right-2 text-3xl">🎯</div>

                                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                                            <span className="mr-3">🕵️</span>
                                            Detective de Mayúsculas
                                            <span className="ml-3">🔍</span>
                                        </h2>
                                        <p className="text-lg text-white/90 mb-4">
                                            ¡Encuentra las palabras que necesitan mayúscula inicial!
                                        </p>

                                        {/* Barra de progreso mejorada */}
                                        <div className="bg-white/20 rounded-full h-3 mb-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-yellow-300 to-orange-400 h-full rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${((preguntaActual + 1) / textosCorregir.length) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-white/80 text-sm font-medium">
                                            Texto {preguntaActual + 1} de {textosCorregir.length}
                                        </p>
                                    </div>

                                    {/* Sistema de estrellas y fallos rediseñado */}
                                    <div className="flex items-center justify-center gap-6 mb-6">
                                        {/* Indicador de estrella mejorado */}
                                        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                                            <div className="relative">
                                                <Star
                                                    className={`w-6 h-6 transition-all duration-300 ${fallos < 3
                                                        ? "text-yellow-400 drop-shadow-sm"
                                                        : "text-gray-300"
                                                        }`}
                                                    fill={fallos < 3 ? "currentColor" : "none"}
                                                />
                                                {fallos < 3 && (
                                                    <div className="absolute -inset-1 bg-yellow-400 rounded-full opacity-20 animate-ping" />
                                                )}
                                            </div>
                                            <span
                                                className={`font-semibold text-sm transition-all duration-300 ${fallos < 3
                                                    ? "text-yellow-600"
                                                    : "text-gray-400 line-through"
                                                    }`}
                                            >
                                                {fallos < 3 ? "¡Estrella disponible!" : "Estrella perdida"}
                                            </span>
                                        </div>

                                        {/* Contador de fallos mejorado */}
                                        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map((fallo) => (
                                                    <div
                                                        key={fallo}
                                                        className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${fallo <= fallos
                                                            ? "bg-red-400 border-red-400 scale-110"
                                                            : "border-gray-300"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className={`font-semibold text-sm ${fallos === 0 ? "text-green-600" :
                                                fallos === 1 ? "text-yellow-600" :
                                                    fallos === 2 ? "text-orange-600" : "text-red-600"
                                                }`}>
                                                {fallos === 0 ? "¡Perfecto!" :
                                                    fallos === 1 ? "1 fallo" :
                                                        fallos === 2 ? "2 fallos" : "3 fallos"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Instrucciones visuales mejoradas */}
                                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-indigo-500 p-4 rounded-r-xl mb-6 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <div className="bg-indigo-500 text-white rounded-full p-2 mr-3">
                                                <HelpCircle size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-indigo-800">¿Cómo jugar?</h3>
                                        </div>
                                        <p className="text-indigo-700 text-left">
                                            <span className="font-semibold">Paso 1:</span> Lee el texto cuidadosamente<br />
                                            <span className="font-semibold">Paso 2:</span> Haz clic en las letras que deberían ser mayúsculas<br />
                                            <span className="font-semibold">Paso 3:</span> Las letras correctas se marcarán en verde ✅
                                        </p>
                                    </div>

                                    {/* Contenedor principal del texto mejorado */}
                                    <div className="bg-white border-4 border-indigo-200 rounded-2xl p-8 mb-6 shadow-lg relative">
                                        {/* Decoración */}
                                        <div className="absolute -top-3 left-4 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                            Texto para corregir
                                        </div>

                                        <div className="text-2xl text-gray-800 leading-relaxed font-medium tracking-wide">
                                            {textosCorregir[preguntaActual].texto.split("").map((char, index) => {
                                                const esError = textosCorregir[preguntaActual].errores.includes(index)
                                                const encontrado = erroresEncontrados.includes(index)
                                                const esLetra = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(char)

                                                return (
                                                    <span
                                                        key={index}
                                                        className={`
                                                            relative transition-all duration-300 cursor-pointer
                                                            ${esError && encontrado
                                                                ? "bg-gradient-to-r from-green-300 to-green-400 text-green-900 font-bold rounded-md px-1 transform scale-110 shadow-md animate-pulse"
                                                                : esError && esLetra
                                                                    ? "hover:bg-yellow-200 hover:scale-105 rounded-md px-1 hover:shadow-sm bg-red-50 border-b-2 border-red-300 border-dotted"
                                                                    : esLetra
                                                                        ? "hover:bg-gray-100 rounded-md px-1"
                                                                        : ""
                                                            }
                                                        `}
                                                        onClick={() => handleTextoClick(index)}
                                                        onMouseEnter={() => {
                                                            if (esError && !encontrado) {
                                                                // Efecto hover para errores no encontrados
                                                            }
                                                        }}
                                                    >
                                                        {char}
                                                        {/* Indicador visual para errores encontrados */}
                                                        {esError && encontrado && (
                                                            <span className="absolute -top-1 -right-1 text-green-600 text-xs animate-bounce">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Panel de progreso y estadísticas mejorado */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {/* Errores encontrados */}
                                        <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl shadow-md border-l-4 border-green-500">
                                            <div className="flex items-center justify-center mb-2">
                                                <div className="bg-green-500 text-white rounded-full p-2 mr-2">
                                                    <Check size={20} />
                                                </div>
                                                <h4 className="font-bold text-green-800">Encontrados</h4>
                                            </div>
                                            <p className="text-2xl font-bold text-green-700 text-center">
                                                {erroresEncontrados.length}
                                            </p>
                                        </div>

                                        {/* Errores restantes */}
                                        <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl shadow-md border-l-4 border-orange-500">
                                            <div className="flex items-center justify-center mb-2">
                                                <div className="bg-orange-500 text-white rounded-full p-2 mr-2">
                                                    <HelpCircle size={20} />
                                                </div>
                                                <h4 className="font-bold text-orange-800">Restantes</h4>
                                            </div>
                                            <p className="text-2xl font-bold text-orange-700 text-center">
                                                {textosCorregir[preguntaActual].errores.length - erroresEncontrados.length}
                                            </p>
                                        </div>


                                    </div>

                                    {/* Pista contextual mejorada */}
                                    <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-2 border-amber-300 rounded-xl p-4 mb-4 shadow-sm">
                                        <div className="flex items-center justify-center mb-2">
                                            <Lightbulb className="text-amber-600 mr-2" size={24} />
                                            <h4 className="font-bold text-amber-800">Pista</h4>
                                        </div>
                                        <p className="text-amber-700 font-medium">
                                            {textosCorregir[preguntaActual].explicacion}
                                        </p>
                                    </div>

                                    {/* Botones de acción mejorados */}
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <button
                                            onClick={() => reproducirSonido(textosCorregir[preguntaActual].correccion)}
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 cursor-pointer"
                                        >
                                            <Volume2 size={20} />
                                            <span>Escuchar corrección</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                // Mostrar brevemente la respuesta correcta
                                                const textoCorregido = textosCorregir[preguntaActual].correccion;
                                                alert(`Texto correcto:\n\n"${textoCorregido}"`);
                                            }}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-full font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 cursor-pointer"
                                        >
                                            <HelpCircle size={20} />
                                            <span>Ver respuesta</span>
                                        </button>
                                    </div>

                                    {/* Indicador de progreso en errores encontrados */}
                                    {erroresEncontrados.length > 0 && (
                                        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                            <div className="flex items-center justify-center mb-2">
                                                <div className="bg-green-500 text-white rounded-full p-1 mr-2 animate-pulse">
                                                    <Check size={16} />
                                                </div>
                                                <span className="text-green-800 font-bold">¡Muy bien!</span>
                                            </div>
                                            <p className="text-green-700 text-sm">
                                                Has encontrado {erroresEncontrados.length} de {textosCorregir[preguntaActual].errores.length} errores
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 rounded-2xl p-8 shadow-xl">
                                    <div className="animate-bounce text-8xl mb-6">🎉</div>
                                    <h2 className="text-4xl font-bold text-purple-800 mb-4 flex items-center justify-center">
                                        <Award className="mr-3 text-yellow-500" size={40} />
                                        ¡Misión Cumplida!
                                        <Award className="ml-3 text-yellow-500" size={40} />
                                    </h2>
                                    <p className="text-2xl text-purple-600 mb-4">
                                        Has encontrado todos los errores de mayúsculas
                                    </p>
                                    <p className="text-lg text-purple-500 mb-8">
                                        ¡Eres un verdadero detective de la ortografía! 🕵️‍♂️
                                    </p>

                                    {/* Estadísticas finales */}
                                    <div className="bg-white/80 rounded-xl p-6 mb-6 shadow-md">
                                        <h3 className="text-xl font-bold text-purple-800 mb-4">Resumen de tu desempeño:</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-green-100 p-3 rounded-lg">
                                                <div className="text-green-600 text-2xl font-bold">{textosCorregir.length}</div>
                                                <div className="text-green-800 text-sm">Textos corregidos</div>
                                            </div>
                                            <div className="bg-blue-100 p-3 rounded-lg">
                                                <div className="text-blue-600 text-2xl font-bold">
                                                    {textosCorregir.reduce((acc, texto) => acc + texto.errores.length, 0)}
                                                </div>
                                                <div className="text-blue-800 text-sm">Errores encontrados</div>
                                            </div>
                                            <div className="bg-purple-100 p-3 rounded-lg">
                                                <div className="text-purple-600 text-2xl font-bold">{puntuacion}</div>
                                                <div className="text-purple-800 text-sm">Puntos obtenidos</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-4">
                                        <button
                                            onClick={() => cambiarActividad(actividad)}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 cursor-pointer"
                                        >
                                            <HelpCircle size={24} />
                                            <span>¡Jugar de nuevo!</span>
                                        </button>
                                        <button
                                            onClick={() => cambiarActividad("diferencias")}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 cursor-pointer"
                                        >
                                            <Award size={24} />
                                            <span>Volver a reglas</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sopa de nombres propios */}
                    {actividad === "sopa" && (
            <div className="text-center">
              {!actividadCompletada ? (
                <>
                  <div className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400 rounded-xl p-6 shadow-lg mb-6 relative overflow-hidden">
                    {/* Imágenes decorativas en las esquinas */}
                    <div className="absolute top-1 left-1 text-3xl">📝</div>
                    <div className="absolute top-1 right-1 text-3xl">🔤</div>
                    <div className="absolute bottom-1 left-1 text-3xl">📚</div>
                    <div className="absolute bottom-1 right-1 text-3xl">✏️</div>

                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                      <span className="mr-2">🎯</span>
                      Clasificación de Mayúsculas
                      <span className="ml-2">🔍</span>
                    </h2>
                    <p className="text-lg text-white mb-2">
                      ¡Clasifica las palabras según si deben llevar mayúscula o no!
                    </p>
                    <div className="flex justify-center">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-2xl ${i < Math.ceil((Object.values(categorias).flat().length) / 12 * 5) ? "text-yellow-300" : "text-gray-300"}`}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Palabras sin clasificar */}
                  <div className="bg-blue-100 p-5 rounded-xl mb-6 shadow-md border-4 border-blue-300">
                    <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center justify-center">
                      <span className="mr-2">📦</span> Palabras para clasificar <span className="ml-2">📦</span>
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {palabrasSinClasificar.map((palabra, index) => (
                        <button
                          key={index}
                          onClick={() => setPalabraSeleccionada(palabra)}
                          className={`px-4 py-2 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 cursor-pointer
                            ${palabraSeleccionada === palabra 
                              ? "bg-purple-500 text-white shadow-lg scale-105" 
                              : "bg-white text-purple-800 shadow-md hover:shadow-lg"
                            }`}
                        >
                          {palabra}
                        </button>
                      ))}
                    </div>
                    {palabrasSinClasificar.length === 0 && (
                      <p className="text-purple-600 font-bold text-lg">¡Todas las palabras han sido clasificadas!</p>
                    )}
                  </div>

                  {/* Categorías */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Categoría CON MAYÚSCULA */}
                    <div className="bg-green-100 p-5 rounded-xl shadow-md border-4 border-green-300">
                      <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center justify-center">
                        <span className="mr-2">🔠</span> CON MAYÚSCULA <span className="ml-2">🔠</span>
                      </h3>
                      <div 
                        className="min-h-[150px] bg-white rounded-lg p-3 border-2 border-dashed border-green-400 cursor-pointer hover:bg-green-50 transition-colors"
                        onClick={() => palabraSeleccionada && asignarPalabra('mayuscula')}
                      >
                        {categorias.mayuscula.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-green-600 italic text-lg">Pulsa aquí las palabras</p>
                            <p className="text-green-600 italic text-lg">que deben llevar mayúscula</p>
                            <div className="text-2xl mt-2">⬆️</div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {categorias.mayuscula.map((palabra, index) => (
                              <span 
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300
                                  ${feedback[palabra] === true ? "bg-green-400 text-white animate-pulse" : 
                                    feedback[palabra] === false ? "bg-red-400 text-white animate-shake" : 
                                    "bg-green-200 text-green-800"}`}
                              >
                                {palabra}
                                {feedback[palabra] === true && " ✓"}
                                {feedback[palabra] === false && " ✗"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-xs text-green-700 italic text-center">
                        💡 Nombres propios, inicio de oración, etc.
                      </div>
                    </div>

                    {/* Categoría SIN MAYÚSCULA */}
                    <div className="bg-blue-100 p-5 rounded-xl shadow-md border-4 border-blue-300">
                      <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center justify-center">
                        <span className="mr-2">🔡</span> SIN MAYÚSCULA <span className="ml-2">🔡</span>
                      </h3>
                      <div 
                        className="min-h-[150px] bg-white rounded-lg p-3 border-2 border-dashed border-blue-400 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => palabraSeleccionada && asignarPalabra('minuscula')}
                      >
                        {categorias.minuscula.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-blue-600 italic text-lg">Pulsa aquí las palabras</p>
                            <p className="text-blue-600 italic text-lg">que van en minúscula</p>
                            <div className="text-2xl mt-2">⬇️</div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {categorias.minuscula.map((palabra, index) => (
                              <span 
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300
                                  ${feedback[palabra] === true ? "bg-green-400 text-white animate-pulse" : 
                                    feedback[palabra] === false ? "bg-red-400 text-white animate-shake" : 
                                    "bg-blue-200 text-blue-800"}`}
                              >
                                {palabra}
                                {feedback[palabra] === true && " ✓"}
                                {feedback[palabra] === false && " ✗"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-xs text-blue-700 italic text-center">
                        💡 Sustantivos comunes, días, meses, etc.
                      </div>
                    </div>
                  </div>

                  {/* Instrucciones y progreso */}
                  <div className="bg-purple-100 p-5 rounded-xl shadow-md border-4 border-purple-300 mb-6">
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-2xl mr-2">📊</span>
                      <span className="text-lg font-bold text-purple-800">
                        Progreso: {Object.values(categorias).flat().length} de 12 palabras clasificadas
                      </span>
                    </div>
                    {palabraSeleccionada && (
                      <div className="bg-purple-200 p-3 rounded-lg mb-3">
                        <p className="text-purple-800 font-bold">
                          Palabra seleccionada: <span className="text-purple-600">"{palabraSeleccionada}"</span>
                        </p>
                        <p className="text-sm text-purple-600">
                          Haz clic en la categoría donde quieres colocarla
                        </p>
                      </div>
                    )}
                    <div className="text-purple-700 text-sm italic text-center">
                      💡 Pista: Los nombres propios siempre van con mayúscula inicial
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-wrap justify-center gap-4">
                    {Object.values(categorias).flat().length === 12 && (
                      <button
                        onClick={comprobarClasificacion}
                        className="bg-green-500 text-white px-8 py-4 rounded-full font-bold hover:bg-green-600 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
                      >
                        <span>✅</span>
                        <span>Comprobar clasificación</span>
                      </button>
                    )}
                    <button
                      onClick={() => reiniciarClasificacion()}
                      className="bg-teal-400 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-500 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span>🔄</span>
                      <span>Reiniciar juego</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 rounded-xl p-8 shadow-lg">
                  <div className="animate-bounce text-7xl mb-6">
                    {fallos === 0 ? "🎉" : fallos <= 2 ? "😊" : "😅"}
                  </div>
                  <h2 className="text-4xl font-bold text-purple-800 mb-4">
                    {fallos === 0 ? "¡PERFECTO!" : fallos <= 2 ? "¡BUEN TRABAJO!" : "¡SIGUE PRACTICANDO!"}
                  </h2>
                  <p className="text-2xl text-purple-600 mb-8">
                    {fallos === 0 
                      ? "¡Has clasificado todas las mayúsculas correctamente! ¡Eres un experto en ortografía!" 
                      : fallos <= 2 
                        ? `Has tenido ${fallos} error${fallos > 1 ? 'es' : ''}. ¡Muy bien, casi perfecto!`
                        : `Has tenido ${fallos} errores. ¡No te preocupes, practica más y lo lograrás!`
                    }
                  </p>

                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-4xl animate-pulse ${
                        fallos === 0 && i < 5 ? "text-yellow-400" :
                        fallos <= 2 && i < 3 ? "text-yellow-400" :
                        fallos > 2 && i < 1 ? "text-yellow-400" :
                        "text-gray-300"
                      }`}>
                        ⭐
                      </span>
                    ))}
                  </div>

                  {/* Resumen de resultados */}
                  <div className="bg-white p-4 rounded-lg shadow-md mb-6 max-w-md mx-auto">
                    <h4 className="font-bold text-purple-800 mb-2">📊 Resumen:</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">✅ Correctas: {12 - fallos}</span>
                      <span className="text-red-600">❌ Incorrectas: {fallos}</span>
                      <span className="text-purple-600">📈 Precisión: {Math.round((12 - fallos) / 12 * 100)}%</span>
                    </div>
                  </div>

                  {/* Mostrar resultados por categoría */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-4xl mx-auto">
                    <div className="bg-green-200 p-4 rounded-lg shadow-md">
                      <h4 className="font-bold text-green-800 mb-2">🔠 CON MAYÚSCULA</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {categorias.mayuscula.map((palabra, index) => (
                          <span key={index} className={`text-sm px-2 py-1 rounded ${
                            feedback[palabra] === true ? "bg-green-400 text-white" : 
                            feedback[palabra] === false ? "bg-red-300 text-red-800" : 
                            "bg-white text-green-800"
                          }`}>
                            {palabra}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-blue-200 p-4 rounded-lg shadow-md">
                      <h4 className="font-bold text-blue-800 mb-2">🔡 SIN MAYÚSCULA</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {categorias.minuscula.map((palabra, index) => (
                          <span key={index} className={`text-sm px-2 py-1 rounded ${
                            feedback[palabra] === true ? "bg-green-400 text-white" : 
                            feedback[palabra] === false ? "bg-red-300 text-red-800" : 
                            "bg-white text-blue-800"
                          }`}>
                            {palabra}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-teal-500 text-white px-8 py-4 rounded-full font-bold hover:bg-teal-600 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
                    >
                      <span>🎮</span>
                      <span>¡Jugar de nuevo!</span>
                    </button>
                    <button
                      onClick={() => cambiarActividad("diferencias")}
                      className="bg-purple-600 text-white px-8 py-4 rounded-full font-bold hover:bg-purple-700 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
                    >
                      <span>🏠</span>
                      <span>Volver a inicio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
                </div>
            </div>
        </div>
    )
}
