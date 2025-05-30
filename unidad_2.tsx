"use client"

import { useState, useRef, useEffect } from "react"
import { Star, ArrowLeft, Volume2, Check, X, HelpCircle, Award, Lightbulb, VolumeX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAudio } from "./app/contexts/AudioContext"
import useProgress from "./app/hooks/useProgress"

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

    // Función para verificar respuesta en completar oraciones
    const verificarRespuesta = (respuesta: string, correcta: string) => {
        const esCorrecta = respuesta === correcta;
        setMostrarResultado(esCorrecta);

        if (esCorrecta) {
            setPuntuacion((prev) => prev + 10);
        }

        setRespuestas([...respuestas, esCorrecta]);

        setTimeout(() => {
            setMostrarResultado(null);
            if (preguntaActual < 9) {
                setPreguntaActual((prev) => prev + 1);
            } else {
                setActividadCompletada(true);

                const respuestasCorrectas = [...respuestas, esCorrecta].filter(Boolean).length;
                const porcentajeExito = (respuestasCorrectas / 10) * 100;

                updateActivity("completar", {
                    attempts: 1,
                    lastScore: porcentajeExito,
                    completed: true,
                    stars: porcentajeExito >= 90 ? 1 : porcentajeExito >= 60 ? 1 : 0,
                });
            }
        }, 1500);
    };

     const handleTextoClick = (posicion: number) => {
        const textoData = textosCorregir[preguntaActual];
        
        // Verificar si esta posición es un error
        if (textoData.errores.includes(posicion)) {
            // Verificar si ya fue encontrado
            if (!erroresEncontrados.includes(posicion)) {
                const nuevosErrores = [...erroresEncontrados, posicion];
                setErroresEncontrados(nuevosErrores);
                setPuntuacion((prev) => prev + 20);
                
                // Verificar si se encontraron todos los errores de esta pregunta
                if (nuevosErrores.length === textoData.errores.length) {
                    setTimeout(() => {
                        if (preguntaActual < textosCorregir.length - 1) {
                            // Pasar a la siguiente pregunta
                            setPreguntaActual((prev) => prev + 1);
                            setErroresEncontrados([]);
                        } else {
                            // Actividad completada
                            setActividadCompletada(true);
                            
                            // Calcular porcentaje de éxito
                            const totalErrores = textosCorregir.reduce((acc, texto) => acc + texto.errores.length, 0);
                            const erroresEncontradosTotal = nuevosErrores.length + 
                                textosCorregir.slice(0, preguntaActual).reduce((acc, texto) => acc + texto.errores.length, 0);
                            const porcentajeExito = (erroresEncontradosTotal / totalErrores) * 100;

                            updateActivity("dictado", {
                                attempts: 1,
                                lastScore: porcentajeExito,
                                completed: true,
                                stars: porcentajeExito >= 80 ? 1 : 0,
                            });
                        }
                    }, 1000);
                }
            }
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
        } else if (nuevaActividad === "sopa") {
            generarSopaDeLetras();
        }
    };
    // Generar sopa de letras
    const generarSopaDeLetras = () => {
        const tamaño = 8
        const sopa: string[][] = Array(tamaño)
            .fill(0)
            .map(() => Array(tamaño).fill(""))

        const direcciones = [
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 1, dy: 1 },
            { dx: 1, dy: -1 },
        ]

        const palabrasColocadas: { palabra: string; celdas: { row: number; col: number }[] }[] = []
        const palabrasAColocar = [...nombresPropios]

        for (const palabra of palabrasAColocar) {
            let colocada = false
            let intentos = 0
            const maxIntentos = 100

            while (!colocada && intentos < maxIntentos) {
                intentos++

                const dir = direcciones[Math.floor(Math.random() * direcciones.length)]
                const maxRow = dir.dy >= 0 ? tamaño - palabra.length * Math.abs(dir.dy) : tamaño - 1
                const minRow = dir.dy < 0 ? palabra.length * Math.abs(dir.dy) - 1 : 0
                const maxCol = dir.dx >= 0 ? tamaño - palabra.length * Math.abs(dir.dx) : tamaño - 1
                const minCol = dir.dx < 0 ? palabra.length * Math.abs(dir.dx) - 1 : 0

                const startRow = minRow + Math.floor(Math.random() * (maxRow - minRow + 1))
                const startCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 1))

                let conflicto = false
                const celdas: { row: number; col: number }[] = []

                for (let i = 0; i < palabra.length; i++) {
                    const row = startRow + i * dir.dy
                    const col = startCol + i * dir.dx

                    if (row < 0 || row >= tamaño || col < 0 || col >= tamaño) {
                        conflicto = true
                        break
                    }

                    celdas.push({ row, col })

                    if (sopa[row][col] !== "" && sopa[row][col] !== palabra[i]) {
                        conflicto = true
                        break
                    }
                }

                if (!conflicto) {
                    for (let i = 0; i < palabra.length; i++) {
                        const row = startRow + i * dir.dy
                        const col = startCol + i * dir.dx
                        sopa[row][col] = palabra[i]
                    }
                    palabrasColocadas.push({ palabra, celdas })
                    colocada = true
                }
            }
        }

        // Llenar espacios vacíos
        for (let i = 0; i < tamaño; i++) {
            for (let j = 0; j < tamaño; j++) {
                if (sopa[i][j] === "") {
                    sopa[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
                }
            }
        }

        setSopaLetras(sopa)
        setPalabrasSeleccionadas(palabrasColocadas)
    }

    // Inicializar actividades
    useEffect(() => {
        if (actividad === "dictado" && textoActual === "") {
            setTextoActual(textosCorregir[0].texto)
        } else if (actividad === "sopa" && sopaLetras.length === 0) {
            generarSopaDeLetras()
        }
    }, [actividad, textoActual])

    // Manejar selección en sopa de letras
    const handleCeldaMouseDown = (row: number, col: number) => {
        setSeleccionInicio({ row, col })
        setSeleccionActual({ row, col })
    }

    const handleCeldaMouseEnter = (row: number, col: number) => {
        if (seleccionInicio) {
            setSeleccionActual({ row, col })
        }
    }

    const handleCeldaMouseUp = () => {
        if (seleccionInicio && seleccionActual) {
            const dx = seleccionActual.col - seleccionInicio.col
            const dy = seleccionActual.row - seleccionInicio.row

            if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
                const longitud = Math.max(Math.abs(dx), Math.abs(dy)) + 1
                const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1
                const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1

                let palabra = ""
                for (let i = 0; i < longitud; i++) {
                    const row = seleccionInicio.row + i * dirY
                    const col = seleccionInicio.col + i * dirX
                    palabra += sopaLetras[row][col]
                }

                const palabraEncontrada = palabrasSeleccionadas.find(
                    (p) => p.palabra === palabra || p.palabra === palabra.split("").reverse().join(""),
                )

                if (palabraEncontrada && !palabrasEncontradas.includes(palabraEncontrada.palabra)) {
                    setPalabrasEncontradas([...palabrasEncontradas, palabraEncontrada.palabra])
                    setPuntuacion((prev) => prev + 20)

                    if (palabrasEncontradas.length + 1 === nombresPropios.length) {
                        setActividadCompletada(true)

                        if (progress && progress.activities) {
                            updateActivity("sopa", {
                                attempts: 1,
                                lastScore: 100,
                                completed: true,
                                stars: 1,
                            });
                        }
                    }
                }
            }
        }

        setSeleccionInicio(null)
        setSeleccionActual(null)
    }

    // Verificar si una celda está seleccionada
    const esCeldaSeleccionada = (row: number, col: number) => {
        if (!seleccionInicio || !seleccionActual) return false

        const dx = seleccionActual.col - seleccionInicio.col
        const dy = seleccionActual.row - seleccionInicio.row

        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
            const longitud = Math.max(Math.abs(dx), Math.abs(dy)) + 1
            const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1
            const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1

            for (let i = 0; i < longitud; i++) {
                const r = seleccionInicio.row + i * dirY
                const c = seleccionInicio.col + i * dirX
                if (r === row && c === col) return true
            }
        }

        return false
    }

    const esCeldaPalabraEncontrada = (row: number, col: number) => {
        return palabrasSeleccionadas.some(
            (p) => palabrasEncontradas.includes(p.palabra) && p.celdas.some((c) => c.row === row && c.col === col),
        )
    }

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
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                i < preguntaActual 
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
                                className={`group relative w-24 h-24 md:w-28 md:h-28 text-4xl md:text-5xl font-bold rounded-3xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
                                    mostrarResultado !== null
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
                            <div className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xl font-bold shadow-lg transform animate-in slide-in-from-bottom-4 duration-500 ${
                                mostrarResultado 
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

                                    {/* Instrucciones visuales mejoradas */}
                                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-indigo-500 p-4 rounded-r-xl mb-6 shadow-sm">
                                        <div className="flex items-center mb-2">
                                            <div className="bg-indigo-500 text-white rounded-full p-2 mr-3">
                                                <HelpCircle size={20} />
                                            </div>
                                            <h3 className="text-lg font-bold text-indigo-800">¿Cómo jugar?</h3>
                                        </div>
                                        <p className="text-indigo-700 text-left">
                                            <span className="font-semibold">Paso 1:</span> Lee el texto cuidadosamente<br/>
                                            <span className="font-semibold">Paso 2:</span> Haz clic en las letras que deberían ser mayúsculas<br/>
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
                                    <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-xl p-6 shadow-lg mb-6 relative overflow-hidden">
                                        <div className="absolute top-1 left-1 text-3xl">👑</div>
                                        <div className="absolute top-1 right-1 text-3xl">🌍</div>
                                        <div className="absolute bottom-1 left-1 text-3xl">👤</div>
                                        <div className="absolute bottom-1 right-1 text-3xl">🏙️</div>

                                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                                            <span className="mr-2">🔍</span>
                                            Sopa de Nombres Propios
                                            <span className="ml-2">✨</span>
                                        </h2>
                                        <p className="text-lg text-white mb-2">
                                            ¡Encuentra los nombres propios que siempre van con mayúscula!
                                        </p>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div
                                            className="bg-green-100 p-5 rounded-xl w-full md:w-auto shadow-md border-4 border-green-300 relative"
                                            ref={sopaRef}
                                            onMouseLeave={handleCeldaMouseUp}
                                        >
                                            <div className="grid grid-cols-8 gap-1 mx-auto w-max">
                                                {sopaLetras.flatMap((fila, rowIndex) =>
                                                    fila.map((letra, colIndex) => (
                                                        <div
                                                            key={`${rowIndex}-${colIndex}`}
                                                            className={`w-10 h-10 flex items-center justify-center font-bold text-lg rounded-md transition-all duration-200 select-none cursor-pointer transform hover:scale-110
                        ${esCeldaPalabraEncontrada(rowIndex, colIndex)
                                                                    ? "bg-green-400 text-white animate-pulse"
                                                                    : esCeldaSeleccionada(rowIndex, colIndex)
                                                                        ? "bg-yellow-300 text-purple-800"
                                                                        : "bg-white text-purple-800 shadow-sm"
                                                                }`}
                                                            onMouseDown={() => handleCeldaMouseDown(rowIndex, colIndex)}
                                                            onMouseEnter={() => handleCeldaMouseEnter(rowIndex, colIndex)}
                                                            onMouseUp={handleCeldaMouseUp}
                                                        >
                                                            {letra}
                                                        </div>
                                                    )),
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-blue-100 p-5 rounded-xl flex-1 shadow-md border-4 border-blue-300">
                                            <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center justify-center">
                                                <span className="mr-2">🎯</span> ¡Encuentra estos nombres! <span className="ml-2">🎯</span>
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {nombresPropios.map((nombre, index) => {
                                                    const iconos = ["👤", "👤", "🏙️", "🌍", "🌙", "🌍"]
                                                    return (
                                                        <div
                                                            key={nombre}
                                                            className={`px-4 py-2 rounded-full text-md font-bold transition-all duration-300 flex items-center justify-between ${palabrasEncontradas.includes(nombre)
                                                                    ? "bg-green-400 text-white line-through transform scale-95"
                                                                    : "bg-white text-purple-800 shadow-sm hover:shadow-md hover:scale-105"
                                                                }`}
                                                        >
                                                            <span>
                                                                {palabrasEncontradas.includes(nombre) ? "✓ " : ""} {nombre}
                                                            </span>
                                                            <span className="text-xl ml-2">{iconos[index]}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <div className="mt-6 bg-purple-200 p-3 rounded-lg text-purple-800 font-bold">
                                                <p className="flex items-center justify-center">
                                                    <span className="text-xl mr-2">📊</span>
                                                    ¡Has encontrado {palabrasEncontradas.length} de {nombresPropios.length} nombres!
                                                </p>
                                            </div>

                                            <div className="mt-4 text-purple-700 text-sm italic">
                                                Recuerda: Los nombres propios siempre empiezan con mayúscula.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            onClick={() => cambiarActividad(actividad)}
                                            className="bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                                        >
                                            <span>🔄</span>
                                            <span>Reiniciar juego</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 rounded-xl p-8 shadow-lg">
                                    <div className="animate-bounce text-7xl mb-6">🎉</div>
                                    <h2 className="text-4xl font-bold text-purple-800 mb-4">¡Excelente trabajo!</h2>
                                    <p className="text-2xl text-purple-600 mb-8">
                                        Has encontrado todos los nombres propios. ¡Ahora sabes cuándo usar mayúsculas!
                                    </p>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => cambiarActividad(actividad)}
                                            className="bg-green-500 text-white px-8 py-4 rounded-full font-bold hover:bg-green-600 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
                                        >
                                            <span>🎮</span>
                                            <span>¡Jugar de nuevo!</span>
                                        </button>
                                        <button
                                            onClick={() => cambiarActividad("diferencias")}
                                            className="bg-purple-600 text-white px-8 py-4 rounded-full font-bold hover:bg-purple-700 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
                                        >
                                            <span>🏠</span>
                                            <span>Volver a reglas</span>
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
