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
            attempts: 1,
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
                attempts: 1,
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
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "diferencias" ? "bg-teal-600 text-white" : "bg-white/70 text-teal-600 hover:bg-white"
              } transition-colors`}
          >
            Palabras Homófonas
          </button>
          <button
            onClick={() => cambiarActividad("completar")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "completar" ? "bg-blue-500 text-white" : "bg-white/70 text-blue-600 hover:bg-white"
              } transition-colors`}
          >
            Historias Interactivas
          </button>
          <button
            onClick={() => cambiarActividad("dictado")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "dictado" ? "bg-purple-500 text-white" : "bg-white/70 text-purple-600 hover:bg-white"
              } transition-colors`}
          >
            Juego de Cartas
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
              <div className="max-w-6xl mx-auto">
                {!actividadCompletada ? (
                  <div className="space-y-8">
                    {/* Header con progreso mejorado */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {historiaActual + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-blue-800">Historia {historiaActual + 1}</h3>
                            <p className="text-blue-600 text-sm">de {historias.length} historias</p>
                          </div>
                        </div>

                        {/* Progreso de palabras */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-1.5">
                            {historias[historiaActual].opciones.map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${i < opcionActual
                                    ? (respuestasHistoria[i] === historias[historiaActual].opciones[i].correcta ? "bg-green-400 shadow-lg shadow-green-200" : "bg-red-400 shadow-lg shadow-red-200")
                                    : i === opcionActual
                                      ? "bg-blue-400 animate-pulse shadow-lg shadow-blue-200"
                                      : "bg-gray-200"
                                  }`}
                              />
                            ))}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${((opcionActual + 1) / historias[historiaActual].opciones.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Título con animación */}
                    <div className="text-center">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
                        <BookOpen className="w-10 h-10 text-blue-500 animate-pulse" />
                        {historias[historiaActual].titulo}
                      </h2>
                      <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mx-auto"></div>
                    </div>

                    {/* Imagen principal con animación */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse"></div>
                        <div className="relative text-8xl md:text-9xl animate-bounce">
                          {historias[historiaActual].imagen}
                        </div>
                      </div>
                    </div>

                    {/* Historia con espacios mejorada */}
                    <div className="flex justify-center mb-8">
                      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-blue-200/30 shadow-xl max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            📖
                          </div>
                          <h3 className="text-lg font-semibold text-indigo-700">Historia</h3>
                        </div>

                        <div className="text-xl leading-relaxed text-gray-800">
                          {historias[historiaActual].historia.split("___").map((parte, index) => (
                            <span key={index}>
                              {parte}
                              {index < historias[historiaActual].opciones.length && (
                                <span
                                  className={`inline-block mx-2 px-4 py-2 rounded-2xl font-bold text-lg mb-2 transition-all duration-300 transform ${respuestasHistoria[index]
                                      ? respuestasHistoria[index] === historias[historiaActual].opciones[index].correcta
                                        ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-300/50 scale-105"
                                        : "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg shadow-red-300/50 scale-105"
                                      : index === opcionActual
                                        ? "bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-800 animate-pulse shadow-lg shadow-yellow-300/50 scale-110"
                                        : "bg-gray-200 text-gray-600 border-2 border-dashed border-gray-400 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                    }`}
                                >
                                  {respuestasHistoria[index] || "___"}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {opcionActual < historias[historiaActual].opciones.length && !mostrarResultado && (
                      <>
                        {/* Instrucción mejorada */}
                        <div className="flex justify-center mb-6">
                          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/50 shadow-lg max-w-lg">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">🎯</div>
                              <p className="text-indigo-800 font-medium text-lg">
                                Elige la palabra correcta para el espacio <span className="font-bold text-indigo-600">#{opcionActual + 1}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Opciones de respuesta mejoradas */}
                        <div className="flex flex-wrap justify-center gap-6 mb-8">
                          {historias[historiaActual].opciones[opcionActual].opciones.map((opcion, index) => (
                            <button
                              key={index}
                              onClick={() => handleRespuestaHistoria(opcion)}
                              className="cursor-pointer group relative bg-white/80 rounded-2xl px-8 py-4 shadow-lg border-2 border-blue-200/50 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                              {/* Efecto de brillo en hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                              <span className="relative z-10 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">
                                {opcion}
                              </span>

                              {/* Indicador de hover */}
                              <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Resultado mejorado */}
                    {mostrarResultado !== null && (
                      <div className="flex justify-center">
                        <div className={`flex flex-col items-center gap-4 px-8 py-6 rounded-3xl text-xl font-bold shadow-xl transform animate-in slide-in-from-bottom-4 duration-500 max-w-lg ${mostrarResultado
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
                              {mostrarResultado ? "¡Correcto!" : "La palabra correcta es:"}
                            </p>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                              <span className="text-2xl font-bold">
                                "{historias[historiaActual].opciones[opcionActual].correcta}"
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Información de progreso mejorada */}
                    <div className="flex justify-center">
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-blue-200/30 shadow-lg">
                        <p className="text-blue-700 font-medium">
                          Historia <span className="font-bold">{historiaActual + 1}</span> de <span className="font-bold">{historias.length}</span> •
                          Palabra <span className="font-bold">{opcionActual + 1}</span> de <span className="font-bold">{historias[historiaActual].opciones.length}</span>
                        </p>
                      </div>
                    </div>
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
                      ¡Historias Completadas!
                    </h2>

                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/30 shadow-xl max-w-md mx-auto">
                      <div className="text-6xl font-bold text-blue-800 mb-2">
                        {historias.length}
                      </div>
                      <p className="text-xl text-blue-600 font-medium mb-4">
                        historias completadas
                      </p>

                      <div className="flex items-center justify-center gap-2 text-blue-700">
                        <BookOpen size={20} />
                        <span className="font-medium">¡Todas las palabras correctas!</span>
                      </div>

                      {/* Efecto de logro */}
                      <div className="mt-6">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out w-full" />
                        </div>
                        <p className="text-sm text-blue-600 mt-2 font-medium">
                          ¡Maestro de las historias! 🌟
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción mejorados */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                      <button
                        onClick={() => cambiarActividad(actividad)}
                        className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      >
                        <HelpCircle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span>Leer de nuevo</span>
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

          {/* Juego de cartas */}
          {actividad === "dictado" && (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-teal-50 to-blue-50 p-4">
              <div className="max-w-5xl mx-auto">
                {!actividadCompletada ? (
                  <div className="space-y-8">
                    {/* Header con progreso mejorado */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {cartaActual + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-teal-800">Carta {cartaActual + 1}</h3>
                            <p className="text-teal-600 text-sm">de 10 cartas</p>
                          </div>
                        </div>

                        {/* Barra de progreso visual */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-1.5">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${i < cartaActual
                                    ? (respuestas[i] ? "bg-green-400 shadow-lg shadow-green-200" : "bg-red-400 shadow-lg shadow-red-200")
                                    : i === cartaActual
                                      ? "bg-teal-400 animate-pulse shadow-lg shadow-teal-200"
                                      : "bg-gray-200"
                                  }`}
                              />
                            ))}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${((cartaActual + 1) / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Título principal con animación */}
                    <div className="text-center">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
                        <Shuffle className="w-10 h-10 text-teal-500 animate-pulse" />
                        ¡Elige la carta correcta!
                      </h2>
                      <div className="w-32 h-1 bg-gradient-to-r from-teal-400 to-purple-400 rounded-full mx-auto"></div>
                    </div>

                    {cartasBarajadas.length > 0 && (
                      <>
                        {/* Emoji principal con animación */}
                        <div className="flex justify-center mb-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                            <div className="relative text-8xl md:text-9xl animate-pulse">
                              {cartasBarajadas[cartaActual].emoji}
                            </div>
                          </div>
                        </div>

                        {/* Pregunta principal mejorada */}
                        <div className="flex justify-center mb-8">
                          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-purple-200/30 shadow-xl max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                ?
                              </div>
                              <h3 className="text-lg font-semibold text-purple-700">Pregunta</h3>
                            </div>
                            <p className="text-2xl font-bold text-purple-800 leading-relaxed text-center">
                              {cartasBarajadas[cartaActual].pregunta}
                            </p>
                          </div>
                        </div>

                        {!mostrarResultado && (
                          <>
                            {/* Opciones de respuesta mejoradas */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
                              {cartasBarajadas[cartaActual].opciones.map((opcion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleRespuestaCarta(opcion)}
                                  className="cursor-pointer group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                  {/* Efecto de brillo en hover */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-purple-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                  <div className="relative z-10 text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">
                                    {opcion}
                                  </div>

                                  {/* Indicador de hover */}
                                  <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-teal-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                                </button>
                              ))}
                            </div>

                            {/* Botón de pista mejorado */}
                            <div className="flex justify-center">
                              <button
                                onClick={() => setMostrarPista(true)}
                                className="group bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-3"
                              >
                                <span className="text-2xl group-hover:animate-bounce">💡</span>
                                <span className="text-lg">Ver pista</span>
                              </button>
                            </div>

                            {/* Pista mejorada */}
                            {mostrarPista && (
                              <div className="flex justify-center mt-6">
                                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 backdrop-blur-sm rounded-3xl p-8 border border-yellow-200/50 shadow-xl max-w-2xl transform animate-in slide-in-from-bottom-4 duration-500">
                                  <div className="flex items-start gap-4">
                                    <div className="text-3xl animate-bounce">💡</div>
                                    <div>
                                      <h4 className="text-lg font-semibold text-orange-700 mb-2">Pista</h4>
                                      <p className="text-orange-800 font-medium text-lg leading-relaxed">
                                        {cartasBarajadas[cartaActual].pista}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Resultado mejorado */}
                        {mostrarResultado !== null && (
                          <div className="flex justify-center">
                            <div className={`flex flex-col items-center gap-4 px-8 py-6 rounded-3xl text-xl font-bold shadow-xl transform animate-in slide-in-from-bottom-4 duration-500 max-w-lg ${mostrarResultado
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
                                  {mostrarResultado ? "¡Correcto!" : "La respuesta correcta es:"}
                                </p>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                                  <span className="text-2xl font-bold">
                                    "{cartasBarajadas[cartaActual].respuesta}"
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  /* Pantalla de completado mejorada */
                  <div className="text-center py-12">
                    <div className="relative mb-8">
                      <div className="text-8xl mb-6 animate-bounce">🎉</div>
                      <div className="absolute inset-0 flex justify-center items-center">
                        <div className="w-32 h-32 bg-gradient-to-r from-teal-400/20 to-purple-400/20 rounded-full animate-ping"></div>
                      </div>
                    </div>

                    <h2 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-6">
                      ¡Juego Completado!
                    </h2>

                    {/* Estadísticas visuales mejoradas */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/30 shadow-xl max-w-md mx-auto">
                      <div className="grid grid-cols-3 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {respuestas.filter((r) => r).length}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Correctas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-500 mb-1">
                            {respuestas.filter((r) => !r).length}
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Incorrectas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-teal-600 mb-1">
                            {Math.round((respuestas.filter((r) => r).length / 10) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600 font-medium">Precisión</div>
                        </div>
                      </div>

                      {/* Barra de logros */}
                      <div className="mt-6">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(respuestas.filter((r) => r).length / 10) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-teal-600 mt-2 font-medium">
                          {respuestas.filter((r) => r).length >= 8 ? "¡Maestro del dictado! 🌟" :
                            respuestas.filter((r) => r).length >= 6 ? "¡Buen dominio! 👏" :
                              "¡Sigue practicando! 💪"}
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción mejorados */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                      <button
                        onClick={() => cambiarActividad(actividad)}
                        className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      >
                        <Shuffle size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span>Jugar de nuevo</span>
                      </button>
                      <button
                        onClick={() => cambiarActividad("diferencias")}
                        className="group bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-teal-700 hover:to-teal-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                      >
                        <Award size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span>Volver al menú</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                        ${esCeldaPalabraEncontrada(rowIndex, colIndex)
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
                              className={`px-4 py-2 rounded-full text-md font-bold transition-all duration-300 flex items-center justify-between ${palabrasEncontradas.includes(palabra)
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
