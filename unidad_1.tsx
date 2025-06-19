"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Star, ArrowLeft, Volume2, Check, X, HelpCircle, Award, Mic, VolumeX, Music, Pause } from "lucide-react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"
import { useAudio } from './app/contexts/AudioContext'
import useProgress from "./app/hooks/useProgress"

// Datos para las actividades
const letrasConfusasData = [
  {
    grupo: "b/v",
    descripcion: "Aunque suenan igual, se escriben diferente según su origen y reglas ortográficas.",
    ejemplos: [
      {
        palabra: "barco",
        letra: "b",
        explicacion: "Se escribe con B las palabras que empiezan por 'bu-', 'bur-', 'bus-'",
      },
      { palabra: "viento", letra: "v", explicacion: "Se escribe con V las palabras que empiezan por 'vi-'" },
      { palabra: "biblioteca", letra: "b", explicacion: "Se escribe con B después de 'm'" },
      { palabra: "invierno", letra: "v", explicacion: "Se escribe con V después de 'n'" },
    ],
  },
  {
    grupo: "c/s/z",
    descripcion: "Estas letras pueden representar sonidos similares dependiendo del dialecto y la posición.",
    ejemplos: [
      { palabra: "cielo", letra: "c", explicacion: "La C suena como S antes de E o I" },
      { palabra: "zapato", letra: "z", explicacion: "La Z se usa principalmente antes de A, O, U" },
      { palabra: "sol", letra: "s", explicacion: "La S mantiene siempre el mismo sonido" },
      { palabra: "cebra", letra: "c", explicacion: "La C suena como Z antes de E en algunos dialectos" },
    ],
  },
  {
    grupo: "g/j",
    descripcion: "Estas letras pueden tener sonidos similares dependiendo de las vocales que las siguen.",
    ejemplos: [
      { palabra: "girasol", letra: "g", explicacion: "La G suena como J antes de E o I" },
      { palabra: "jamón", letra: "j", explicacion: "La J mantiene siempre el mismo sonido" },
      { palabra: "gato", letra: "g", explicacion: "La G tiene un sonido suave antes de A, O, U" },
      { palabra: "jirafa", letra: "j", explicacion: "Se escribe con J las palabras que terminan en '-aje'" },
    ],
  },
]

// Palabras para completar
const palabrasCompletar = [
  { palabra: "_arco", opciones: ["b", "v"], correcta: "b", pista: "Embarcación para navegar" },
  { palabra: "_aca", opciones: ["b", "v"], correcta: "v", pista: "Animal que da leche" },
  { palabra: "_apato", opciones: ["z", "s"], correcta: "z", pista: "Calzado para los pies" },
  { palabra: "_iudad", opciones: ["c", "s"], correcta: "c", pista: "Población grande" },
  { palabra: "_irafa", opciones: ["g", "j"], correcta: "j", pista: "Animal de cuello largo" },
  { palabra: "_ente", opciones: ["g", "j"], correcta: "g", pista: "Personas" },
  { palabra: "bi_icleta", opciones: ["c", "s"], correcta: "c", pista: "Vehículo de dos ruedas" },
  { palabra: "ca_eza", opciones: ["b", "v"], correcta: "b", pista: "Parte superior del cuerpo" },
  { palabra: "lápi_", opciones: ["z", "s"], correcta: "z", pista: "Instrumento para escribir" },
  { palabra: "pá_aro", opciones: ["g", "j"], correcta: "j", pista: "Animal que vuela" },
]

// Palabras para dictado
const palabrasDictado = [
  "barco",
  "vaca",
  "zapato",
  "ciudad",
  "jirafa",
  "gente",
  "bicicleta",
  "cabeza",
  "lápiz",
  "pájaro",
  "biblioteca",
  "ventana",
  "cebra",
  "sol",
  "girasol",
]

// Palabras para sopa de letras
const palabrasSopa = ["BARCO", "VACA", "ZAPATO", "JIRAFA", "GENTE", "CABEZA"]

// Tipos de actividades
type Actividad = "diferencias" | "completar" | "dictado" | "sopa"

export default function Unidad1() {
  const router = useRouter()
  const [actividad, setActividad] = useState<Actividad>("diferencias")
  const [grupoActual, setGrupoActual] = useState(0)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<boolean[]>([])
  const [mostrarResultado, setMostrarResultado] = useState<boolean | null>(null)
  const [puntuacion, setPuntuacion] = useState(0)
  const [actividadCompletada, setActividadCompletada] = useState(false)
  const [palabraDictado, setPalabraDictado] = useState("")
  const [respuestaDictado, setRespuestaDictado] = useState("")
  const [sopaLetras, setSopaLetras] = useState<string[][]>([])
  const [palabrasEncontradas, setPalabrasEncontradas] = useState<string[]>([])
  const [seleccionInicio, setSeleccionInicio] = useState<{ row: number; col: number } | null>(null)
  const [seleccionActual, setSeleccionActual] = useState<{ row: number; col: number } | null>(null)
  const [palabrasSeleccionadas, setPalabrasSeleccionadas] = useState<
    { palabra: string; celdas: { row: number; col: number }[] }[]
  >([])
  const sopaRef = useRef<HTMLDivElement>(null);
  const { isMusicPlaying, isMuted, toggleMusic, toggleMute } = useAudio();
  const [selectedAvatar, setSelectedAvatar] = useState("🐱");
  const { progress, updateActivity } = useProgress("unidad1");
  const [puntosUnidad, setPuntosUnidad] = useState(0);
  const [estrellasUnidad, setEstrellasUnidad] = useState(0);
  const [fallos, setFallos] = useState(0);

  const unitId = "unidad1";

const [palabrasSinClasificar, setPalabrasSinClasificar] = useState([
  "bajo", "silla", "viento", "cielo", "jugar", "zapato", "jarrón", "ambiente", "lápiz", "encerrado"
]);

const [categorias, setCategorias] = useState<{ b: string[]; c: string[]; g: string[] }>({
  b: [], // palabras con B o V
  c: [], // palabras con C, S o Z  
  g: []  // palabras con G o J
});

const [palabraSeleccionada, setPalabraSeleccionada] = useState<string | null>(null);
const [feedback, setFeedback] = useState<Record<string, boolean>>({});

// Función para asignar palabra a categoría
const asignarPalabra = (categoria: 'b' | 'c' | 'g') => {
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
  const nuevoFeedback: { [palabra: string]: boolean } = {};
  let errores = 0;
  
  // Definir qué letras corresponden a cada categoría
  const letrasPorCategoria = {
    b: ['b', 'v'],
    c: ['c', 's', 'z'],
    g: ['g', 'j']
  };
  
  // Verificar cada categoría
  Object.entries(categorias).forEach(([categoria, palabras]) => {
    const cat = categoria as keyof typeof letrasPorCategoria;
    (palabras as string[]).forEach((palabra: string) => {
      const letrasCategoria = letrasPorCategoria[cat];
      const esCorrecta = letrasCategoria.some(letra => 
        palabra.toLowerCase().includes(letra)
      );
      
      nuevoFeedback[palabra] = esCorrecta;
      
      if (!esCorrecta) {
        errores++;
      }
    });
  });
  
  setFeedback(nuevoFeedback);
  setFallos(errores);
  setActividadCompletada(true);
  
  // Actualizar estadísticas de la actividad
  if (errores <= 2) {
    updateActivity("sopa", {
      attempts: 1,
      lastScore: 100,
      completed: true,
      stars: errores === 0 ? 3 : errores === 1 ? 2 : 1
    });
  }
};

const reiniciarClasificacion = () => {
  setPalabrasSinClasificar([
    "bajo", "silla", "viento", "cielo", "jugar", "zapato", "jarrón", "ambiente", "lápiz", "encerrado"
  ]);
  setCategorias({
    b: [],
    c: [],
    g: []
  });
  setPalabraSeleccionada(null);
  setFeedback({});
  setFallos(0);
  setActividadCompletada(false);
};


  useEffect(() => {
    if (progress && unitId && progress.units[unitId]) {
      const unitActivities = progress.units[unitId].activities;



      const totalPuntos = Object.values(unitActivities).reduce(
        (sum, a) =>
          sum + Math.round((a.lastScore / 100) * 50),
        0
      );

      const estrellas = Object.values(unitActivities)
        .filter(activity => activity.completed).length;

      setPuntosUnidad(totalPuntos);
      setEstrellasUnidad(estrellas);
    }
  }, [progress, unitId]);


  useEffect(() => {
    const savedAvatar = localStorage.getItem('ortografia-avatar');
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar);
    }
  }, []);
  const [elementosDecorativosPos, setElementosDecorativosPos] = useState<
    { top: string; left: string; size: string; color: string }[]
  >([])

  useEffect(() => {
    if (elementosDecorativosPos.length === 0) {
      const elementos = Array(20)
        .fill(0)
        .map(() => {
          const colors = ["bg-purple-500", "bg-teal-400", "bg-orange-400"]
          return {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 20 + 10}px`,
            color: colors[Math.floor(Math.random() * colors.length)],
          }
        })
      setElementosDecorativosPos(elementos)
    }
  }, [elementosDecorativosPos])

  // Función para reproducir sonido de palabra
  const reproducirSonido = (palabra: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(palabra)
      utterance.lang = "es-ES"
      speechSynthesis.speak(utterance)
    }
  }







  const verificarRespuesta = (respuesta: string, correcta: string) => {
    const esCorrecta = respuesta.toLowerCase() === correcta.toLowerCase();
    setMostrarResultado(esCorrecta);
    if (!esCorrecta) {
      setFallos(prev => prev + 1);
    }

    if (preguntaActual === 9) {
      const correctas = respuestas.filter(r => r).length + (esCorrecta ? 1 : 0);
      const porcentaje = (correctas / 10) * 100;

      if (fallos < 3) {
        updateActivity("completar", {
          attempts: (progress?.units[unitId]?.activities.completar.attempts || 0) + 1,
          lastScore: porcentaje,
          completed: true,
          stars: porcentaje >= 60 ? 1 : 0
        });
      }
    }

    if (esCorrecta) {
      setPuntuacion((prev) => prev + 10)
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }, 300)
    }

    setRespuestas([...respuestas, esCorrecta])

    setTimeout(() => {
      setMostrarResultado(null)
      if (preguntaActual < 9) {
        setPreguntaActual((prev) => prev + 1)
      } else {
        setActividadCompletada(true)
      }
    }, 1500)
  }

  // Función para verificar respuesta en dictado
 const verificarDictado = () => {
  const esCorrecta = respuestaDictado.toLowerCase().trim() === palabraDictado.toLowerCase()
  setMostrarResultado(esCorrecta)

  let fallosActuales = fallos;
  if (!esCorrecta) {
    fallosActuales = fallos + 1;
    setFallos(fallosActuales);
  }

  if (esCorrecta) {
    setPuntuacion((prev) => prev + 10)
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }, 300)
  }

  setRespuestas([...respuestas, esCorrecta])

  setTimeout(() => {
    setMostrarResultado(null)
    setRespuestaDictado("")
    if (preguntaActual < 9) {
      const nuevaPregunta = preguntaActual + 1
      setPreguntaActual(nuevaPregunta)
      setPalabraDictado(palabrasDictado[nuevaPregunta])
    } else {
      if (fallosActuales < 3) {
        updateActivity("dictado", {
          attempts: (progress?.units[unitId]?.activities.dictado.attempts || 0) + 1,
          lastScore: 100,
          completed: true,
          stars: 1
        });
      }

      setActividadCompletada(true);
    }
  }, 1500)
}

  const cambiarActividad = (nuevaActividad: Actividad) => {
    setActividad(nuevaActividad)
    setPreguntaActual(0)
    setRespuestas([])
    setMostrarResultado(null)
    setActividadCompletada(false);
    setFallos(0);

    if (actividad !== nuevaActividad && actividad === "diferencias") {
      updateActivity("diferencias", {
        attempts: 1,
        lastScore: 100,
        completed: true,
        stars: 1,
      });
    }

    if (nuevaActividad === "dictado") {
      setPalabraDictado(palabrasDictado[0])
    } else if (nuevaActividad === "sopa") {
      generarSopaDeLetras()
    }
  }

  const volverAlInicio = (e: React.MouseEvent) => {
    e.preventDefault() // Prevenir el comportamiento predeterminado
    router.push("/")
  }

  // Generar sopa de letras
  const generarSopaDeLetras = () => {
    const tamaño = 7
    // Inicializar la sopa con espacios vacíos
    const sopa: string[][] = Array(tamaño)
      .fill(0)
      .map(() => Array(tamaño).fill(""))

    // Direcciones: horizontal, vertical, diagonal hacia abajo, diagonal hacia arriba
    const direcciones = [
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 1, dy: 1 },
      { dx: 1, dy: -1 },
    ]

    const palabrasColocadas: { palabra: string; celdas: { row: number; col: number }[] }[] = []
    const palabrasAColocar = [...palabrasSopa] // Hacer una copia para no modificar el original

    // Intentar colocar cada palabra
    for (const palabra of palabrasAColocar) {
      let colocada = false
      let intentos = 0
      const maxIntentos = 100

      while (!colocada && intentos < maxIntentos) {
        intentos++

        // Elegir dirección aleatoria
        const dir = direcciones[Math.floor(Math.random() * direcciones.length)]

        // Calcular límites válidos para la posición inicial
        const maxRow = dir.dy >= 0 ? tamaño - palabra.length * Math.abs(dir.dy) : tamaño - 1
        const minRow = dir.dy < 0 ? palabra.length * Math.abs(dir.dy) - 1 : 0
        const maxCol = dir.dx >= 0 ? tamaño - palabra.length * Math.abs(dir.dx) : tamaño - 1
        const minCol = dir.dx < 0 ? palabra.length * Math.abs(dir.dx) - 1 : 0

        // Elegir posición inicial aleatoria dentro de los límites válidos
        const startRow = minRow + Math.floor(Math.random() * (maxRow - minRow + 1))
        const startCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 1))

        // Verificar si no hay conflicto con otras palabras
        let conflicto = false
        const celdas: { row: number; col: number }[] = []

        for (let i = 0; i < palabra.length; i++) {
          const row = startRow + i * dir.dy
          const col = startCol + i * dir.dx

          // Verificar que estamos dentro de los límites
          if (row < 0 || row >= tamaño || col < 0 || col >= tamaño) {
            conflicto = true
            break
          }

          celdas.push({ row, col })

          // Si la celda ya tiene una letra, debe ser la misma que queremos colocar
          if (sopa[row][col] !== "" && sopa[row][col] !== palabra[i]) {
            conflicto = true
            break
          }
        }

        if (!conflicto) {
          // Colocar la palabra
          for (let i = 0; i < palabra.length; i++) {
            const row = startRow + i * dir.dy
            const col = startCol + i * dir.dx
            sopa[row][col] = palabra[i]
          }
          palabrasColocadas.push({ palabra, celdas })
          colocada = true
        }
      }

      // Si después de muchos intentos no se pudo colocar, seguir con la siguiente
      if (!colocada) {
        console.warn(`No se pudo colocar la palabra: ${palabra}`)
      }
    }

    // Llenar los espacios vacíos con letras aleatorias
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

  // Inicializar dictado y sopa de letras
  useEffect(() => {
    if (actividad === "dictado" && palabraDictado === "") {
      setPalabraDictado(palabrasDictado[0])
    } 
  }, [actividad, palabraDictado])

  // Manejar selección en sopa de letras
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-200 overflow-hidden relative">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Encabezado */}
        <header className="p-4 flex justify-between items-center relative z-10 mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-800">Unidad 1: Sonidos y Letras</h1>
          <div className="flex items-center gap-2">
            <div className="text-3xl bg-white p-2 rounded-full shadow-md">
              {selectedAvatar}
            </div>
            {/* Sound controls */}
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
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "diferencias" ? "bg-teal-400 text-white" : "bg-white/70 text-teal-600 hover:bg-white"
              } transition-colors`}
          >
            Diferencias B/V, C/S/Z, G/J
          </button>
          <button
            onClick={() => cambiarActividad("completar")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "completar" ? "bg-orange-400 text-white" : "bg-white/70 text-orange-600 hover:bg-white"
              } transition-colors`}
          >
            Completar Palabras
          </button>
          <button
            onClick={() => cambiarActividad("dictado")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "dictado" ? "bg-purple-600 text-white" : "bg-white/70 text-purple-600 hover:bg-white"
              } transition-colors`}
          >
            Dictado Interactivo
          </button>
          <button
            onClick={() => cambiarActividad("sopa")}
            className={`px-4 py-2 rounded-full font-bold cursor-pointer ${actividad === "sopa" ? "bg-red-500 text-white" : "bg-white/70 text-red-500 hover:bg-white"
              } transition-colors`}
          >
            Actividad Clasificatoria
          </button>
        </div>

        {/* Contenido principal */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-lg max-w-4xl mx-auto">
          {/* Diferencias entre letras */}
          {actividad === "diferencias" && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-800 mb-6">
                Diferencias entre {letrasConfusasData[grupoActual].grupo}
              </h2>

              <p className="text-lg text-purple-700 mb-6">{letrasConfusasData[grupoActual].descripcion}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {letrasConfusasData[grupoActual].ejemplos.map((ejemplo, index) => (
                  <div key={index} className="bg-purple-100 p-4 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-purple-800">
                        {ejemplo.palabra.replace(ejemplo.letra, `<${ejemplo.letra.toUpperCase()}>`)}
                      </span>
                      <button
                        onClick={() => reproducirSonido(ejemplo.palabra)}
                        className="bg-teal-400 text-white p-1 rounded-full hover:bg-teal-500 transition-colors cursor-pointer"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-purple-700">{ejemplo.explicacion}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setGrupoActual((prev) => (prev > 0 ? prev - 1 : letrasConfusasData.length - 1))}
                  className="bg-orange-400 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-500 transition-colors cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setGrupoActual((prev) => (prev < letrasConfusasData.length - 1 ? prev + 1 : 0))}
                  className="bg-teal-400 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-500 transition-colors cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Completar palabras */}
          {/* Completar palabras */}
          {actividad === "completar" && (
            <div className="text-center">
              {!actividadCompletada ? (
                <>
                  {/* Header mejorado con progreso e indicadores */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6 border border-purple-100">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {preguntaActual + 1}
                        </div>
                        <span className="text-purple-700 font-semibold">de 10 preguntas</span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((preguntaActual + 1) / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-purple-600 text-sm font-medium">
                        {Math.round(((preguntaActual + 1) / 10) * 100)}%
                      </div>
                    </div>

                    {/* Indicadores de respuestas anteriores */}
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${i < preguntaActual
                            ? (respuestas[i] ? "bg-green-400 shadow-md" : "bg-red-400 shadow-md")
                            : i === preguntaActual
                              ? "bg-purple-500 animate-pulse ring-2 ring-purple-300"
                              : "bg-gray-200"
                            }`}
                        />
                      ))}
                    </div>

                    {/* Sistema de estrellas y fallos rediseñado */}
                    <div className="flex items-center justify-center gap-6">
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
                  </div>

                  <h2 className="text-2xl font-bold text-purple-800 mb-4">Completa la palabra con la letra correcta</h2>

                  <p className="text-lg text-purple-600 mb-2">Pista: {palabrasCompletar[preguntaActual].pista}</p>

                  <div className="flex justify-center items-center gap-2 mb-8">
                    <div className="text-4xl font-bold tracking-widest text-purple-800">
                      {palabrasCompletar[preguntaActual].palabra.replace("_", "_")}
                    </div>
                  </div>

                  <div className="flex justify-center gap-6 mb-8">
                    {palabrasCompletar[preguntaActual].opciones.map((opcion, index) => (
                      <button
                        key={index}
                        onClick={() => verificarRespuesta(opcion, palabrasCompletar[preguntaActual].correcta)}
                        className={`w-20 h-20 text-4xl font-bold rounded-2xl flex items-center justify-center transition-all cursor-pointer ${mostrarResultado !== null
                          ? opcion === palabrasCompletar[preguntaActual].correcta
                            ? "bg-green-500 text-white transform scale-110"
                            : "bg-red-100 text-gray-400"
                          : "bg-white text-purple-800 hover:bg-purple-100"
                          } ${mostrarResultado !== null ? "pointer-events-none" : ""}`}
                      >
                        {opcion}
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
                  <h2 className="text-3xl font-bold text-purple-800 mb-6">¡Actividad Completada!</h2>

                  {/* Estadísticas detalladas */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border border-purple-100 inline-block">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

                      {/* Respuestas correctas */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                          <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {respuestas.filter((r) => r).length}
                        </div>
                        <div className="text-sm text-green-700 font-medium">
                          Respuestas correctas
                        </div>
                      </div>

                      {/* Respuestas incorrectas */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                          <X className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {fallos}
                        </div>
                        <div className="text-sm text-red-700 font-medium">
                          Intentos fallidos
                        </div>
                      </div>

                      {/* Estado de la estrella */}
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${fallos < 3 ? "bg-yellow-100" : "bg-gray-100"
                          }`}>
                          <Star
                            className={`w-8 h-8 ${fallos < 3 ? "text-yellow-500" : "text-gray-400"
                              }`}
                            fill={fallos < 3 ? "currentColor" : "none"}
                          />
                        </div>
                        <div className={`text-2xl font-bold mb-1 ${fallos < 3 ? "text-yellow-600" : "text-gray-500"
                          }`}>
                          {fallos < 3 ? "★ 1" : "★ 0"}
                        </div>
                        <div className={`text-sm font-medium ${fallos < 3 ? "text-yellow-700" : "text-gray-600"
                          }`}>
                          {fallos < 3 ? "¡Estrella ganada!" : "Estrella perdida"}
                        </div>
                      </div>
                    </div>

                    {/* Mensaje de rendimiento */}
                    <div className="mt-6 p-4 rounded-lg bg-white border-l-4 border-purple-400">
                      <p className="text-purple-700 font-medium">
                        {fallos === 0 && "¡Excelente! Respuesta perfecta sin errores."}
                        {fallos === 1 && "¡Muy bien! Solo un pequeño error, sigue así."}
                        {fallos === 2 && "¡Buen trabajo! Dos errores, pero ganaste la estrella."}
                        {fallos >= 3 && "¡Sigue practicando! Puedes mejorar en el próximo intento."}
                      </p>
                    </div>
                  </div>

                  {/* Progreso visual final */}
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${respuestas[i] ? "bg-green-400 shadow-md" : "bg-red-400 shadow-md"
                          }`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-teal-400 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-500 transition-colors flex items-center gap-2"
                    >
                      <HelpCircle size={20} />
                      <span>Jugar de nuevo</span>
                    </button>
                    <button
                      onClick={() => cambiarActividad("diferencias")}
                      className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Award size={20} />
                      <span>Volver a inicio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dictado interactivo */}
          {actividad === "dictado" && (
            <div className="text-center">
              {!actividadCompletada ? (
                <>
                  {/* Header mejorado con progreso e indicadores */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6 border border-purple-100">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {preguntaActual + 1}
                        </div>
                        <span className="text-purple-700 font-semibold">de 10 palabras</span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((preguntaActual + 1) / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-purple-600 text-sm font-medium">
                        {Math.round(((preguntaActual + 1) / 10) * 100)}%
                      </div>
                    </div>

                    {/* Indicadores de respuestas anteriores */}
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${i < preguntaActual
                              ? (respuestas[i] ? "bg-green-400 shadow-md" : "bg-red-400 shadow-md")
                              : i === preguntaActual
                                ? "bg-purple-500 animate-pulse ring-2 ring-purple-300"
                                : "bg-gray-200"
                            }`}
                        />
                      ))}
                    </div>

                    {/* Sistema de estrellas y fallos rediseñado */}
                    <div className="flex items-center justify-center gap-6">
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
                  </div>

                  <h2 className="text-2xl font-bold text-purple-800 mb-6">Dictado Interactivo</h2>
                  <p className="text-lg text-purple-600 mb-6">Escucha la palabra y escríbela correctamente</p>

                  <div className="flex justify-center mb-8">
                    <button
                      onClick={() => reproducirSonido(palabraDictado)}
                      className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                      <Mic size={32} />
                    </button>
                  </div>

                  <div className="mb-8">
                    <input
                      type="text"
                      value={respuestaDictado}
                      onChange={(e) => setRespuestaDictado(e.target.value)}
                      placeholder="Escribe la palabra aquí..."
                      className="w-full max-w-md px-4 py-3 text-xl text-purple-700 text-center rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none"
                      disabled={mostrarResultado !== null}
                    />
                  </div>

                  <button
                    onClick={verificarDictado}
                    className="bg-teal-400 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-500 transition-colors cursor-pointer"
                    disabled={respuestaDictado.trim() === "" || mostrarResultado !== null}
                  >
                    Comprobar
                  </button>

                  {mostrarResultado !== null && (
                    <div className={`mt-4 text-xl font-bold ${mostrarResultado ? "text-green-500" : "text-red-500"}`}>
                      {mostrarResultado ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check size={24} />
                          <span>¡Correcto!</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="flex items-center">
                            <X size={24} />
                            <span>Incorrecto</span>
                          </div>
                          <p className="text-lg">
                            La palabra correcta es: <strong>{palabraDictado}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-purple-800 mb-6">¡Dictado Completado!</h2>

                  {/* Estadísticas detalladas */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border border-purple-100 inline-block">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

                      {/* Palabras correctas */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                          <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {respuestas.filter((r) => r).length}
                        </div>
                        <div className="text-sm text-green-700 font-medium">
                          Palabras correctas
                        </div>
                      </div>

                      {/* Palabras incorrectas */}
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                          <X className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {fallos}
                        </div>
                        <div className="text-sm text-red-700 font-medium">
                          Palabras incorrectas
                        </div>
                      </div>

                      {/* Estado de la estrella */}
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${fallos < 3 ? "bg-yellow-100" : "bg-gray-100"
                          }`}>
                          <Star
                            className={`w-8 h-8 ${fallos < 3 ? "text-yellow-500" : "text-gray-400"
                              }`}
                            fill={fallos < 3 ? "currentColor" : "none"}
                          />
                        </div>
                        <div className={`text-2xl font-bold mb-1 ${fallos < 3 ? "text-yellow-600" : "text-gray-500"
                          }`}>
                          {fallos < 3 ? "★ 1" : "★ 0"}
                        </div>
                        <div className={`text-sm font-medium ${fallos < 3 ? "text-yellow-700" : "text-gray-600"
                          }`}>
                          {fallos < 3 ? "¡Estrella ganada!" : "Estrella perdida"}
                        </div>
                      </div>
                    </div>

                    {/* Mensaje de rendimiento */}
                    <div className="mt-6 p-4 rounded-lg bg-white border-l-4 border-purple-400">
                      <p className="text-purple-700 font-medium">
                        {fallos === 0 && "¡Excelente! Dictado perfecto sin errores de ortografía."}
                        {fallos === 1 && "¡Muy bien! Solo una palabra incorrecta, sigue así."}
                        {fallos === 2 && "¡Buen trabajo! Dos errores menores, pero ganaste la estrella."}
                        {fallos >= 3 && "¡Sigue practicando! La ortografía mejora con la práctica."}
                      </p>
                    </div>
                  </div>

                  {/* Progreso visual final */}
                  <div className="flex justify-center gap-1 mb-6">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${respuestas[i] ? "bg-green-400 shadow-md" : "bg-red-400 shadow-md"
                          }`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => cambiarActividad(actividad)}
                      className="bg-teal-400 text-white px-6 py-3 rounded-full font-bold hover:bg-teal-500 transition-colors flex items-center gap-2"
                    >
                      <HelpCircle size={20} />
                      <span>Jugar de nuevo</span>
                    </button>
                    <button
                      onClick={() => cambiarActividad("diferencias")}
                      className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Award size={20} />
                      <span>Volver a inicio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sopa de letras para niños */}
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
                      Clasificación de Palabras
                      <span className="ml-2">🔍</span>
                    </h2>
                    <p className="text-lg text-white mb-2">
                      ¡Clasifica las palabras según las letras que contienen!
                    </p>
                    <div className="flex justify-center">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-2xl ${i < Math.ceil((Object.values(categorias).flat().length) / 10 * 5) ? "text-yellow-300" : "text-gray-300"}`}>
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
                    {/* Categoría B/V */}
                    <div className="bg-green-100 p-5 rounded-xl shadow-md border-4 border-green-300 cursor-pointer">
                      <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center justify-center">
                        <span className="mr-2">🟢</span> Contienen <br /> B o V <span className="ml-2">🟢</span>
                      </h3>
                      <div 
                        className="min-h-[120px] bg-white rounded-lg p-3 border-2 border-dashed border-green-400"
                        onClick={() => palabraSeleccionada && asignarPalabra('b')}
                      >
                        {categorias.b.length === 0 ? (
                          <p className="text-green-600 italic text-center py-8">Pulsa aquí las palabras con B o V</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {categorias.b.map((palabra, index) => (
                              <span 
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm font-bold
                                  ${feedback[palabra] === true ? "bg-green-400 text-white" : 
                                    feedback[palabra] === false ? "bg-red-400 text-white" : 
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
                    </div>

                    {/* Categoría C/S/Z */}
                    <div className="bg-blue-100 p-5 rounded-xl shadow-md border-4 border-blue-300 cursor-pointer">
                      <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center justify-center">
                        <span className="mr-2">🔵</span> Contienen <br /> C, S o Z <span className="ml-2">🔵</span>
                      </h3>
                      <div 
                        className="min-h-[120px] bg-white rounded-lg p-3 border-2 border-dashed border-blue-400"
                        onClick={() => palabraSeleccionada && asignarPalabra('c')}
                      >
                        {categorias.c.length === 0 ? (
                          <p className="text-blue-600 italic text-center py-8">Pulsa aquí las palabras con C, S o Z</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {categorias.c.map((palabra, index) => (
                              <span 
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm font-bold
                                  ${feedback[palabra] === true ? "bg-green-400 text-white" : 
                                    feedback[palabra] === false ? "bg-red-400 text-white" : 
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
                    </div>

                    {/* Categoría G/J */}
                    <div className="bg-orange-100 p-5 rounded-xl shadow-md border-4 border-orange-300">
                      <h3 className="text-xl font-bold text-orange-800 mb-3 flex items-center justify-center">
                        <span className="mr-2">🟠</span> Contienen <br /> G o J <span className="ml-2">🟠</span>
                      </h3>
                      <div 
                        className="min-h-[120px] bg-white rounded-lg p-3 border-2 border-dashed border-orange-400 cursor-pointer"
                        onClick={() => palabraSeleccionada && asignarPalabra('g')}
                      >
                        {categorias.g.length === 0 ? (
                          <p className="text-orange-600 italic text-center py-8">Pulsa aquí las palabras con G o J</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {categorias.g.map((palabra, index) => (
                              <span 
                                key={index}
                                className={`px-3 py-1 rounded-full text-sm font-bold
                                  ${feedback[palabra] === true ? "bg-green-400 text-white" : 
                                    feedback[palabra] === false ? "bg-red-400 text-white" : 
                                    "bg-orange-200 text-orange-800"}`}
                              >
                                {palabra}
                                {feedback[palabra] === true && " ✓"}
                                {feedback[palabra] === false && " ✗"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Instrucciones y progreso */}
                  <div className="bg-purple-100 p-5 rounded-xl shadow-md border-4 border-purple-300 mb-6">
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-2xl mr-2">📊</span>
                      <span className="text-lg font-bold text-purple-800">
                        Progreso: {Object.values(categorias).flat().length} de 10 palabras clasificadas
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
                      💡 Pista: Selecciona una palabra y luego haz clic en la categoría correspondiente
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-wrap justify-center gap-4">
                    {Object.values(categorias).flat().length === 10 && (
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
                      ? "¡Has clasificado todas las palabras correctamente! ¡Eres un experto en ortografía!" 
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
                      <span className="text-green-600">✅ Correctas: {10 - fallos}</span>
                      <span className="text-red-600">❌ Incorrectas: {fallos}</span>
                      <span className="text-purple-600">📈 Precisión: {Math.round((10 - fallos) / 10 * 100)}%</span>
                    </div>
                  </div>

                  {/* Mostrar resultados por categoría */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                    <div className="bg-green-200 p-4 rounded-lg shadow-md">
                      <h4 className="font-bold text-green-800 mb-2">🟢 B/V</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {categorias.b.map((palabra, index) => (
                          <span key={index} className="text-sm bg-white px-2 py-1 rounded text-green-800">
                            {palabra}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-blue-200 p-4 rounded-lg shadow-md">
                      <h4 className="font-bold text-blue-800 mb-2">🔵 C/S/Z</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {categorias.c.map((palabra, index) => (
                          <span key={index} className="text-sm bg-white px-2 py-1 rounded text-blue-800">
                            {palabra}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-orange-200 p-4 rounded-lg shadow-md">
                      <h4 className="font-bold text-orange-800 mb-2">🟠 G/J</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {categorias.g.map((palabra, index) => (
                          <span key={index} className="text-sm bg-white px-2 py-1 rounded text-orange-800">
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
