"use client"

import { useState, useEffect } from "react"
import { Star, ArrowLeft, Volume2, Check, X, HelpCircle, Award, Lightbulb, VolumeX, Palette, Link } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAudio } from "./app/contexts/AudioContext"
import useProgress from "./app/hooks/useProgress"

// Datos para las reglas ortográficas
const reglasData = [
  {
    titulo: "Uso de la H",
    descripcion: "La H es una letra muda que debemos escribir en ciertas palabras según reglas específicas.",
    color: "bg-green-400",
    ejemplos: [
      {
        palabra: "huevo",
        regla: "Se escribe H antes de 'ue'",
        explicacion: "Palabras que empiezan con 'hue-' llevan H",
        emoji: "🥚",
      },
      {
        palabra: "hierba",
        regla: "Se escribe H antes de 'ie'",
        explicacion: "Palabras que empiezan con 'hie-' llevan H",
        emoji: "🌿",
      },
      {
        palabra: "humano",
        regla: "Se escribe H antes de 'um'",
        explicacion: "Palabras que empiezan con 'hum-' llevan H",
        emoji: "👤",
      },
      {
        palabra: "hay",
        regla: "Formas del verbo haber",
        explicacion: "Todas las formas del verbo haber llevan H",
        emoji: "✅",
      },
    ],
  },
  {
    titulo: "Uso de LL y Y",
    descripcion: "Aunque suenan parecido, LL y Y se usan en diferentes tipos de palabras.",
    color: "bg-yellow-400",
    ejemplos: [
      {
        palabra: "llave",
        regla: "LL en sustantivos",
        explicacion: "Muchos objetos y cosas se escriben con LL",
        emoji: "🗝️",
      },
      {
        palabra: "lluvia",
        regla: "LL en fenómenos naturales",
        explicacion: "Palabras relacionadas con el clima usan LL",
        emoji: "🌧️",
      },
      {
        palabra: "yema",
        regla: "Y al inicio de palabra",
        explicacion: "Muchas palabras empiezan con Y",
        emoji: "🍳",
      },
      {
        palabra: "rey",
        regla: "Y al final de palabra",
        explicacion: "Palabras que terminan en sonido 'i' usan Y",
        emoji: "👑",
      },
    ],
  },
  {
    titulo: "Uso de R y RR",
    descripcion: "La R puede tener sonido suave o fuerte según su posición en la palabra.",
    color: "bg-red-400",
    ejemplos: [
      {
        palabra: "rosa",
        regla: "R al inicio (sonido fuerte)",
        explicacion: "Al inicio de palabra, R suena fuerte",
        emoji: "🌹",
      },
      {
        palabra: "perro",
        regla: "RR entre vocales (sonido fuerte)",
        explicacion: "Entre vocales, RR hace sonido fuerte",
        emoji: "🐕",
      },
      {
        palabra: "cara",
        regla: "R entre vocales (sonido suave)",
        explicacion: "Una sola R entre vocales suena suave",
        emoji: "😊",
      },
      {
        palabra: "honra",
        regla: "R después de consonante",
        explicacion: "Después de consonante, R suena fuerte",
        emoji: "🏆",
      },
    ],
  },
]

// Palabras para completar
const palabrasCompletar = [
  { palabra: "_uevo", opciones: ["h", ""], correcta: "h", pista: "Se come en el desayuno", emoji: "🥚" },
  { palabra: "_ierba", opciones: ["h", ""], correcta: "h", pista: "Crece en el jardín", emoji: "🌿" },
  { palabra: "_umano", opciones: ["h", ""], correcta: "h", pista: "Persona", emoji: "👤" },
  { palabra: "ca_a", opciones: ["r", "rr"], correcta: "r", pista: "Parte del cuerpo", emoji: "😊" },
  { palabra: "pe_o", opciones: ["r", "rr"], correcta: "rr", pista: "Animal doméstico", emoji: "🐕" },
  { palabra: "_osa", opciones: ["r", "rr"], correcta: "r", pista: "Flor bonita", emoji: "🌹" },
  { palabra: "_ave", opciones: ["ll", "y"], correcta: "ll", pista: "Abre puertas", emoji: "🗝️" },
  { palabra: "_uvia", opciones: ["ll", "y"], correcta: "ll", pista: "Cae del cielo", emoji: "🌧️" },
  { palabra: "_ema", opciones: ["y", "ll"], correcta: "y", pista: "Parte amarilla del huevo", emoji: "🍳" },
  { palabra: "re_", opciones: ["y", "ll"], correcta: "y", pista: "Gobierna un reino", emoji: "👑" },
]

// Palabras para pintar
const palabrasPintar = [
  {
    palabra: "hueso",
    letras: ["h", "u", "e", "s", "o"],
    correctas: [0],
    pista: "Está dentro del cuerpo",
    emoji: "🦴",
  },
  {
    palabra: "carro",
    letras: ["c", "a", "r", "r", "o"],
    correctas: [2, 3],
    pista: "Vehículo con ruedas",
    emoji: "🚗",
  },
  {
    palabra: "pollo",
    letras: ["p", "o", "ll", "o"],
    correctas: [2],
    pista: "Ave de corral",
    emoji: "🐔",
  },
  {
    palabra: "yate",
    letras: ["y", "a", "t", "e"],
    correctas: [0],
    pista: "Barco de lujo",
    emoji: "🛥️",
  },
  {
    palabra: "hierro",
    letras: ["h", "i", "e", "rr", "o"],
    correctas: [0, 3],
    pista: "Metal muy duro",
    emoji: "⚙️",
  },
  {
    palabra: "caballo",
    letras: ["c", "a", "b", "a", "ll", "o"],
    correctas: [4],
    pista: "Animal que galopa",
    emoji: "🐎",
  },
]

// Conexiones para unir
const conexiones = [
  {
    palabras: ["huevo", "hierba", "humano", "hay"],
    regla: "Palabras con H",
    color: "bg-green-200",
    emoji: "🅷",
  },
  {
    palabras: ["llave", "lluvia", "pollo", "caballo"],
    regla: "Palabras con LL",
    color: "bg-yellow-200",
    emoji: "🅻",
  },
  {
    palabras: ["yema", "yate", "rey", "buey"],
    regla: "Palabras con Y",
    color: "bg-blue-200",
    emoji: "🅨",
  },
  {
    palabras: ["rosa", "perro", "carro", "tierra"],
    regla: "Palabras con R/RR",
    color: "bg-red-200",
    emoji: "🅡",
  },
]

// Tipos de actividades
type Actividad = "diferencias" | "completar" | "dictado" | "sopa"

export default function Unidad5() {
  const router = useRouter()
  const [actividad, setActividad] = useState<Actividad>("diferencias")
  const [reglaActual, setReglaActual] = useState(0)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<boolean[]>([])
  const [mostrarResultado, setMostrarResultado] = useState<boolean | null>(null)
  const [puntuacion, setPuntuacion] = useState(0)
  const [actividadCompletada, setActividadCompletada] = useState(false)

  // Estados para pintar letras
  const [letrasPintadas, setLetrasPintadas] = useState<number[]>([])

  // Estados para unir con líneas
  const [conexionesHechas, setConexionesHechas] = useState<{ palabra: string; regla: string }[]>([])
  const [palabraSeleccionada, setPalabraSeleccionada] = useState<string | null>(null)

  const { isMusicPlaying, isMuted, toggleMusic, toggleMute } = useAudio()
  const [selectedAvatar, setSelectedAvatar] = useState("🐱")
  const { progress, updateActivity } = useProgress("unidad5")
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

  // Función para reproducir sonido
  const reproducirSonido = (texto: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(texto)
      utterance.lang = "es-ES"
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  // Función para verificar respuesta en completar
  const verificarRespuesta = (respuesta: string, correcta: string) => {
    const esCorrecta = respuesta === correcta
    setMostrarResultado(esCorrecta)

    if (esCorrecta) {
      setPuntuacion((prev) => prev + 10)
    }

    setRespuestas([...respuestas, esCorrecta])

    setTimeout(() => {
      setMostrarResultado(null)
      if (preguntaActual < 9) {
        setPreguntaActual((prev) => prev + 1)
      } else {
        setActividadCompletada(true)

        const respuestasCorrectas = [...respuestas, esCorrecta].filter(Boolean).length
        const porcentajeExito = (respuestasCorrectas / 10) * 100

        
          updateActivity("completar", {
            attempts: 1,
            lastScore: porcentajeExito,
            completed: true,
            stars: porcentajeExito >= 80 ? 1 : 0,
          })
        
      }
    }, 2000)
  }

  // Función para manejar pintar letras
  const handlePintarLetra = (index: number) => {
    const palabraActual = palabrasPintar[preguntaActual]
    const nuevasLetrasPintadas = [...letrasPintadas]

    if (nuevasLetrasPintadas.includes(index)) {
      // Despintar si ya está pintada
      const indexToRemove = nuevasLetrasPintadas.indexOf(index)
      nuevasLetrasPintadas.splice(indexToRemove, 1)
    } else {
      // Pintar la letra
      nuevasLetrasPintadas.push(index)
    }

    setLetrasPintadas(nuevasLetrasPintadas)

    // Verificar si todas las letras correctas están pintadas
    const todasCorrectas = palabraActual.correctas.every((i) => nuevasLetrasPintadas.includes(i))
    const soloCorrectas = nuevasLetrasPintadas.every((i) => palabraActual.correctas.includes(i))

    if (todasCorrectas && soloCorrectas) {
      setMostrarResultado(true)
      setPuntuacion((prev) => prev + 15)
      setRespuestas([...respuestas, true])

      setTimeout(() => {
        setMostrarResultado(null)
        setLetrasPintadas([])

        if (preguntaActual < 5) {
          setPreguntaActual((prev) => prev + 1)
        } else {
          setActividadCompletada(true)

          const respuestasCorrectas = [...respuestas, true].filter(Boolean).length
          const porcentajeExito = (respuestasCorrectas / 6) * 100
            updateActivity("dictado", {
              attempts: 1,
              lastScore: porcentajeExito,
              completed: true,
              stars: porcentajeExito >= 80 ? 1 : 0,
            })
          
        }
      }, 2000)
    }
  }

  // Función para manejar conexiones
  const handleConexion = (palabra: string, regla: string) => {
    if (palabraSeleccionada === palabra) {
      setPalabraSeleccionada(null)
      return
    }

    if (palabraSeleccionada) {
      // Verificar si la conexión es correcta
      const conexionCorrecta = conexiones.find((c) => c.regla === regla && c.palabras.includes(palabraSeleccionada))

      if (conexionCorrecta) {
        const nuevaConexion = { palabra: palabraSeleccionada, regla }
        setConexionesHechas([...conexionesHechas, nuevaConexion])
        setPuntuacion((prev) => prev + 20)
        setRespuestas([...respuestas, true])

        if (conexionesHechas.length + 1 >= 16) {
          setActividadCompletada(true)
            updateActivity("sopa", {
              attempts:  1,
              lastScore: 100,
              completed: true,
              stars: 1,
            })
          
        }
      } else {
        setRespuestas([...respuestas, false])
      }

      setPalabraSeleccionada(null)
    } else {
      setPalabraSeleccionada(palabra)
    }
  }

  // Función para cambiar de actividad
  const cambiarActividad = (nuevaActividad: Actividad) => {
    if (actividad !== nuevaActividad && actividad === "diferencias") {
      updateActivity("diferencias", {
        attempts:  1,
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
    setLetrasPintadas([])
    setConexionesHechas([])
    setPalabraSeleccionada(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-yellow-200 overflow-hidden relative">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Encabezado */}
        <header className="p-4 flex justify-between items-center relative z-10 mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-center text-green-800">
            Unidad 5: Reglas Ortográficas Básicas
          </h1>

          <div className="flex items-center gap-2">
            

            <div className="text-3xl bg-white p-2 rounded-full shadow-md">{selectedAvatar}</div>

            <button
              onClick={toggleMute}
              className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
              title={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-green-600" />
              ) : (
                <Volume2 className="w-6 h-6 text-green-600" />
              )}
            </button>
          </div>
        </header>

        

        {/* Selector de actividades */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => cambiarActividad("diferencias")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${
              actividad === "diferencias" ? "bg-green-600 text-white" : "bg-white/70 text-green-600 hover:bg-white"
            } transition-colors`}
          >
            Reglas Ortográficas
          </button>
          <button
            onClick={() => cambiarActividad("completar")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${
              actividad === "completar" ? "bg-yellow-500 text-white" : "bg-white/70 text-yellow-600 hover:bg-white"
            } transition-colors`}
          >
            Completar Palabras
          </button>
          <button
            onClick={() => cambiarActividad("dictado")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${
              actividad === "dictado" ? "bg-red-500 text-white" : "bg-white/70 text-red-600 hover:bg-white"
            } transition-colors`}
          >
            Pintar Letras
          </button>
          <button
            onClick={() => cambiarActividad("sopa")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${
              actividad === "sopa" ? "bg-blue-500 text-white" : "bg-white/70 text-blue-600 hover:bg-white"
            } transition-colors`}
          >
            Unir con Líneas
          </button>
        </div>

        {/* Contenido principal */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-lg max-w-4xl mx-auto">
          {/* Reglas ortográficas */}
          {actividad === "diferencias" && (
            <div className="text-center">
              <h2
                className={`text-2xl font-bold text-white mb-6 flex items-center justify-center p-4 rounded-xl ${reglasData[reglaActual].color}`}
              >
                <Lightbulb className="w-6 h-6 mr-2 text-yellow-300" />
                {reglasData[reglaActual].titulo}
              </h2>

              <p className="text-lg text-green-700 mb-6 bg-green-100 p-4 rounded-xl">
                {reglasData[reglaActual].descripcion}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {reglasData[reglaActual].ejemplos.map((ejemplo, index) => (
                  <div key={index} className="bg-green-100 p-4 rounded-xl border-2 border-green-300">
                    <div className="text-6xl mb-3">{ejemplo.emoji}</div>

                    <h3 className="text-2xl font-bold text-green-800 mb-2">{ejemplo.palabra}</h3>

                    <div className="bg-yellow-100 p-3 rounded-lg mb-3">
                      <p className="text-sm font-bold text-green-700 mb-1">{ejemplo.regla}</p>
                      <p className="text-sm text-green-600">{ejemplo.explicacion}</p>
                    </div>

                    <button
                      onClick={() => reproducirSonido(ejemplo.palabra)}
                      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors cursor-pointer"
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
                  className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Completar palabras */}
          {actividad === "completar" && (
            <div className="text-center">
              {!actividadCompletada ? (
                <>
                  <div className="flex justify-between mb-4">
                    <div className="text-green-800 font-bold">Palabra {preguntaActual + 1}/10</div>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < preguntaActual ? (respuestas[i] ? "bg-green-500" : "bg-red-500") : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-green-800 mb-4">¡Completa la palabra!</h2>

                  <div className="text-8xl mb-4">{palabrasCompletar[preguntaActual].emoji}</div>

                  <div className="bg-yellow-100 p-4 rounded-xl mb-6">
                    <p className="text-lg text-yellow-800 mb-2">Pista: {palabrasCompletar[preguntaActual].pista}</p>
                    <div className="text-4xl font-bold text-green-800">{palabrasCompletar[preguntaActual].palabra}</div>
                  </div>

                  <div className="flex justify-center gap-6 mb-8">
                    {palabrasCompletar[preguntaActual].opciones.map((opcion, index) => (
                      <button
                        key={index}
                        onClick={() => verificarRespuesta(opcion, palabrasCompletar[preguntaActual].correcta)}
                        className={`w-20 h-20 text-4xl font-bold rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                          mostrarResultado !== null
                            ? opcion === palabrasCompletar[preguntaActual].correcta
                              ? "bg-green-500 text-white transform scale-110"
                              : "bg-red-100 text-gray-400"
                            : "bg-white text-green-800 hover:bg-green-100 border-2 border-green-300"
                        } ${mostrarResultado !== null ? "pointer-events-none" : ""}`}
                      >
                        {opcion || "∅"}
                      </button>
                    ))}
                  </div>

                  {mostrarResultado !== null && (
                    <div className={`text-xl font-bold ${mostrarResultado ? "text-green-500" : "text-red-500"}`}>
                      {mostrarResultado ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check size={24} />
                          <span>¡Correcto!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X size={24} />
                          <span>Inténtalo de nuevo</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-green-800 mb-4">¡Actividad Completada!</h2>
                  <p className="text-xl text-green-600 mb-8">
                    Has completado {respuestas.filter((r) => r).length} de 10 palabras correctamente
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-yellow-500 text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-600 transition-colors flex items-center gap-2"
                    >
                      <HelpCircle size={20} />
                      <span>Jugar de nuevo</span>
                    </button>
                    <button
                      onClick={() => cambiarActividad("diferencias")}
                      className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Award size={20} />
                      <span>Volver a reglas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pintar letras */}
          {actividad === "dictado" && (
            <div className="text-center">
              {!actividadCompletada ? (
                <>
                  <div className="flex justify-between mb-4">
                    <div className="text-green-800 font-bold">Palabra {preguntaActual + 1}/6</div>
                    <div className="flex gap-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full ${
                            i < preguntaActual ? (respuestas[i] ? "bg-green-500" : "bg-red-500") : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center justify-center">
                    <Palette className="w-6 h-6 mr-2" />
                    ¡Pinta las letras especiales!
                  </h2>

                  <div className="text-8xl mb-4">{palabrasPintar[preguntaActual].emoji}</div>

                  <div className="bg-red-100 p-4 rounded-xl mb-6">
                    <p className="text-lg text-red-800 mb-2">Pista: {palabrasPintar[preguntaActual].pista}</p>
                    <p className="text-sm text-red-600">Haz clic en las letras que siguen las reglas ortográficas</p>
                  </div>

                  <div className="flex justify-center items-center gap-2 mb-8">
                    {palabrasPintar[preguntaActual].letras.map((letra, index) => (
                      <button
                        key={index}
                        onClick={() => handlePintarLetra(index)}
                        className={`w-16 h-16 text-3xl font-bold rounded-xl border-4 transition-all cursor-pointer ${
                          letrasPintadas.includes(index)
                            ? "bg-red-400 text-white border-red-600 transform scale-110"
                            : "bg-white text-green-800 border-green-300 hover:bg-green-100"
                        }`}
                      >
                        {letra}
                      </button>
                    ))}
                  </div>

                  {mostrarResultado !== null && (
                    <div className={`text-xl font-bold ${mostrarResultado ? "text-green-500" : "text-red-500"}`}>
                      {mostrarResultado ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check size={24} />
                          <span>¡Perfecto! Has pintado las letras correctas</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X size={24} />
                          <span>Sigue intentando</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎨</div>
                  <h2 className="text-3xl font-bold text-green-800 mb-4">¡Actividad de Pintar Completada!</h2>
                  <p className="text-xl text-green-600 mb-8">
                    Has pintado correctamente {respuestas.filter((r) => r).length} de 6 palabras
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <Palette size={20} />
                      <span>Pintar de nuevo</span>
                    </button>
                    <button
                      onClick={() => cambiarActividad("diferencias")}
                      className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Award size={20} />
                      <span>Volver a reglas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {actividad === "sopa" && (
            <div className="text-center">
              {!actividadCompletada ? (
                <>
                  <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center justify-center">
                    <Link className="w-6 h-6 mr-2" />
                    ¡Une las palabras con sus reglas!
                  </h2>

                  <p className="text-lg text-green-600 mb-6">
                    Haz clic en una palabra y luego en su regla correspondiente
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Columna de palabras */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-green-800 mb-4">Palabras</h3>
                      {conexiones.flatMap((grupo) =>
                        grupo.palabras.map((palabra) => {
                          const yaConectada = conexionesHechas.some((c) => c.palabra === palabra)
                          const seleccionada = palabraSeleccionada === palabra

                          return (
                            <button
                              key={palabra}
                              onClick={() => handleConexion(palabra, "")}
                              disabled={yaConectada}
                              className={`w-full p-4 rounded-xl font-bold text-lg transition-all cursor-pointer ${
                                yaConectada
                                  ? "bg-green-200 text-green-800 opacity-50"
                                  : seleccionada
                                    ? "bg-blue-400 text-white transform scale-105"
                                    : "bg-white text-green-800 hover:bg-green-100 border-2 border-green-300"
                              }`}
                            >
                              {palabra}
                            </button>
                          )
                        }),
                      )}
                    </div>

                    {/* Columna de reglas */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-green-800 mb-4">Reglas</h3>
                      {conexiones.map((grupo) => (
                        <button
                          key={grupo.regla}
                          onClick={() => handleConexion("", grupo.regla)}
                          className={`w-full p-4 rounded-xl font-bold text-lg transition-all cursor-pointer ${grupo.color} text-gray-800 hover:opacity-80 flex items-center justify-center gap-2`}
                        >
                          <span className="text-2xl">{grupo.emoji}</span>
                          {grupo.regla}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-100 p-4 rounded-xl">
                    <p className="text-blue-800 font-bold">Conexiones realizadas: {conexionesHechas.length} de 16</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔗</div>
                  <h2 className="text-3xl font-bold text-green-800 mb-4">¡Actividad de Unir Completada!</h2>
                  <p className="text-xl text-green-600 mb-8">
                    Has conectado todas las palabras con sus reglas correctas
                  </p>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Link size={20} />
                      <span>Unir de nuevo</span>
                    </button>
                    <button
                      onClick={() => cambiarActividad("diferencias")}
                      className="bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Award size={20} />
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
