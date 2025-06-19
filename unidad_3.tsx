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
    const [estrellasUnidad, setEstrellasUnidad] = useState(0);
    const [fallos, setFallos] = useState(0);






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


    const handleSilabaClick = (index: number) => {
        if (tildeColocada) return;
        setSilabaSeleccionada(index);
        setTildeColocada(true);
        const palabraActual = palabrasArrastrar[preguntaActual];
        const esCorrecta = index === palabraActual.correcta;

        setMostrarResultado(esCorrecta);
        if (esCorrecta) {
            setPuntuacion((prev) => prev + 10);
        }
        setRespuestas((r) => [...r, esCorrecta]);

        const nuevosFallos = esCorrecta ? fallos : fallos + 1;
         if (!esCorrecta) {
            setFallos(n => n + 1);
        }
        setTimeout(() => {
            setMostrarResultado(null);
            setSilabaSeleccionada(null);
            setTildeColocada(false);
            if (preguntaActual < 9) {
                setPreguntaActual((prev) => prev + 1);
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
        }, 2200);
    };







    const verificarAdivinanza = () => {
        const adivinanzaActual = adivinanzas[preguntaActual];
        const esCorrecta =
            respuestaUsuario.toLowerCase().trim() ===
            adivinanzaActual.respuesta.toLowerCase();

        setMostrarResultado(esCorrecta);
        setMostrarRespuesta(true);
        if (esCorrecta) {
            setPuntuacion((prev) => prev + 15);
        }

        setRespuestas((r) => [...r, esCorrecta]);

        const nuevosFallos = esCorrecta ? fallos : fallos + 1;
        if (!esCorrecta) {
            setFallos(n => n + 1);
        }

        setTimeout(() => {
            setMostrarResultado(null);
            setMostrarRespuesta(false);
            setRespuestaUsuario("");
            setPistaActual(0);

            if (preguntaActual < 5) {
                setPreguntaActual((prev) => prev + 1);
            } else {
                setActividadCompletada(true);
                const respuestasCorrectas = [...respuestas, esCorrecta].filter(Boolean).length;
                const porcentajeExito = (respuestasCorrectas / 6) * 100;

                if (nuevosFallos < 3) {
                    updateActivity("dictado", {
                        attempts: 1,
                        lastScore: porcentajeExito,
                        completed: true,
                        stars: porcentajeExito >= 80 ? 1 : 0,
                    });
                }
            }
        }, 3000);
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


    const [palabrasSinClasificar, setPalabrasSinClasificar] = useState([
        "canción", "árbol", "murciélago", "papel", "teléfono", "mesa",
        "corazón", "fácil", "médico", "café", "lápiz", "computadora",
        "música", "ratón", "pájaro", "universidad"
    ]);

    type CategoriaKey = "agudas" | "graves" | "esdrujulas";

    const [categorias, setCategorias] = useState<Record<CategoriaKey, string[]>>({
        agudas: [],
        graves: [],
        esdrujulas: []
    });

    const [palabraSeleccionada, setPalabraSeleccionada] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Record<string, boolean>>({});

    // Clasificación correcta de las palabras
    const clasificacionCorrecta = {
        agudas: ["canción", "papel", "café", "corazón", "ratón"],
        graves: ["árbol", "mesa", "fácil", "lápiz", "computadora", "universidad"],
        esdrujulas: ["murciélago", "teléfono", "médico", "música", "pájaro"]
    };

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

    const comprobarClasificacion = () => {
        const nuevoFeedback: Record<string, boolean> = {};
        let errores = 0;

        Object.keys(categorias).forEach(categoria => {
            const cat = categoria as CategoriaKey;
            categorias[cat].forEach(palabra => {
                const esCorrecta = clasificacionCorrecta[cat].includes(palabra);
                nuevoFeedback[palabra] = esCorrecta;
                if (!esCorrecta) errores++;
            });
        });

        setFeedback(nuevoFeedback);
        setFallos(errores);
        setActividadCompletada(true);

        if (errores < 3) {
            updateActivity("sopa", {
                attempts: 1,
                lastScore: 100,
                completed: true,
                stars: 1
            });
        }
    };

    // Función para reiniciar la actividad
    const reiniciarActividad = () => {
        setPalabrasSinClasificar([
            "canción", "árbol", "murciélago", "papel", "teléfono", "mesa",
            "corazón", "fácil", "médico", "café", "lápiz", "computadora",
            "música", "ratón", "pájaro", "universidad"
        ]);
        setCategorias({
            agudas: [],
            graves: [],
            esdrujulas: []
        });
        setPalabraSeleccionada(null);
        setFeedback({});
        setFallos(0);
        setActividadCompletada(false);
    };




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
                        Actividad Clasificatoria
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
                        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-4">
                            <div className="max-w-5xl mx-auto">
                                {!actividadCompletada ? (
                                    <div className="space-y-8">
                                        {/* Header con progreso mejorado */}
                                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {preguntaActual + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-orange-800">Palabra {preguntaActual + 1}</h3>
                                                        <p className="text-orange-600 text-sm">de 10 palabras</p>
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
                                                                        ? "bg-orange-400 animate-pulse shadow-lg shadow-orange-200"
                                                                        : "bg-gray-200"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 ease-out"
                                                            style={{ width: `${((preguntaActual + 1) / 10) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
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

                                        {/* Título principal con animación */}
                                        <div className="text-center">
                                            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
                                                <Target className="w-10 h-10 text-orange-500 animate-pulse" />
                                                ¡Coloca la tilde en la sílaba correcta!
                                            </h2>
                                            <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mx-auto"></div>
                                        </div>

                                        {/* Emoji principal con animación */}
                                        <div className="flex justify-center mb-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-2xl animate-pulse"></div>
                                                <div className="relative text-8xl md:text-9xl animate-bounce">
                                                    {palabrasArrastrar[preguntaActual].emoji}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información del tipo de palabra */}
                                        <div className="flex justify-center">
                                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-red-200/30 shadow-lg max-w-sm">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        T
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-red-700">Tipo de palabra</h3>
                                                </div>
                                                <p className="text-2xl font-bold text-red-800 text-center">
                                                    {palabrasArrastrar[preguntaActual].tipo}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Sílabas interactivas mejoradas */}
                                        <div className="flex flex-wrap justify-center items-center gap-4 px-4">
                                            {palabrasArrastrar[preguntaActual].silabas.map((silaba, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSilabaClick(index)}
                                                    disabled={tildeColocada}
                                                    className={`group relative px-8 py-6 text-4xl md:text-5xl font-bold rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${silabaSeleccionada === index
                                                        ? mostrarResultado
                                                            ? "bg-gradient-to-br from-green-400 to-green-500 text-white border-green-600 scale-110 shadow-2xl shadow-green-300/50 animate-pulse"
                                                            : "bg-gradient-to-br from-red-400 to-red-500 text-white border-red-600 scale-110 shadow-2xl shadow-red-300/50 animate-pulse"
                                                        : tildeColocada
                                                            ? "bg-gray-100 text-gray-400 border-gray-200 scale-95"
                                                            : "bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 text-orange-800 border-orange-300 hover:border-orange-400 shadow-lg hover:shadow-xl cursor-pointer active:scale-95"
                                                        }`}
                                                >
                                                    {/* Efecto de brillo en hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                    <span className="relative z-10">{silaba}</span>

                                                    {/* Tilde animada */}
                                                    {silabaSeleccionada === index && (
                                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                            <span className="text-5xl text-red-600 animate-bounce drop-shadow-lg">
                                                                ´
                                                            </span>
                                                            <div className="absolute inset-0 text-5xl text-red-300 animate-ping opacity-75">
                                                                ´
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Instrucción de ayuda */}
                                        {!tildeColocada && (
                                            <div className="flex justify-center">
                                                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200/50 shadow-lg max-w-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-3xl animate-bounce">💡</div>
                                                        <p className="text-orange-800 font-medium text-lg">
                                                            Haz clic en la sílaba que suena más fuerte para colocar la tilde
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Resultado mejorado */}
                                        {mostrarResultado !== null && (
                                            <div className="flex justify-center">
                                                <div className={`flex flex-col items-center gap-4 px-8 py-6 rounded-3xl text-xl font-bold shadow-xl transform animate-in slide-in-from-bottom-4 duration-500 max-w-md ${mostrarResultado
                                                    ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-300/50"
                                                    : "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-300/50"
                                                    }`}>
                                                    <div className="flex items-center gap-3">
                                                        {mostrarResultado ? (
                                                            <>
                                                                <Check size={32} className="animate-bounce" />
                                                                <span className="text-2xl">¡Perfecto! 🎉</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X size={32} className="animate-pulse" />
                                                                <span className="text-xl">¡Casi! 💪</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="text-center">
                                                        <p className="text-lg opacity-90 mb-2">
                                                            {mostrarResultado ? "La tilde va en:" : "La tilde correcta va en:"}
                                                        </p>
                                                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                                            <span className="text-2xl font-bold">
                                                                "{palabrasArrastrar[preguntaActual].silabas[palabrasArrastrar[preguntaActual].correcta]}"
                                                            </span>
                                                        </div>
                                                    </div>
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
                                                <div className="w-32 h-32 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full animate-ping"></div>
                                            </div>
                                        </div>

                                        <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
                                            ¡Actividad Completada!
                                        </h2>

                                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/30 shadow-xl max-w-md mx-auto">
                                            <div className="text-6xl font-bold text-orange-800 mb-2">
                                                {respuestas.filter((r) => r).length}/10
                                            </div>
                                            <p className="text-xl text-orange-600 font-medium">
                                                tildes correctas
                                            </p>

                                            {/* Barra de logros */}
                                            <div className="mt-6">
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${(respuestas.filter((r) => r).length / 10) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-sm text-orange-600 mt-2 font-medium">
                                                    {respuestas.filter((r) => r).length >= 8 ? "¡Maestro de las tildes! 🌟" :
                                                        respuestas.filter((r) => r).length >= 6 ? "¡Buen dominio! 👏" :
                                                            "¡Sigue practicando! 💪"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                                            <button
                                                onClick={() => cambiarActividad(actividad)}
                                                className="group bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                            >
                                                <HelpCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                                                <span>Jugar de nuevo</span>
                                            </button>
                                            <button
                                                onClick={() => cambiarActividad("diferencias")}
                                                className="group bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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

                    {/* Adivinanzas */}
                    {actividad === "dictado" && (
                        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
                            <div className="max-w-4xl mx-auto">
                                {!actividadCompletada ? (
                                    <div className="space-y-8">
                                        {/* Header con progreso mejorado */}
                                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {preguntaActual + 1}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-blue-800">Adivinanza {preguntaActual + 1}</h3>
                                                        <p className="text-blue-600 text-sm">de 6 adivinanzas</p>
                                                    </div>
                                                </div>

                                                {/* Barra de progreso visual */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex gap-1.5">
                                                        {[...Array(6)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-3 h-3 rounded-full transition-all duration-300 ${i < preguntaActual
                                                                    ? (respuestas[i] ? "bg-green-400 shadow-lg shadow-green-200" : "bg-red-400 shadow-lg shadow-red-200")
                                                                    : i === preguntaActual
                                                                        ? "bg-blue-400 animate-pulse shadow-lg shadow-blue-200"
                                                                        : "bg-gray-200"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                                                            style={{ width: `${((preguntaActual + 1) / 6) * 100}%` }}
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

                                        {/* Título principal con emoji animado */}
                                        <div className="text-center">
                                            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
                                                ¡Adivina la palabra con tilde!
                                            </h2>
                                            <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mx-auto"></div>
                                        </div>

                                        {/* Emoji principal con animación */}
                                        <div className="flex justify-center mb-1">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
                                                <div className="relative text-xl md:text-[10rem] w-content animate-bounce hover:scale-110 transition-transform duration-300 cursor-pointer">
                                                    {adivinanzas[preguntaActual].emoji}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pregunta de la adivinanza mejorada */}
                                        <div className="relative">
                                            <div className="inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-3xl blur-xl"></div>
                                            <div className="flex justify-center relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-200/30 shadow-xl">
                                                <div className="flex items-start justify-center gap-4">
                                                    <div className="text-3xl">❓</div>
                                                    <p className="text-2xl text-blue-800 font-medium leading-relaxed flex-1">
                                                        {adivinanzas[preguntaActual].pregunta}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {!mostrarRespuesta && (
                                            <div className="space-y-6">
                                                {/* Input mejorado */}
                                                <div className="flex justify-center">
                                                    <div className="relative w-full max-w-lg">
                                                        <input
                                                            type="text"
                                                            value={respuestaUsuario}
                                                            onChange={(e) => setRespuestaUsuario(e.target.value)}
                                                            placeholder="Escribe tu respuesta aquí..."
                                                            className="w-full px-6 py-4 text-2xl text-black text-center rounded-2xl border-3 border-blue-300 focus:border-blue-500 focus:outline-none bg-white/90 shadow-lg transition-all duration-300 focus:shadow-xl focus:scale-105"
                                                            disabled={mostrarResultado !== null}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-2xl pointer-events-none"></div>
                                                    </div>
                                                </div>

                                                {/* Botones de acción mejorados */}
                                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                                    <button
                                                        onClick={verificarAdivinanza}
                                                        className="cursor-pointer group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                        disabled={respuestaUsuario.trim() === "" || mostrarResultado !== null}
                                                    >
                                                        <Check size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                                                        <span>Comprobar</span>
                                                    </button>

                                                    {pistaActual < adivinanzas[preguntaActual].pistas.length && (
                                                        <button
                                                            onClick={() => setPistaActual((prev) => prev + 1)}
                                                            className="cursor-pointer group bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                                        >
                                                            <span className="text-2xl group-hover:animate-bounce">💡</span>
                                                            <span>Pista</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Pista mostrada */}
                                                {pistaActual > 0 && (
                                                    <div className="flex justify-center animate-in slide-in-from-top-4  duration-500">
                                                        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200/50 shadow-lg max-w-2xl">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-3xl animate-pulse">💡</div>
                                                                <div>
                                                                    <h4 className="text-lg font-bold text-yellow-800 mb-1">Pista:</h4>
                                                                    <p className="text-yellow-800 font-medium text-lg">
                                                                        {adivinanzas[preguntaActual].pistas[pistaActual - 1]}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Respuesta revelada mejorada */}
                                        {mostrarRespuesta && (
                                            <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-3xl blur-xl"></div>
                                                    <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-green-200/30 shadow-xl">

                                                        {/* Resultado del usuario */}
                                                        <div className={`text-center mb-6 ${mostrarResultado ? "text-green-600" : "text-red-600"}`}>
                                                            <div className="flex items-center justify-center gap-3 mb-4">
                                                                {mostrarResultado ? (
                                                                    <>
                                                                        <Check size={40} className="animate-pulse" />
                                                                        <span className="text-3xl font-bold">¡Correcto! 🎉</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <X size={40} className="animate-pulse" />
                                                                        <span className="text-3xl font-bold">¡Casi! 💪</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Respuesta correcta */}
                                                        <div className="text-center mb-6">
                                                            <p className="text-xl text-green-800 mb-4">
                                                                La respuesta es:
                                                            </p>
                                                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 inline-block">
                                                                <span className="text-3xl font-bold text-green-800">
                                                                    {adivinanzas[preguntaActual].respuesta}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Sílabas con acentuación */}
                                                        <div className="flex justify-center items-center gap-3 mb-6 flex-wrap">
                                                            {adivinanzas[preguntaActual].silabas.map((silaba, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`px-4 py-3 rounded-xl text-xl font-bold border-3 transition-all duration-300 ${index === adivinanzas[preguntaActual].acentuada
                                                                        ? "bg-gradient-to-br from-green-400 to-green-500 text-white border-green-600 shadow-lg shadow-green-300/50 transform scale-110"
                                                                        : "bg-white text-green-800 border-green-300 hover:border-green-400"
                                                                        }`}
                                                                >
                                                                    {silaba}
                                                                    {index === adivinanzas[preguntaActual].acentuada && (
                                                                        <div className="text-xs text-green-100 mt-1 font-normal">
                                                                            ← sílaba tónica
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Botón de sonido mejorado */}
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => reproducirSonido(adivinanzas[preguntaActual].respuesta)}
                                                                className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95"
                                                            >
                                                                <Volume2 size={24} className="group-hover:animate-pulse" />
                                                            </button>
                                                        </div>
                                                    </div>
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
                                                <div className="w-32 h-32 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full animate-ping"></div>
                                            </div>
                                        </div>

                                        <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                                            ¡Adivinanzas Completadas!
                                        </h2>

                                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/30 shadow-xl max-w-md mx-auto">
                                            <div className="text-6xl font-bold text-blue-800 mb-2">
                                                {respuestas.filter((r) => r).length}/6
                                            </div>
                                            <p className="text-xl text-blue-600 font-medium">
                                                adivinanzas correctas
                                            </p>

                                            {/* Barra de logros */}
                                            <div className="mt-6">
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${(respuestas.filter((r) => r).length / 6) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-sm text-blue-600 mt-2 font-medium">
                                                    {respuestas.filter((r) => r).length >= 5 ? "¡Detective de palabras! 🕵️" :
                                                        respuestas.filter((r) => r).length >= 3 ? "¡Buen trabajo! 👏" :
                                                            "¡Sigue adivinando! 🧩"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                                            <button
                                                onClick={() => cambiarActividad(actividad)}
                                                className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                            >
                                                <HelpCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                                                <span>Jugar de nuevo</span>
                                            </button>
                                            <button
                                                onClick={() => cambiarActividad("diferencias")}
                                                className="group bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
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

                    {/* Sopa de palabras acentuadas */}
                    {actividad === "sopa" && (
                        <div className="text-center">
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
                                                Clasificación por Acentuación
                                                <span className="ml-2">🔍</span>
                                            </h2>
                                            <p className="text-lg text-white mb-2">
                                                ¡Clasifica las palabras según su acentuación!
                                            </p>
                                            <div className="flex justify-center">
                                                <div className="flex items-center space-x-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`text-2xl ${i < Math.ceil((Object.values(categorias).flat().length) / 16 * 5) ? "text-yellow-300" : "text-gray-300"}`}>
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
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            {/* Categoría AGUDAS */}
                                            <div className="bg-red-100 p-5 rounded-xl shadow-md border-4 border-red-300">
                                                <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center justify-center">
                                                    <span className="mr-2">🔥</span> AGUDAS <span className="ml-2">🔥</span>
                                                </h3>
                                                <div
                                                    className="min-h-[150px] bg-white rounded-lg p-3 border-2 border-dashed border-red-400 cursor-pointer hover:bg-red-50 transition-colors"
                                                    onClick={() => palabraSeleccionada && asignarPalabra('agudas')}
                                                >
                                                    {categorias.agudas.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <p className="text-red-600 italic text-lg">Pulsa aquí las palabras</p>
                                                            <p className="text-red-600 italic text-lg">agudas</p>
                                                            <div className="text-2xl mt-2">🔥</div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {categorias.agudas.map((palabra, index) => (
                                                                <span
                                                                    key={index}
                                                                    className={`px-3 py-1 rounded-full text-sm font-bold transition-all duration-300
                            ${feedback[palabra] === true ? "bg-green-400 text-white animate-pulse" :
                                                                            feedback[palabra] === false ? "bg-red-400 text-white animate-shake" :
                                                                                "bg-red-200 text-red-800"}`}
                                                                >
                                                                    {palabra}
                                                                    {feedback[palabra] === true && " ✓"}
                                                                    {feedback[palabra] === false && " ✗"}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-3 text-xs text-red-700 italic text-center">
                                                    💡 Acento en la última sílaba
                                                </div>
                                            </div>

                                            {/* Categoría GRAVES */}
                                            <div className="bg-blue-100 p-5 rounded-xl shadow-md border-4 border-blue-300">
                                                <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center justify-center">
                                                    <span className="mr-2">⚖️</span> GRAVES <span className="ml-2">⚖️</span>
                                                </h3>
                                                <div
                                                    className="min-h-[150px] bg-white rounded-lg p-3 border-2 border-dashed border-blue-400 cursor-pointer hover:bg-blue-50 transition-colors"
                                                    onClick={() => palabraSeleccionada && asignarPalabra('graves')}
                                                >
                                                    {categorias.graves.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <p className="text-blue-600 italic text-lg">Pulsa aquí las palabras</p>
                                                            <p className="text-blue-600 italic text-lg">graves</p>
                                                            <div className="text-2xl mt-2">⚖️</div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {categorias.graves.map((palabra, index) => (
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
                                                    💡 Acento en la penúltima sílaba
                                                </div>
                                            </div>

                                            {/* Categoría ESDRÚJULAS */}
                                            <div className="bg-green-100 p-5 rounded-xl shadow-md border-4 border-green-300">
                                                <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center justify-center">
                                                    <span className="mr-2">⭐</span> ESDRÚJULAS <span className="ml-2">⭐</span>
                                                </h3>
                                                <div
                                                    className="min-h-[150px] bg-white rounded-lg p-3 border-2 border-dashed border-green-400 cursor-pointer hover:bg-green-50 transition-colors"
                                                    onClick={() => palabraSeleccionada && asignarPalabra('esdrujulas')}
                                                >
                                                    {categorias.esdrujulas.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <p className="text-green-600 italic text-lg">Pulsa aquí las palabras</p>
                                                            <p className="text-green-600 italic text-lg">esdrújulas</p>
                                                            <div className="text-2xl mt-2">⭐</div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {categorias.esdrujulas.map((palabra, index) => (
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
                                                    💡 Acento en la antepenúltima sílaba
                                                </div>
                                            </div>
                                        </div>

                                        {/* Instrucciones y progreso */}
                                        <div className="bg-purple-100 p-5 rounded-xl shadow-md border-4 border-purple-300 mb-6">
                                            <div className="flex items-center justify-center mb-3">
                                                <span className="text-2xl mr-2">📊</span>
                                                <span className="text-lg font-bold text-purple-800">
                                                    Progreso: {Object.values(categorias).flat().length} de 16 palabras clasificadas
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
                                                💡 Pista: Pronuncia la palabra y escucha dónde suena más fuerte
                                            </div>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex flex-wrap justify-center gap-4">
                                            {Object.values(categorias).flat().length === 16 && (
                                                <button
                                                    onClick={comprobarClasificacion}
                                                    className="bg-green-500 text-white px-8 py-4 rounded-full font-bold hover:bg-green-600 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
                                                >
                                                    <span>✅</span>
                                                    <span>Comprobar clasificación</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={reiniciarActividad}
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
                                            {fallos === 0 ? "🎉" : fallos <= 3 ? "😊" : "😅"}
                                        </div>
                                        <h2 className="text-4xl font-bold text-purple-800 mb-4">
                                            {fallos === 0 ? "¡PERFECTO!" : fallos <= 3 ? "¡BUEN TRABAJO!" : "¡SIGUE PRACTICANDO!"}
                                        </h2>
                                        <p className="text-2xl text-purple-600 mb-8">
                                            {fallos === 0
                                                ? "¡Has clasificado todas las palabras correctamente! ¡Eres un experto en acentuación!"
                                                : fallos <= 3
                                                    ? `Has tenido ${fallos} error${fallos > 1 ? 'es' : ''}. ¡Muy bien, casi perfecto!`
                                                    : `Has tenido ${fallos} errores. ¡No te preocupes, practica más y lo lograrás!`
                                            }
                                        </p>

                                        <div className="flex justify-center mb-6">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`text-4xl animate-pulse ${fallos === 0 && i < 5 ? "text-yellow-400" :
                                                    fallos <= 3 && i < 3 ? "text-yellow-400" :
                                                        fallos > 3 && i < 1 ? "text-yellow-400" :
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
                                                <span className="text-green-600">✅ Correctas: {16 - fallos}</span>
                                                <span className="text-red-600">❌ Incorrectas: {fallos}</span>
                                                <span className="text-purple-600">📈 Precisión: {Math.round((16 - fallos) / 16 * 100)}%</span>
                                            </div>
                                        </div>

                                        {/* Mostrar resultados por categoría */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                                            <div className="bg-red-200 p-4 rounded-lg shadow-md">
                                                <h4 className="font-bold text-red-800 mb-2">🔥 AGUDAS</h4>
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {categorias.agudas.map((palabra, index) => (
                                                        <span key={index} className={`text-sm px-2 py-1 rounded ${feedback[palabra] === true ? "bg-green-400 text-white" :
                                                            feedback[palabra] === false ? "bg-red-300 text-red-800" :
                                                                "bg-white text-red-800"
                                                            }`}>
                                                            {palabra}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-blue-200 p-4 rounded-lg shadow-md">
                                                <h4 className="font-bold text-blue-800 mb-2">⚖️ GRAVES</h4>
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {categorias.graves.map((palabra, index) => (
                                                        <span key={index} className={`text-sm px-2 py-1 rounded ${feedback[palabra] === true ? "bg-green-400 text-white" :
                                                            feedback[palabra] === false ? "bg-red-300 text-red-800" :
                                                                "bg-white text-blue-800"
                                                            }`}>
                                                            {palabra}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-green-200 p-4 rounded-lg shadow-md">
                                                <h4 className="font-bold text-green-800 mb-2">⭐ ESDRÚJULAS</h4>
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {categorias.esdrujulas.map((palabra, index) => (
                                                        <span key={index} className={`text-sm px-2 py-1 rounded ${feedback[palabra] === true ? "bg-green-400 text-white" :
                                                            feedback[palabra] === false ? "bg-red-300 text-red-800" :
                                                                "bg-white text-green-800"
                                                            }`}>
                                                            {palabra}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Explicación educativa */}
                                        <div className="bg-yellow-100 p-6 rounded-lg shadow-md mb-6 max-w-4xl mx-auto">
                                            <h4 className="font-bold text-yellow-800 mb-4 text-xl">📚 Reglas de Acentuación</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                                <div className="bg-red-50 p-3 rounded-lg">
                                                    <h5 className="font-bold text-red-800 mb-2">🔥 AGUDAS</h5>
                                                    <p className="text-sm text-red-700 mb-2">
                                                        Acento en la <strong>última sílaba</strong>
                                                    </p>
                                                    <p className="text-xs text-red-600">
                                                        Llevan tilde cuando terminan en vocal, 'n' o 's'
                                                    </p>
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Ej: ca-<strong>CIÓN</strong>, ca-<strong>FÉ</strong>
                                                    </p>
                                                </div>
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <h5 className="font-bold text-blue-800 mb-2">⚖️ GRAVES</h5>
                                                    <p className="text-sm text-blue-700 mb-2">
                                                        Acento en la <strong>penúltima sílaba</strong>
                                                    </p>
                                                    <p className="text-xs text-blue-600">
                                                        Llevan tilde cuando NO terminan en vocal, 'n' o 's'
                                                    </p>
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        Ej: <strong>ÁR</strong>-bol, <strong>LÁ</strong>-piz
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 p-3 rounded-lg">
                                                    <h5 className="font-bold text-green-800 mb-2">⭐ ESDRÚJULAS</h5>
                                                    <p className="text-sm text-green-700 mb-2">
                                                        Acento en la <strong>antepenúltima sílaba</strong>
                                                    </p>
                                                    <p className="text-xs text-green-600">
                                                        Siempre llevan tilde
                                                    </p>
                                                    <p className="text-xs text-green-600 mt-1">
                                                        Ej: <strong>MÚ</strong>-si-ca, <strong>MÉ</strong>-di-co
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-4">
                                            <button
                                                onClick={reiniciarActividad}
                                                className="bg-teal-500 text-white px-8 py-4 rounded-full font-bold hover:bg-teal-600 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
                                            >
                                                <span>🎮</span>
                                                <span>¡Jugar de nuevo!</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
