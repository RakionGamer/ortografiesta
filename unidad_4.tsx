"use client"

import { useState, useRef, useEffect } from "react"
import {
  Star,
  ArrowLeft,
  Volume2,
  Check,
  X,
  HelpCircle,
  Award,
  Lightbulb,
  VolumeX,
  BookOpen,
  Shuffle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAudio } from "./app/contexts/AudioContext"
import useProgress from "./app/hooks/useProgress"

// Datos para las palabras homófonas
const homofonasData = [
  {
    grupo: "hay / ay / ahí",
    descripcion: "Tres palabras que suenan igual pero tienen significados muy diferentes.",
    palabras: [
      {
        palabra: "hay",
        tipo: "verbo haber",
        significado: "Indica que algo existe o está presente",
        ejemplo: "Hay muchos libros en la biblioteca",
        emoji: "📚",
        color: "bg-blue-400",
      },
      {
        palabra: "ay",
        tipo: "exclamación",
        significado: "Expresa dolor, sorpresa o emoción",
        ejemplo: "¡Ay, me duele la cabeza!",
        emoji: "😣",
        color: "bg-red-400",
      },
      {
        palabra: "ahí",
        tipo: "adverbio de lugar",
        significado: "Indica un lugar cercano",
        ejemplo: "El gato está ahí, en la silla",
        emoji: "👉",
        color: "bg-green-400",
      },
    ],
  },
  {
    grupo: "tubo / tuvo",
    descripción: "Dos palabras que suenan igual pero una es un objeto y otra es un verbo.",
    palabras: [
      {
        palabra: "tubo",
        tipo: "sustantivo",
        significado: "Objeto cilíndrico y hueco",
        ejemplo: "El agua pasa por el tubo",
        emoji: "🚰",
        color: "bg-cyan-400",
      },
      {
        palabra: "tuvo",
        tipo: "verbo tener",
        significado: "Pasado del verbo tener",
        ejemplo: "Ella tuvo una idea genial",
        emoji: "💡",
        color: "bg-yellow-400",
      },
    ],
  },
  {
    grupo: "votar / botar",
    descripción: "Una palabra es sobre elecciones y otra sobre tirar algo.",
    palabras: [
      {
        palabra: "votar",
        tipo: "verbo",
        significado: "Elegir en una votación",
        ejemplo: "Vamos a votar por nuestro candidato favorito",
        emoji: "🗳️",
        color: "bg-purple-400",
      },
      {
        palabra: "botar",
        tipo: "verbo",
        significado: "Tirar o lanzar algo",
        ejemplo: "No debes botar basura en la calle",
        emoji: "🗑️",
        color: "bg-orange-400",
      },
    ],
  },
  {
    grupo: "hola / ola",
    descripción: "Un saludo y algo del mar que suenan exactamente igual.",
    palabras: [
      {
        palabra: "hola",
        tipo: "saludo",
        significado: "Forma de saludar a alguien",
        ejemplo: "¡Hola! ¿Cómo estás?",
        emoji: "👋",
        color: "bg-pink-400",
      },
      {
        palabra: "ola",
        tipo: "sustantivo",
        significado: "Movimiento del agua del mar",
        ejemplo: "La ola llegó hasta la orilla",
        emoji: "🌊",
        color: "bg-blue-500",
      },
    ],
  },
]

// Historias cortas para elegir la palabra correcta
const historias = [
  {
    titulo: "El día en la playa",
    historia:
      "María fue a la playa con su familia. Al llegar, le dijo a su hermano: '¡___ Juan!' Después vieron una gran ___ que se acercaba a la orilla. '¡___, qué grande!' gritó María cuando la ___ los mojó.",
    opciones: [
      { posicion: 0, correcta: "hola", opciones: ["hola", "ola"] },
      { posicion: 1, correcta: "ola", opciones: ["hola", "ola"] },
      { posicion: 2, correcta: "ay", opciones: ["hay", "ay", "ahí"] },
      { posicion: 3, correcta: "ola", opciones: ["hola", "ola"] },
    ],
    imagen: "🏖️",
  },
  {
    titulo: "La votación en la escuela",
    historia:
      "En la escuela ___ una votación para elegir el mejor proyecto. Los estudiantes van a ___ por su favorito. Pedro no quiere ___ su voto a la basura, así que piensa bien antes de ___.",
    opciones: [
      { posicion: 0, correcta: "hay", opciones: ["hay", "ay", "ahí"] },
      { posicion: 1, correcta: "votar", opciones: ["votar", "botar"] },
      { posicion: 2, correcta: "botar", opciones: ["votar", "botar"] },
      { posicion: 3, correcta: "votar", opciones: ["votar", "botar"] },
    ],
    imagen: "🏫",
  },
  {
    titulo: "El plomero y el tubo",
    historia:
      "El plomero ___ que arreglar la tubería. Necesitaba un ___ nuevo porque el viejo estaba roto. '¡___, este ___ está muy dañado!' dijo mientras lo examinaba.",
    opciones: [
      { posicion: 0, correcta: "tuvo", opciones: ["tubo", "tuvo"] },
      { posicion: 1, correcta: "tubo", opciones: ["tubo", "tuvo"] },
      { posicion: 2, correcta: "ay", opciones: ["hay", "ay", "ahí"] },
      { posicion: 3, correcta: "tubo", opciones: ["tubo", "tuvo"] },
    ],
    imagen: "🔧",
  },
  {
    titulo: "La búsqueda del tesoro",
    historia:
      "Los niños buscaban un tesoro. 'El mapa dice que ___ una pista ___, junto al árbol grande', dijo Ana. '¡___, la encontré!' gritó Luis cuando vio la caja ___ escondida.",
    opciones: [
      { posicion: 0, correcta: "hay", opciones: ["hay", "ay", "ahí"] },
      { posicion: 1, correcta: "ahí", opciones: ["hay", "ay", "ahí"] },
      { posicion: 2, correcta: "ay", opciones: ["hay", "ay", "ahí"] },
      { posicion: 3, correcta: "ahí", opciones: ["hay", "ay", "ahí"] },
    ],
    imagen: "🗺️",
  },
  {
    titulo: "El experimento de ciencias",
    historia:
      "En clase de ciencias, el profesor ___ un experimento interesante. Usó un ___ de vidrio para mezclar los químicos. 'No deben ___ estos materiales', advirtió. Los estudiantes van a ___ por el mejor experimento del día.",
    opciones: [
      { posicion: 0, correcta: "tuvo", opciones: ["tubo", "tuvo"] },
      { posicion: 1, correcta: "tubo", opciones: ["tubo", "tuvo"] },
      { posicion: 2, correcta: "botar", opciones: ["votar", "botar"] },
      { posicion: 3, correcta: "votar", opciones: ["votar", "botar"] },
    ],
    imagen: "🧪",
  },
]

// Cartas para el juego
const cartasJuego = [
  {
    pregunta: "Saludo que usamos al encontrar a alguien",
    respuesta: "hola",
    opciones: ["hola", "ola"],
    pista: "Lo dices cuando ves a un amigo",
    emoji: "👋",
  },
  {
    pregunta: "Movimiento del agua en el mar",
    respuesta: "ola",
    opciones: ["hola", "ola"],
    pista: "Los surfistas la usan para deslizarse",
    emoji: "🌊",
  },
  {
    pregunta: "Verbo que indica existencia",
    respuesta: "hay",
    opciones: ["hay", "ay", "ahí"],
    pista: "Se usa para decir que algo existe",
    emoji: "✅",
  },
  {
    pregunta: "Exclamación de dolor o sorpresa",
    respuesta: "ay",
    opciones: ["hay", "ay", "ahí"],
    pista: "Lo dices cuando te duele algo",
    emoji: "😣",
  },
  {
    pregunta: "Lugar cercano donde está algo",
    respuesta: "ahí",
    opciones: ["hay", "ay", "ahí"],
    pista: "Señalas con el dedo y dices: está ___",
    emoji: "👉",
  },
  {
    pregunta: "Objeto cilíndrico y hueco",
    respuesta: "tubo",
    opciones: ["tubo", "tuvo"],
    pista: "Por donde pasa el agua en las tuberías",
    emoji: "🚰",
  },
  {
    pregunta: "Pasado del verbo tener",
    respuesta: "tuvo",
    opciones: ["tubo", "tuvo"],
    pista: "Ayer él ___ una gran idea",
    emoji: "💡",
  },
  {
    pregunta: "Elegir en una elección",
    respuesta: "votar",
    opciones: ["votar", "botar"],
    pista: "Lo que haces en las elecciones",
    emoji: "🗳️",
  },
  {
    pregunta: "Tirar algo a la basura",
    respuesta: "botar",
    opciones: ["votar", "botar"],
    pista: "Lo que haces con la basura",
    emoji: "🗑️",
  },
  {
    pregunta: "Animal que da leche",
    respuesta: "vaca",
    opciones: ["vaca", "baca"],
    pista: "Hace 'muuu' y vive en el campo",
    emoji: "🐄",
  },
]

// Palabras para sopa de letras
const palabrasHomofonas = ["HOLA", "HAY", "TUBO", "VOTAR", "VACA", "CASA"]

// Tipos de actividades
type Actividad = "diferencias" | "completar" | "dictado" | "sopa"

export default function Unidad4() {
  const router = useRouter()
  const [actividad, setActividad] = useState<Actividad>("diferencias")
  const [grupoActual, setGrupoActual] = useState(0)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<boolean[]>([])
  const [mostrarResultado, setMostrarResultado] = useState<boolean | null>(null)
  const [puntuacion, setPuntuacion] = useState(0)
  const [actividadCompletada, setActividadCompletada] = useState(false)

  // Estados para historias
  const [historiaActual, setHistoriaActual] = useState(0)
  const [respuestasHistoria, setRespuestasHistoria] = useState<string[]>([])
  const [opcionActual, setOpcionActual] = useState(0)

  // Estados para cartas
  const [cartaActual, setCartaActual] = useState(0)
  const [cartasBarajadas, setCartasBarajadas] = useState<typeof cartasJuego>([])
  const [mostrarPista, setMostrarPista] = useState(false)

  // Estados para sopa de letras
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
  const { progress, updateActivity } = useProgress("unidad4")
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

  // Barajar cartas al iniciar el juego
  useEffect(() => {
    if (actividad === "dictado" && cartasBarajadas.length === 0) {
      const barajadas = [...cartasJuego].sort(() => Math.random() - 0.5)
      setCartasBarajadas(barajadas)
    }
  }, [actividad])

  // Función para reproducir sonido
  const reproducirSonido = (texto: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(texto)
      utterance.lang = "es-ES"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  // Función para manejar respuesta en historias
  const handleRespuestaHistoria = (respuesta: string) => {
    const historiaData = historias[historiaActual]
    const opcionData = historiaData.opciones[opcionActual]
    const esCorrecta = respuesta === opcionData.correcta

    const nuevasRespuestas = [...respuestasHistoria]
    nuevasRespuestas[opcionActual] = respuesta

    setRespuestasHistoria(nuevasRespuestas)
    setMostrarResultado(esCorrecta)

    if (esCorrecta) {
      setPuntuacion((prev) => prev + 10)
    }

    setRespuestas([...respuestas, esCorrecta])

    setTimeout(() => {
      setMostrarResultado(null)

      if (opcionActual < historiaData.opciones.length - 1) {
        setOpcionActual((prev) => prev + 1)
      } else {
        // Historia completada
        if (historiaActual < historias.length - 1) {
          setHistoriaActual((prev) => prev + 1)
          setOpcionActual(0)
          setRespuestasHistoria([])
        } else {
          setActividadCompletada(true)

          const respuestasCorrectas = [...respuestas, esCorrecta].filter(Boolean).length
          const totalPreguntas = historias.reduce((acc, h) => acc + h.opciones.length, 0)
          const porcentajeExito = (respuestasCorrectas / totalPreguntas) * 100

            updateActivity("completar", {
              attempts:  1,
              lastScore: porcentajeExito,
              completed: true,
              stars: porcentajeExito >= 80 ? 1 : 0,
            })
          
        }
      }
    }, 2000)
  }

  // Función para manejar respuesta en cartas
  const handleRespuestaCarta = (respuesta: string) => {
    const cartaData = cartasBarajadas[cartaActual]
    const esCorrecta = respuesta === cartaData.respuesta

    setMostrarResultado(esCorrecta)

    if (esCorrecta) {
      setPuntuacion((prev) => prev + 15)
    }

    setRespuestas([...respuestas, esCorrecta])

    setTimeout(() => {
      setMostrarResultado(null)
      setMostrarPista(false)

      if (cartaActual < 9) {
        setCartaActual((prev) => prev + 1)
      } else {
        setActividadCompletada(true)

        const respuestasCorrectas = [...respuestas, esCorrecta].filter(Boolean).length
        const porcentajeExito = (respuestasCorrectas / 10) * 100

          updateActivity("dictado", {
            attempts: 1,
            lastScore: porcentajeExito,
            completed: true,
            stars: porcentajeExito >= 80 ? 1 : 0,
          })
      }
    }, 2000)
  }

  const cambiarActividad = (nuevaActividad: Actividad) => {
   if (actividad !== nuevaActividad && actividad === "diferencias") {
      updateActivity("diferencias", {
        attempts: 1,
        lastScore: 100,
        completed: true,
        stars: 1,
      })
    }

    setActividad(nuevaActividad)
    setPreguntaActual(0)
    setRespuestas([])
    setMostrarResultado(null)
    setActividadCompletada(false)
    setHistoriaActual(0)
    setRespuestasHistoria([])
    setOpcionActual(0)
    setCartaActual(0)
    setMostrarPista(false)

    if (nuevaActividad === "dictado") {
      const barajadas = [...cartasJuego].sort(() => Math.random() - 0.5)
      setCartasBarajadas(barajadas)
    } else if (nuevaActividad === "sopa") {
      generarSopaDeLetras()
    }
  }

  // Generar sopa de letras
  const generarSopaDeLetras = () => {
    const tamaño = 10
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
    const palabrasAColocar = [...palabrasHomofonas]

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

          if (palabrasEncontradas.length + 1 === palabrasHomofonas.length) {
            setActividadCompletada(true)

            if (progress && progress.activities) {
              updateActivity("sopa", {
                attempts: (progress.activities?.sopa?.attempts ?? 0) + 1,
                lastScore: 100,
                completed: true,
                stars: 1,
              })
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
    <div className="min-h-screen bg-gradient-to-b from-teal-300 to-teal-200 overflow-hidden relative">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Encabezado */}
        <header className="p-4 flex justify-between items-center relative z-10 mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-center text-teal-800">Unidad 4: Palabras Homófonas</h1>

          <div className="flex items-center gap-2">
            

            <div className="text-3xl bg-white p-2 rounded-full shadow-md">{selectedAvatar}</div>

            <button
              onClick={toggleMute}
              className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
              title={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX className="w-6 h-6 text-teal-600" /> : <Volume2 className="w-6 h-6 text-teal-600" />}
            </button>
          </div>
        </header>

        {/* Barra de progreso y estrellas */}
       

        {/* Selector de actividades */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => cambiarActividad("diferencias")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${
              actividad === "diferencias" ? "bg-teal-600 text-white" : "bg-white/70 text-teal-600 hover:bg-white"
            } transition-colors`}
          >
            Palabras Homófonas
          </button>
          <button
            onClick={() => cambiarActividad("completar")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${
              actividad === "completar" ? "bg-blue-500 text-white" : "bg-white/70 text-blue-600 hover:bg-white"
            } transition-colors`}
          >
            Historias Interactivas
          </button>
          <button
            onClick={() => cambiarActividad("dictado")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${
              actividad === "dictado" ? "bg-purple-500 text-white" : "bg-white/70 text-purple-600 hover:bg-white"
            } transition-colors`}
          >
            Juego de Cartas
          </button>
          <button
            onClick={() => cambiarActividad("sopa")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${
              actividad === "sopa" ? "bg-green-500 text-white" : "bg-white/70 text-green-600 hover:bg-white"
            } transition-colors`}
          >
            Sopa de Palabras
          </button>
        </div>

        {/* Contenido principal */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-lg max-w-4xl mx-auto">
          {/* Reglas de palabras homófonas */}
          {actividad === "diferencias" && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-teal-800 mb-6 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
                {homofonasData[grupoActual].grupo}
              </h2>

              <p className="text-lg text-teal-700 mb-6 bg-teal-100 p-4 rounded-xl">
                {homofonasData[grupoActual].descripcion}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {homofonasData[grupoActual].palabras.map((palabra, index) => (
                  <div key={index} className={`${palabra.color} p-6 rounded-xl text-white shadow-lg`}>
                    <div className="text-6xl mb-4">{palabra.emoji}</div>

                    <h3 className="text-2xl font-bold mb-2">{palabra.palabra}</h3>
                    <p className="text-sm font-medium mb-3 bg-white/20 rounded-full px-3 py-1">{palabra.tipo}</p>

                    <div className="bg-white/90 text-gray-800 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-2">Significado:</p>
                      <p className="text-sm">{palabra.significado}</p>
                    </div>

                    <div className="bg-white/90 text-gray-800 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-2">Ejemplo:</p>
                      <p className="text-sm italic">"{palabra.ejemplo}"</p>
                    </div>

                    <button
                      onClick={() => reproducirSonido(palabra.ejemplo)}
                      className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors cursor-pointer"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setGrupoActual((prev) => (prev > 0 ? prev - 1 : homofonasData.length - 1))}
                  className="bg-cyan-500 text-white px-6 py-3 rounded-full font-bold hover:bg-cyan-600 transition-colors cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setGrupoActual((prev) => (prev < homofonasData.length - 1 ? prev + 1 : 0))}
                  className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Historias interactivas */}
          {actividad === "completar" && (
            <div className="text-center">
              {!actividadCompletada ? (
                <>
                  <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 mr-2" />
                    {historias[historiaActual].titulo}
                  </h2>

                  <div className="text-8xl mb-6">{historias[historiaActual].imagen}</div>

                  <div className="bg-blue-100 p-6 rounded-xl mb-6">
                    <p className="text-lg text-blue-800 leading-relaxed">
                      {historias[historiaActual].historia.split("___").map((parte, index) => (
                        <span key={index}>
                          {parte}
                          {index < historias[historiaActual].opciones.length && (
                            <span
                              className={`inline-block mx-1 px-3 py-1 rounded-full font-bold ${
                                respuestasHistoria[index]
                                  ? respuestasHistoria[index] === historias[historiaActual].opciones[index].correcta
                                    ? "bg-green-400 text-white"
                                    : "bg-red-400 text-white"
                                  : index === opcionActual
                                    ? "bg-yellow-300 text-yellow-800 animate-pulse"
                                    : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {respuestasHistoria[index] || "___"}
                            </span>
                          )}
                        </span>
                      ))}
                    </p>
                  </div>

                  {opcionActual < historias[historiaActual].opciones.length && !mostrarResultado && (
                    <>
                      <p className="text-lg text-teal-700 mb-4">
                        Elige la palabra correcta para el espacio número {opcionActual + 1}:
                      </p>

                      <div className="flex justify-center gap-4 mb-6">
                        {historias[historiaActual].opciones[opcionActual].opciones.map((opcion, index) => (
                          <button
                            key={index}
                            onClick={() => handleRespuestaHistoria(opcion)}
                            className="bg-white text-teal-800 px-6 py-3 rounded-xl font-bold border-2 border-teal-300 hover:bg-teal-100 transition-colors cursor-pointer transform hover:scale-105"
                          >
                            {opcion}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {mostrarResultado !== null && (
                    <div className={`text-xl font-bold ${mostrarResultado ? "text-green-500" : "text-red-500"}`}>
                      {mostrarResultado ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check size={24} />
                          <span>
                            ¡Correcto! La palabra es "{historias[historiaActual].opciones[opcionActual].correcta}"
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X size={24} />
                          <span>
                            La palabra correcta es "{historias[historiaActual].opciones[opcionActual].correcta}"
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 text-sm text-teal-600">
                    Historia {historiaActual + 1} de {historias.length} - Palabra {opcionActual + 1} de{" "}
                    {historias[historiaActual].opciones.length}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-teal-800 mb-4">¡Historias Completadas!</h2>
                  <p className="text-xl text-teal-600 mb-8">
                    Has completado todas las historias y elegido las palabras correctas
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <HelpCircle size={20} />
                      <span>Leer de nuevo</span>
                    </button>
                    <button
                      onClick={() => cambiarActividad("diferencias")}
                      className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                      <Award size={20} />
                      <span>Volver a reglas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Juego de cartas */}
          {actividad === "dictado" && (
            <div className="text-center">
              {!actividadCompletada ? (
                <>
                  <div className="flex justify-between mb-4">
                    <div className="text-teal-800 font-bold">Carta {cartaActual + 1}/10</div>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < cartaActual ? (respuestas[i] ? "bg-green-500" : "bg-red-500") : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-teal-800 mb-6 flex items-center justify-center">
                    <Shuffle className="w-6 h-6 mr-2" />
                    ¡Elige la carta correcta!
                  </h2>

                  {cartasBarajadas.length > 0 && (
                    <>
                      <div className="text-8xl mb-6">{cartasBarajadas[cartaActual].emoji}</div>

                      <div className="bg-purple-100 p-6 rounded-xl mb-6">
                        <p className="text-xl text-purple-800 font-medium">{cartasBarajadas[cartaActual].pregunta}</p>
                      </div>

                      {!mostrarResultado && (
                        <>
                          <div className="flex justify-center gap-6 mb-6">
                            {cartasBarajadas[cartaActual].opciones.map((opcion, index) => (
                              <div
                                key={index}
                                onClick={() => handleRespuestaCarta(opcion)}
                                className="bg-white rounded-xl p-6 shadow-lg border-4 border-purple-300 hover:border-purple-500 transition-all cursor-pointer transform hover:scale-105 hover:shadow-xl"
                              >
                                <div className="text-4xl font-bold text-purple-800">{opcion}</div>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => setMostrarPista(true)}
                            className="bg-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition-colors cursor-pointer"
                          >
                            💡 Ver pista
                          </button>

                          {mostrarPista && (
                            <div className="mt-4 bg-yellow-100 p-4 rounded-xl">
                              <p className="text-yellow-800 font-bold">
                                💡 Pista: {cartasBarajadas[cartaActual].pista}
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {mostrarResultado !== null && (
                        <div className={`text-xl font-bold ${mostrarResultado ? "text-green-500" : "text-red-500"}`}>
                          {mostrarResultado ? (
                            <div className="flex items-center justify-center gap-2">
                              <Check size={24} />
                              <span>¡Correcto! La respuesta es "{cartasBarajadas[cartaActual].respuesta}"</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <X size={24} />
                              <span>La respuesta correcta es "{cartasBarajadas[cartaActual].respuesta}"</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-teal-800 mb-4">¡Juego de Cartas Completado!</h2>
                  <p className="text-xl text-teal-600 mb-8">
                    Has elegido correctamente {respuestas.filter((r) => r).length} de 10 cartas
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-purple-500 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-600 transition-colors flex items-center gap-2"
                    >
                      <Shuffle size={20} />
                      <span>Barajar de nuevo</span>
                    </button>
                    <button
                      onClick={() => cambiarActividad("diferencias")}
                      className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                      <Award size={20} />
                      <span>Volver a reglas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sopa de palabras homófonas */}
          {actividad === "sopa" && (
            <div className="text-center">
              {!actividadCompletada ? (
                <>
                  <div className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 rounded-xl p-6 shadow-lg mb-6 relative overflow-hidden">
                    <div className="absolute top-1 left-1 text-3xl">👋</div>
                    <div className="absolute top-1 right-1 text-3xl">🌊</div>
                    <div className="absolute bottom-1 left-1 text-3xl">🚰</div>
                    <div className="absolute bottom-1 right-1 text-3xl">🗳️</div>

                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                      <span className="mr-2">🔍</span>
                      Sopa de Palabras Homófonas
                      <span className="ml-2">✨</span>
                    </h2>
                    <p className="text-lg text-white mb-2">
                      ¡Encuentra las palabras que suenan igual pero se escriben diferente!
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div
                      className="bg-teal-100 p-5 rounded-xl w-full md:w-auto shadow-md border-4 border-teal-300 relative"
                      ref={sopaRef}
                      onMouseLeave={handleCeldaMouseUp}
                    >
                      <div className="grid grid-cols-10 gap-1 mx-auto w-max">
                        {sopaLetras.flatMap((fila, rowIndex) =>
                          fila.map((letra, colIndex) => (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`w-10 h-10 flex items-center justify-center font-bold text-lg rounded-md transition-all duration-200 select-none cursor-pointer transform hover:scale-110
                        ${
                          esCeldaPalabraEncontrada(rowIndex, colIndex)
                            ? "bg-teal-400 text-white animate-pulse"
                            : esCeldaSeleccionada(rowIndex, colIndex)
                              ? "bg-yellow-300 text-teal-800"
                              : "bg-white text-teal-800 shadow-sm"
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

                    <div className="bg-cyan-100 p-5 rounded-xl flex-1 shadow-md border-4 border-cyan-300">
                      <h3 className="text-xl font-bold text-teal-800 mb-3 flex items-center justify-center">
                        <span className="mr-2">🎯</span> ¡Encuentra estas palabras! <span className="ml-2">🎯</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {palabrasHomofonas.map((palabra, index) => {
                          const iconos = ["👋", "✅", "🚰", "🗳️", "🐄", "🏠"]
                          return (
                            <div
                              key={palabra}
                              className={`px-4 py-2 rounded-full text-md font-bold transition-all duration-300 flex items-center justify-between ${
                                palabrasEncontradas.includes(palabra)
                                  ? "bg-teal-400 text-white line-through transform scale-95"
                                  : "bg-white text-teal-800 shadow-sm hover:shadow-md hover:scale-105"
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

                      <div className="mt-6 bg-teal-200 p-3 rounded-lg text-teal-800 font-bold">
                        <p className="flex items-center justify-center">
                          <span className="text-xl mr-2">📊</span>
                          ¡Has encontrado {palabrasEncontradas.length} de {palabrasHomofonas.length} palabras!
                        </p>
                      </div>

                      <div className="mt-4 text-teal-700 text-sm italic">
                        Recuerda: Estas palabras suenan igual pero se escriben diferente.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-teal-500 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-600 transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <span>🔄</span>
                      <span>Reiniciar juego</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 bg-gradient-to-r from-teal-200 via-cyan-200 to-blue-200 rounded-xl p-8 shadow-lg">
                  <div className="animate-bounce text-7xl mb-6">🎉</div>
                  <h2 className="text-4xl font-bold text-teal-800 mb-4">¡Increíble trabajo!</h2>
                  <p className="text-2xl text-teal-600 mb-8">
                    Has encontrado todas las palabras homófonas. ¡Ahora sabes diferenciarlas perfectamente!
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-teal-500 text-white px-8 py-4 rounded-full font-bold hover:bg-teal-600 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
                    >
                      <span>🎮</span>
                      <span>¡Jugar de nuevo!</span>
                    </button>
                    <button
                      onClick={() => cambiarActividad("diferencias")}
                      className="bg-cyan-600 text-white px-8 py-4 rounded-full font-bold hover:bg-cyan-700 transition-transform hover:scale-105 shadow-md flex items-center gap-2"
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
