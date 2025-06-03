"use client"

import { useState, useRef, useEffect } from "react"
import { Star, ArrowLeft, Volume2, Check, X, HelpCircle, Award, Lightbulb, VolumeX, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAudio } from "./app/contexts/AudioContext"
import useProgress from "./app/hooks/useProgress"

// Datos para las reglas de acentuación
const reglasData = [
    {
        titulo: "Palabras Agudas",
        descripcion: "Son palabras que tienen el acento en la ÚLTIMA sílaba. Suenan más fuerte al final.",
        color: "bg-red-400",
        ejemplos: [
            {
                palabra: "camión",
                silabas: ["ca", "mión"],
                acentuada: 1,
                explicacion: "La sílaba 'mión' suena más fuerte",
                emoji: "🚛",
            },
            {
                palabra: "café",
                silabas: ["ca", "fé"],
                acentuada: 1,
                explicacion: "La sílaba 'fé' suena más fuerte",
                emoji: "☕",
            },
            {
                palabra: "mamá",
                silabas: ["ma", "má"],
                acentuada: 1,
                explicacion: "La sílaba 'má' suena más fuerte",
                emoji: "👩",
            },
            {
                palabra: "papá",
                silabas: ["pa", "pá"],
                acentuada: 1,
                explicacion: "La sílaba 'pá' suena más fuerte",
                emoji: "👨",
            },
        ],
    },
    {
        titulo: "Palabras Graves",
        descripcion: "Son palabras que tienen el acento en la PENÚLTIMA sílaba. Suenan más fuerte en el medio.",
        color: "bg-blue-400",
        ejemplos: [
            {
                palabra: "árbol",
                silabas: ["ár", "bol"],
                acentuada: 0,
                explicacion: "La sílaba 'ár' suena más fuerte",
                emoji: "🌳",
            },
            {
                palabra: "lápiz",
                silabas: ["lá", "piz"],
                acentuada: 0,
                explicacion: "La sílaba 'lá' suena más fuerte",
                emoji: "✏️",
            },
            {
                palabra: "fácil",
                silabas: ["fá", "cil"],
                acentuada: 0,
                explicacion: "La sílaba 'fá' suena más fuerte",
                emoji: "😊",
            },
            {
                palabra: "azúcar",
                silabas: ["a", "zú", "car"],
                acentuada: 1,
                explicacion: "La sílaba 'zú' suena más fuerte",
                emoji: "🍯",
            },
        ],
    },
    {
        titulo: "Palabras Esdrújulas",
        descripcion: "Son palabras que tienen el acento en la ANTEPENÚLTIMA sílaba. Suenan más fuerte al principio.",
        color: "bg-green-400",
        ejemplos: [
            {
                palabra: "médico",
                silabas: ["mé", "di", "co"],
                acentuada: 0,
                explicacion: "La sílaba 'mé' suena más fuerte",
                emoji: "👨‍⚕️",
            },
            {
                palabra: "música",
                silabas: ["mú", "si", "ca"],
                acentuada: 0,
                explicacion: "La sílaba 'mú' suena más fuerte",
                emoji: "🎵",
            },
            {
                palabra: "pájaro",
                silabas: ["pá", "ja", "ro"],
                acentuada: 0,
                explicacion: "La sílaba 'pá' suena más fuerte",
                emoji: "🐦",
            },
            {
                palabra: "número",
                silabas: ["nú", "me", "ro"],
                acentuada: 0,
                explicacion: "La sílaba 'nú' suena más fuerte",
                emoji: "🔢",
            },
        ],
    },
]

// Palabras para arrastrar tildes
const palabrasArrastrar = [
    { palabra: "ratón", silabas: ["ra", "ton"], correcta: 1, tipo: "aguda", emoji: "🐭" },
    { palabra: "árbol", silabas: ["ar", "bol"], correcta: 0, tipo: "grave", emoji: "🌳" },
    { palabra: "música", silabas: ["mu", "si", "ca"], correcta: 0, tipo: "esdrújula", emoji: "🎵" },
    { palabra: "sofá", silabas: ["so", "fa"], correcta: 1, tipo: "aguda", emoji: "🛋️" },
    { palabra: "cárcel", silabas: ["car", "cel"], correcta: 0, tipo: "grave", emoji: "🏢" },
    { palabra: "teléfono", silabas: ["te", "le", "fo", "no"], correcta: 1, tipo: "esdrújula", emoji: "📞" },
    { palabra: "limón", silabas: ["li", "mon"], correcta: 1, tipo: "aguda", emoji: "🍋" },
    { palabra: "fútbol", silabas: ["fut", "bol"], correcta: 0, tipo: "grave", emoji: "⚽" },
    { palabra: "sábado", silabas: ["sa", "ba", "do"], correcta: 0, tipo: "esdrújula", emoji: "📅" },
    { palabra: "corazón", silabas: ["co", "ra", "zon"], correcta: 2, tipo: "aguda", emoji: "❤️" },
]

// Adivinanzas con palabras acentuadas
const adivinanzas = [
    {
        pregunta: "Soy amarillo y me pones en el café. ¿Qué soy?",
        respuesta: "azúcar",
        pistas: ["Es dulce", "Se usa en postres", "Rima con 'lugar'"],
        emoji: "🍯",
        silabas: ["a", "zú", "car"],
        acentuada: 1,
    },
    {
        pregunta: "Tengo hojas verdes y doy sombra en el parque. ¿Qué soy?",
        respuesta: "árbol",
        pistas: ["Crece en la tierra", "Los pájaros hacen nidos en mí", "Soy muy alto"],
        emoji: "🌳",
        silabas: ["ár", "bol"],
        acentuada: 0,
    },
    {
        pregunta: "Vuelo por el cielo y canto muy bonito. ¿Qué soy?",
        respuesta: "pájaro",
        pistas: ["Tengo alas", "Pongo huevos", "Construyo nidos"],
        emoji: "🐦",
        silabas: ["pá", "ja", "ro"],
        acentuada: 0,
    },
    {
        pregunta: "Me usas para escribir y tengo punta. ¿Qué soy?",
        respuesta: "lápiz",
        pistas: ["Soy de madera", "Tengo grafito", "Me puedes borrar"],
        emoji: "✏️",
        silabas: ["lá", "piz"],
        acentuada: 0,
    },
    {
        pregunta: "Soy una bebida caliente y huelo muy rico. ¿Qué soy?",
        respuesta: "café",
        pistas: ["Soy marrón", "Me toman los adultos", "Vengo de granos"],
        emoji: "☕",
        silabas: ["ca", "fé"],
        acentuada: 1,
    },
    {
        pregunta: "Curo a las personas cuando están enfermas. ¿Qué soy?",
        respuesta: "médico",
        pistas: ["Trabajo en hospitales", "Uso bata blanca", "Ayudo a la gente"],
        emoji: "👨‍⚕️",
        silabas: ["mé", "di", "co"],
        acentuada: 0,
    },
]

// Palabras para sopa de letras
const palabrasAcentuadas = ["MÚSICA", "ÁRBOL", "CAFÉ", "MÉDICO", "LÁPIZ", "RATÓN"]

// Tipos de actividades
type Actividad = "diferencias" | "completar" | "dictado" | "sopa"

export default function Unidad3() {
    const router = useRouter()
    const [actividad, setActividad] = useState<Actividad>("diferencias")
    const [reglaActual, setReglaActual] = useState(0)
    const [preguntaActual, setPreguntaActual] = useState(0)
    const [respuestas, setRespuestas] = useState<boolean[]>([])
    const [mostrarResultado, setMostrarResultado] = useState<boolean | null>(null)
    const [puntuacion, setPuntuacion] = useState(0)
    const [actividadCompletada, setActividadCompletada] = useState(false)

    // Estados para arrastrar tildes
    const [silabaSeleccionada, setSilabaSeleccionada] = useState<number | null>(null)
    const [tildeColocada, setTildeColocada] = useState(false)

    // Estados para adivinanzas
    const [pistaActual, setPistaActual] = useState(0)
    const [mostrarRespuesta, setMostrarRespuesta] = useState(false)
    const [respuestaUsuario, setRespuestaUsuario] = useState("")

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
    const { progress, updateActivity } = useProgress("unidad3")
    const [puntosUnidad, setPuntosUnidad] = useState(0)
    const [estrellasUnidad, setEstrellasUnidad] = useState(0)

    useEffect(() => {
        const savedAvatar = localStorage.getItem("ortografia-avatar")
        if (savedAvatar) {
            setSelectedAvatar(savedAvatar)
        }
    }, [])

    useEffect(() => {
        if (progress && progress.activities) {
            let totalPuntos = 0
            Object.values(progress.activities).forEach((activity) => {
                if (activity && activity.lastScore) {
                    totalPuntos += activity.lastScore / 2
                }
            })
            setPuntosUnidad(totalPuntos)

            let estrellas = 0
            Object.values(progress.activities).forEach((activity) => {
                if (activity && activity.completed) {
                    estrellas += 1
                }
            })
            setEstrellasUnidad(estrellas)
        }
    }, [progress])

    const reproducirSonido = (texto: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(texto)
            utterance.lang = "es-ES"
            utterance.rate = 0.8
            speechSynthesis.speak(utterance)
        }
    }

    // Función para manejar clic en sílaba (arrastrar tildes)
    const handleSilabaClick = (index: number) => {
        if (tildeColocada) return

        setSilabaSeleccionada(index)
        setTildeColocada(true)

        const palabraActual = palabrasArrastrar[preguntaActual]
        const esCorrecta = index === palabraActual.correcta

        setMostrarResultado(esCorrecta)

        if (esCorrecta) {
            setPuntuacion((prev) => prev + 10)
        }

        setRespuestas([...respuestas, esCorrecta])

        setTimeout(() => {
            setMostrarResultado(null)
            setSilabaSeleccionada(null)
            setTildeColocada(false)
            if (preguntaActual < 9) {
                setPreguntaActual((prev) => prev + 1)
            } else {
                setActividadCompletada(true)
                const respuestasCorrectas = [...respuestas, esCorrecta].filter(Boolean).length
                const porcentajeExito = (respuestasCorrectas / 10) * 100
                if (porcentajeExito === 100) {
                    updateActivity("completar", {
                        attempts: 1,
                        lastScore: porcentajeExito,
                        completed: true,
                        stars: 1,
                    });
                }
            }
        }, 2000)
    }

    const verificarAdivinanza = () => {
        const adivinanzaActual = adivinanzas[preguntaActual]
        const esCorrecta = respuestaUsuario.toLowerCase().trim() === adivinanzaActual.respuesta.toLowerCase()

        setMostrarResultado(esCorrecta)
        setMostrarRespuesta(true)
        if (esCorrecta) {
            setPuntuacion((prev) => prev + 15)
        }

        setRespuestas([...respuestas, esCorrecta])
        setTimeout(() => {
            setMostrarResultado(null)
            setMostrarRespuesta(false)
            setRespuestaUsuario("")
            setPistaActual(0)

            if (preguntaActual < 5) {
                setPreguntaActual((prev) => prev + 1)
            } else {
                setActividadCompletada(true)
                const respuestasCorrectas = [...respuestas, esCorrecta].filter(Boolean).length
                const porcentajeExito = (respuestasCorrectas / 6) * 100




                if (progress && progress.activities) {
                    updateActivity("dictado", {
                        attempts: 1,
                        lastScore: porcentajeExito,
                        completed: true,
                        stars: porcentajeExito >= 80 ? 1 : 0,
                    });
                }
            }
        }, 3000)
    }

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

        setActividad(nuevaActividad)
        setPreguntaActual(0)
        setRespuestas([])
        setMostrarResultado(null)
        setActividadCompletada(false)
        setSilabaSeleccionada(null)
        setTildeColocada(false)
        setPistaActual(0)
        setMostrarRespuesta(false)
        setRespuestaUsuario("")

        if (nuevaActividad === "sopa") {
            generarSopaDeLetras()
        }
    }

    // Generar sopa de letras
    const generarSopaDeLetras = () => {
        const tamaño = 9
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
        const palabrasAColocar = [...palabrasAcentuadas]

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

    // Inicializar sopa de letras
    useEffect(() => {
        if (actividad === "sopa" && sopaLetras.length === 0) {
            generarSopaDeLetras()
        }
    }, [actividad])

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

                    if (palabrasEncontradas.length + 1 === palabrasAcentuadas.length) {
                        setActividadCompletada(true)
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
        <div className="min-h-screen bg-gradient-to-b from-orange-300 to-orange-200 overflow-hidden relative">
            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Encabezado */}
                <header className="p-4 flex justify-between items-center relative z-10 mb-8">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver</span>
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold text-center text-orange-800">
                        Unidad 3: Reglas de Acentuación
                    </h1>

                    <div className="flex items-center gap-2">
                        <div className="text-3xl bg-white p-2 rounded-full shadow-md">{selectedAvatar}</div>

                        <button
                            onClick={toggleMute}
                            className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
                            title={isMuted ? "Activar sonido" : "Silenciar"}
                        >
                            {isMuted ? (
                                <VolumeX className="w-6 h-6 text-orange-600" />
                            ) : (
                                <Volume2 className="w-6 h-6 text-orange-600" />
                            )}
                        </button>
                    </div>
                </header>



                {/* Selector de actividades */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button
                        onClick={() => cambiarActividad("diferencias")}
                        className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "diferencias" ? "bg-orange-600 text-white" : "bg-white/70 text-orange-600 hover:bg-white"
                            } transition-colors`}
                    >
                        Reglas de Acentuación
                    </button>
                    <button
                        onClick={() => cambiarActividad("completar")}
                        className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "completar" ? "bg-red-500 text-white" : "bg-white/70 text-red-600 hover:bg-white"
                            } transition-colors`}
                    >
                        Arrastrar Tildes
                    </button>
                    <button
                        onClick={() => cambiarActividad("dictado")}
                        className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "dictado" ? "bg-blue-500 text-white" : "bg-white/70 text-blue-600 hover:bg-white"
                            } transition-colors`}
                    >
                        Adivinanzas con Tildes
                    </button>
                    <button
                        onClick={() => cambiarActividad("sopa")}
                        className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "sopa" ? "bg-green-500 text-white" : "bg-white/70 text-green-600 hover:bg-white"
                            } transition-colors`}
                    >
                        Sopa de Palabras
                    </button>
                </div>

                {/* Contenido principal */}
                <div className="bg-white/80 rounded-3xl p-6 shadow-lg max-w-4xl mx-auto">
                    {/* Reglas de acentuación */}
                    {actividad === "diferencias" && (
                        <div className="text-center">
                            <h2
                                className={`text-2xl font-bold text-white mb-6 flex items-center justify-center p-4 rounded-xl ${reglasData[reglaActual].color}`}
                            >
                                <Lightbulb className="w-6 h-6 mr-2 text-yellow-300" />
                                {reglasData[reglaActual].titulo}
                            </h2>

                            <p className="text-lg text-orange-700 mb-6 bg-orange-100 p-4 rounded-xl">
                                {reglasData[reglaActual].descripcion}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {reglasData[reglaActual].ejemplos.map((ejemplo, index) => (
                                    <div key={index} className="bg-orange-100 p-4 rounded-xl border-2 border-orange-300">
                                        <div className="text-6xl mb-3">{ejemplo.emoji}</div>

                                        <div className="flex justify-center items-center gap-2 mb-3">
                                            {ejemplo.silabas.map((silaba, silabaIndex) => (
                                                <div
                                                    key={silabaIndex}
                                                    className={`px-3 py-2 rounded-lg text-xl font-bold border-2 ${silabaIndex === ejemplo.acentuada
                                                        ? `${reglasData[reglaActual].color} text-white border-orange-600 transform scale-110`
                                                        : "bg-white text-orange-800 border-orange-300"
                                                        }`}
                                                >
                                                    {silaba}
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-orange-800 font-medium mb-3">{ejemplo.palabra}</p>

                                        <div className="bg-yellow-100 p-2 rounded-lg mb-3">
                                            <p className="text-sm text-orange-700">{ejemplo.explicacion}</p>
                                        </div>

                                        <button
                                            onClick={() => reproducirSonido(ejemplo.palabra)}
                                            className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors cursor-pointer"
                                        >
                                            <Volume2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setReglaActual((prev) => (prev > 0 ? prev - 1 : reglasData.length - 1))}
                                    className="bg-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition-colors cursor-pointer"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setReglaActual((prev) => (prev < reglasData.length - 1 ? prev + 1 : 0))}
                                    className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition-colors cursor-pointer"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Arrastrar tildes */}
                    {actividad === "completar" && (
                        <div className="text-center">
                            {!actividadCompletada ? (
                                <>
                                    <div className="flex justify-between mb-4">
                                        <div className="text-orange-800 font-bold">Palabra {preguntaActual + 1}/10</div>
                                        <div className="flex gap-1">
                                            {[...Array(10)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-4 h-4 rounded-full ${i < preguntaActual ? (respuestas[i] ? "bg-green-500" : "bg-red-500") : "bg-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center justify-center">
                                        <Target className="w-6 h-6 mr-2" />
                                        ¡Coloca la tilde en la sílaba correcta!
                                    </h2>

                                    <div className="text-6xl mb-4">{palabrasArrastrar[preguntaActual].emoji}</div>

                                    <div className="bg-red-100 p-4 rounded-xl mb-6">
                                        <p className="text-lg text-red-700 mb-2">
                                            Tipo: <span className="font-bold">{palabrasArrastrar[preguntaActual].tipo}</span>
                                        </p>
                                    </div>

                                    <div className="flex justify-center items-center gap-4 mb-8">
                                        {palabrasArrastrar[preguntaActual].silabas.map((silaba, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSilabaClick(index)}
                                                disabled={tildeColocada}
                                                className={`relative px-6 py-4 text-3xl font-bold rounded-xl border-4 transition-all cursor-pointer ${silabaSeleccionada === index
                                                    ? mostrarResultado
                                                        ? "bg-green-400 text-white border-green-600 transform scale-110"
                                                        : "bg-red-400 text-white border-red-600 transform scale-110"
                                                    : tildeColocada
                                                        ? "bg-gray-200 text-gray-500 border-gray-300"
                                                        : "bg-white text-orange-800 border-orange-300 hover:bg-orange-100"
                                                    }`}
                                            >
                                                {silaba}
                                                {silabaSeleccionada === index && (
                                                    <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-4xl text-red-600">
                                                        ´
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {!tildeColocada && (
                                        <div className="bg-yellow-100 p-4 rounded-xl mb-4">
                                            <p className="text-orange-800">
                                                💡 Haz clic en la sílaba que suena más fuerte para colocar la tilde
                                            </p>
                                        </div>
                                    )}

                                    {mostrarResultado !== null && (
                                        <div className={`text-xl font-bold ${mostrarResultado ? "text-green-500" : "text-red-500"}`}>
                                            {mostrarResultado ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Check size={24} />
                                                    <span>
                                                        ¡Perfecto! La tilde va en "
                                                        {palabrasArrastrar[preguntaActual].silabas[palabrasArrastrar[preguntaActual].correcta]}"
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <X size={24} />
                                                    <span>
                                                        La tilde va en "
                                                        {palabrasArrastrar[preguntaActual].silabas[palabrasArrastrar[preguntaActual].correcta]}"
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h2 className="text-3xl font-bold text-orange-800 mb-4">¡Actividad Completada!</h2>
                                    <p className="text-xl text-orange-600 mb-8">
                                        Has colocado correctamente {respuestas.filter((r) => r).length} de 10 tildes
                                    </p>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => cambiarActividad(actividad)}
                                            className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                                        >
                                            <HelpCircle size={20} />
                                            <span>Jugar de nuevo</span>
                                        </button>
                                        <button
                                            onClick={() => cambiarActividad("diferencias")}
                                            className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                                        >
                                            <Award size={20} />
                                            <span>Volver a reglas</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Adivinanzas */}
                    {actividad === "dictado" && (
                        <div className="text-center">
                            {!actividadCompletada ? (
                                <>
                                    <div className="flex justify-between mb-4">
                                        <div className="text-orange-800 font-bold">Adivinanza {preguntaActual + 1}/6</div>
                                        <div className="flex gap-1">
                                            {[...Array(6)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-4 h-4 rounded-full ${i < preguntaActual ? (respuestas[i] ? "bg-green-500" : "bg-red-500") : "bg-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-orange-800 mb-6">🤔 ¡Adivina la palabra con tilde!</h2>

                                    <div className="text-8xl mb-6">{adivinanzas[preguntaActual].emoji}</div>

                                    <div className="bg-blue-100 p-6 rounded-xl mb-6">
                                        <p className="text-xl text-blue-800 font-medium">{adivinanzas[preguntaActual].pregunta}</p>
                                    </div>

                                    {!mostrarRespuesta && (
                                        <>
                                            <div className="mb-6">
                                                <input
                                                    type="text"
                                                    value={respuestaUsuario}
                                                    onChange={(e) => setRespuestaUsuario(e.target.value)}
                                                    placeholder="Escribe tu respuesta aquí..."
                                                    className="w-full max-w-md px-4 py-3 text-xl text-center rounded-xl border-2 border-orange-300 focus:border-orange-500 focus:outline-none"
                                                    disabled={mostrarResultado !== null}
                                                />
                                            </div>

                                            <div className="flex justify-center gap-4 mb-6">
                                                <button
                                                    onClick={verificarAdivinanza}
                                                    className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                                                    disabled={respuestaUsuario.trim() === "" || mostrarResultado !== null}
                                                >
                                                    Comprobar
                                                </button>

                                                {pistaActual < adivinanzas[preguntaActual].pistas.length && (
                                                    <button
                                                        onClick={() => setPistaActual((prev) => prev + 1)}
                                                        className="bg-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition-colors cursor-pointer"
                                                    >
                                                        💡 Pista
                                                    </button>
                                                )}
                                            </div>

                                            {pistaActual > 0 && (
                                                <div className="bg-yellow-100 p-4 rounded-xl mb-4">
                                                    <p className="text-yellow-800 font-bold">
                                                        💡 Pista: {adivinanzas[preguntaActual].pistas[pistaActual - 1]}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {mostrarRespuesta && (
                                        <div className="bg-green-100 p-6 rounded-xl mb-6">
                                            <div
                                                className={`text-2xl font-bold mb-4 ${mostrarResultado ? "text-green-600" : "text-red-600"}`}
                                            >
                                                {mostrarResultado ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Check size={32} />
                                                        <span>¡Correcto!</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <X size={32} />
                                                        <span>¡Casi!</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-xl text-green-800 mb-4">
                                                La respuesta es: <span className="font-bold">{adivinanzas[preguntaActual].respuesta}</span>
                                            </p>

                                            <div className="flex justify-center items-center gap-2 mb-4">
                                                {adivinanzas[preguntaActual].silabas.map((silaba, index) => (
                                                    <div
                                                        key={index}
                                                        className={`px-3 py-2 rounded-lg text-lg font-bold border-2 ${index === adivinanzas[preguntaActual].acentuada
                                                            ? "bg-green-400 text-white border-green-600"
                                                            : "bg-white text-green-800 border-green-300"
                                                            }`}
                                                    >
                                                        {silaba}
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => reproducirSonido(adivinanzas[preguntaActual].respuesta)}
                                                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors cursor-pointer"
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h2 className="text-3xl font-bold text-orange-800 mb-4">¡Adivinanzas Completadas!</h2>
                                    <p className="text-xl text-orange-600 mb-8">
                                        Has adivinado {respuestas.filter((r) => r).length} de 6 palabras correctamente
                                    </p>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => cambiarActividad(actividad)}
                                            className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            <HelpCircle size={20} />
                                            <span>Jugar de nuevo</span>
                                        </button>
                                        <button
                                            onClick={() => cambiarActividad("diferencias")}
                                            className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition-colors flex items-center gap-2"
                                        >
                                            <Award size={20} />
                                            <span>Volver a reglas</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sopa de palabras acentuadas */}
                    {actividad === "sopa" && (
                        <div className="text-center">
                            {!actividadCompletada ? (
                                <>
                                    <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-xl p-6 shadow-lg mb-6 relative overflow-hidden">
                                        <div className="absolute top-1 left-1 text-3xl">✏️</div>
                                        <div className="absolute top-1 right-1 text-3xl">🎵</div>
                                        <div className="absolute bottom-1 left-1 text-3xl">☕</div>
                                        <div className="absolute bottom-1 right-1 text-3xl">🌳</div>

                                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                                            <span className="mr-2">🔍</span>
                                            Sopa de Palabras con Tilde
                                            <span className="ml-2">✨</span>
                                        </h2>
                                        <p className="text-lg text-white mb-2">¡Encuentra las palabras que llevan tilde!</p>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div
                                            className="bg-orange-100 p-5 rounded-xl w-full md:w-auto shadow-md border-4 border-orange-300 relative"
                                            ref={sopaRef}
                                            onMouseLeave={handleCeldaMouseUp}
                                        >
                                            <div className="grid grid-cols-9 gap-1 mx-auto w-max">
                                                {sopaLetras.flatMap((fila, rowIndex) =>
                                                    fila.map((letra, colIndex) => (
                                                        <div
                                                            key={`${rowIndex}-${colIndex}`}
                                                            className={`w-10 h-10 flex items-center justify-center font-bold text-lg rounded-md transition-all duration-200 select-none cursor-pointer transform hover:scale-110
                        ${esCeldaPalabraEncontrada(rowIndex, colIndex)
                                                                    ? "bg-orange-400 text-white animate-pulse"
                                                                    : esCeldaSeleccionada(rowIndex, colIndex)
                                                                        ? "bg-yellow-300 text-orange-800"
                                                                        : "bg-white text-orange-800 shadow-sm"
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

                                        <div className="bg-yellow-100 p-5 rounded-xl flex-1 shadow-md border-4 border-yellow-300">
                                            <h3 className="text-xl font-bold text-orange-800 mb-3 flex items-center justify-center">
                                                <span className="mr-2">🎯</span> ¡Encuentra estas palabras! <span className="ml-2">🎯</span>
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {palabrasAcentuadas.map((palabra, index) => {
                                                    const iconos = ["🎵", "🌳", "☕", "👨‍⚕️", "✏️", "🐭"]
                                                    return (
                                                        <div
                                                            key={palabra}
                                                            className={`px-4 py-2 rounded-full text-md font-bold transition-all duration-300 flex items-center justify-between ${palabrasEncontradas.includes(palabra)
                                                                ? "bg-orange-400 text-white line-through transform scale-95"
                                                                : "bg-white text-orange-800 shadow-sm hover:shadow-md hover:scale-105"
                                                                }`}
                                                        >
                                                            <span>
                                                                {palabrasEncontradas.includes(palabra) ? "✓ " : ""} {palabra}
                                                            </span>
                                                            <span className="text-xl ml-2">{iconos[index]}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <div className="mt-6 bg-orange-200 p-3 rounded-lg text-orange-800 font-bold">
                                                <p className="flex items-center justify-center">
                                                    <span className="text-xl mr-2">📊</span>
                                                    ¡Has encontrado {palabrasEncontradas.length} de {palabrasAcentuadas.length} palabras!
                                                </p>
                                            </div>

                                            <div className="mt-4 text-orange-700 text-sm italic">
                                                Recuerda: Todas estas palabras llevan tilde (´) en alguna sílaba.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            onClick={() => cambiarActividad(actividad)}
                                            className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                                        >
                                            <span>🔄</span>
                                            <span>Reiniciar juego</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 bg-gradient-to-r from-orange-200 via-yellow-200 to-red-200 rounded-xl p-8 shadow-lg">
                                    <div className="animate-bounce text-7xl mb-6">🎉</div>
                                    <h2 className="text-4xl font-bold text-orange-800 mb-4">¡Fantástico trabajo!</h2>
                                    <p className="text-2xl text-orange-600 mb-8">
                                        Has encontrado todas las palabras con tilde. ¡Eres un experto en acentuación!
                                    </p>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => cambiarActividad(actividad)}
                                            className="bg-orange-500 text-white px-8 py-4 rounded-full font-bold hover:bg-orange-600 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
                                        >
                                            <span>🎮</span>
                                            <span>¡Jugar de nuevo!</span>
                                        </button>
                                        <button
                                            onClick={() => cambiarActividad("diferencias")}
                                            className="bg-yellow-600 text-white px-8 py-4 rounded-full font-bold hover:bg-yellow-700 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
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
