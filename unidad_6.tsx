"use client"

import { useState, useEffect, useRef } from "react"
import { Star, ArrowLeft, Volume2, Check, X, HelpCircle, Award, Lightbulb, VolumeX, Palette, Link, Shuffle, Brain, Grid3X3 } from "lucide-react"
import { useAudio } from "./app/contexts/AudioContext"


export default function Unidad5() {
    const [selectedAvatar, setSelectedAvatar] = useState("🐱")
    const [juegoActual, setJuegoActual] = useState("menu") // menu, sopa, crucigrama, memoria
    // const [isMuted, setIsMuted] = useState(false)
    
    // Estados para la sopa de letras
    const [sopaCompletada, setSopaCompletada] = useState(false)
    const [palabrasEncontradas, setPalabrasEncontradas] = useState<string[]>([])
    const [seleccionando, setSeleccionando] = useState(false)
    const [celdaInicio, setCeldaInicio] = useState<[number, number] | null>(null)
    const [celdaFin, setCeldaFin] = useState<[number, number] | null>(null)
    const [celdasSeleccionadas, setCeldasSeleccionadas] = useState<[number, number][]>([])
    const [palabrasEncontradasPosiciones, setPalabrasEncontradasPosiciones] = useState<[number, number][]>([])

    // Estados para el crucigrama
    const [crucigramaCompletado, setCrucigramaCompletado] = useState(false)
    const [respuestasCrucigrama, setRespuestasCrucigrama] = useState<{[key: string]: string}>({})
    const [pistaActual, setPistaActual] = useState<string | null>(null)

    // Estados para el juego de memoria
    const [memoriaCompletada, setMemoriaCompletada] = useState(false)
    const [cartasVolteadas, setCartasVolteadas] = useState<number[]>([])
    const [cartasEmparejadas, setCartasEmparejadas] = useState<number[]>([])
    const [intentosMemoria, setIntentosMemoria] = useState(0)

    const {
    isMusicPlaying,
    isMuted,
    toggleMusic,
    toggleMute,
    attemptAutoplay,
    enableAudio
  } = useAudio();

    // Sopa de letras (más pequeña 5x5)
    const palabrasSopa = ["CASA", "GATO", "SOL", "MAR"]
    const sopaLetras = [
        ['C', 'A', 'S', 'A', 'X'],
        ['G', 'B', 'O', 'K', 'M'],
        ['A', 'C', 'L', 'A', 'A'],
        ['T', 'D', 'E', 'F', 'R'],
        ['O', 'G', 'H', 'I', 'J']
    ]

    const posicionesPalabras = {
        "CASA": [[0,0], [0,1], [0,2], [0,3]],
        "GATO": [[1,0], [2,0], [3,0], [4,0]],
        "SOL": [[0,2], [1,2], [2,2]],
        "MAR": [[2,4], [3,4], [4,4]]
    }

    // Crucigrama 5x5
    const crucigramaGrid = [
        [1, 0, 2, 0, 0],
        [0, 0, 0, 0, 0],
        [3, 0, 0, 0, 4],
        [0, 0, 0, 0, 0],
        [0, 0, 5, 0, 0]
    ]

    const pistasCrucigrama = {
        "1": { pista: "Animal doméstico que maúlla", respuesta: "GATO", direccion: "horizontal", inicio: [0, 0] },
        "2": { pista: "Estrella que nos da luz", respuesta: "SOL", direccion: "vertical", inicio: [0, 2] },
        "3": { pista: "Donde vivimos", respuesta: "CASA", direccion: "horizontal", inicio: [2, 0] },
        "4": { pista: "Agua salada", respuesta: "MAR", direccion: "vertical", inicio: [2, 4] },
        "5": { pista: "Color del cielo", respuesta: "AZUL", direccion: "horizontal", inicio: [4, 2] }
    }

    // Juego de memoria - parejas de emojis
    const cartasMemoria = [
        "🐱", "🐱", "🏠", "🏠", 
        "☀️", "☀️", "🌊", "🌊",
        "🐶", "🐶", "🌳", "🌳"
    ]

    const [cartasMezcladas, setCartasMezcladas] = useState<string[]>([])

    useEffect(() => {
        // Mezclar cartas al inicio
        const mezcladas = [...cartasMemoria].sort(() => Math.random() - 0.5)
        setCartasMezcladas(mezcladas)
    }, [])

    const reproducirSonido = (texto: string) => {
        if ("speechSynthesis" in window && !isMuted) {
            const utterance = new SpeechSynthesisUtterance(texto)
            utterance.lang = "es-ES"
            utterance.rate = 0.8
            speechSynthesis.speak(utterance)
        }
    }

    

    // Funciones para la sopa de letras
    const handleCeldaMouseDown = (row: number, col: number) => {
        setSeleccionando(true)
        setCeldaInicio([row, col])
        setCeldaFin([row, col])
        setCeldasSeleccionadas([[row, col]])
    }

    const handleCeldaMouseEnter = (row: number, col: number) => {
        if (seleccionando && celdaInicio) {
            setCeldaFin([row, col])
            const nuevasCeldas = getCeldasEnLinea(celdaInicio, [row, col])
            setCeldasSeleccionadas(nuevasCeldas)
        }
    }

    const handleCeldaMouseUp = () => {
        if (seleccionando && celdaInicio && celdaFin) {
            verificarPalabra()
        }
        setSeleccionando(false)
        setCeldaInicio(null)
        setCeldaFin(null)
        setCeldasSeleccionadas([])
    }

    const getCeldasEnLinea = (inicio: [number, number], fin: [number, number]): [number, number][] => {
        const celdas: [number, number][] = []
        const [row1, col1] = inicio
        const [row2, col2] = fin
        
        const deltaRow = row2 - row1
        const deltaCol = col2 - col1
        const pasos = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
        
        if (pasos === 0) return [inicio]
        
        const stepRow = deltaRow / pasos
        const stepCol = deltaCol / pasos
        
        for (let i = 0; i <= pasos; i++) {
            const row = Math.round(row1 + stepRow * i)
            const col = Math.round(col1 + stepCol * i)
            celdas.push([row, col])
        }
        
        return celdas
    }

    const verificarPalabra = () => {
        if (!celdaInicio || !celdaFin) return
        
        const celdas = getCeldasEnLinea(celdaInicio, celdaFin)
        const palabra = celdas.map(([row, col]) => sopaLetras[row][col]).join('')
        const palabraReversa = palabra.split('').reverse().join('')
        
        const palabraEncontrada = palabrasSopa.find(p => p === palabra || p === palabraReversa)
        
        if (palabraEncontrada && !palabrasEncontradas.includes(palabraEncontrada)) {
            setPalabrasEncontradas(prev => [...prev, palabraEncontrada])
            setPalabrasEncontradasPosiciones(prev => [...prev, ...celdas])
            
            if (palabrasEncontradas.length + 1 === palabrasSopa.length) {
                
                    setSopaCompletada(true)
                
            }
        }
    }

    const esCeldaSeleccionada = (row: number, col: number) => {
        return celdasSeleccionadas.some(([r, c]) => r === row && c === col)
    }

    const esCeldaPalabraEncontrada = (row: number, col: number) => {
        return palabrasEncontradasPosiciones.some(([r, c]) => r === row && c === col)
    }

    // Funciones para el crucigrama
    const manejarCambioCrucigrama = (numero: string, valor: string) => {
        setRespuestasCrucigrama(prev => ({
            ...prev,
            [numero]: valor.toUpperCase()
        }))

        // Verificar si está completo
        const todasCompletas = Object.keys(pistasCrucigrama).every(num => {
            const respuesta = respuestasCrucigrama[num] || ""
            return respuesta === pistasCrucigrama[num as keyof typeof pistasCrucigrama].respuesta
        })

        if (todasCompletas && Object.keys(respuestasCrucigrama).length === Object.keys(pistasCrucigrama).length) {
            setCrucigramaCompletado(true)
        }
    }

    // Funciones para el juego de memoria
    const voltearCarta = (indice: number) => {
        if (cartasVolteadas.length === 2 || cartasVolteadas.includes(indice) || cartasEmparejadas.includes(indice)) return

        const nuevasVolteadas = [...cartasVolteadas, indice]
        setCartasVolteadas(nuevasVolteadas)

        if (nuevasVolteadas.length === 2) {
            setIntentosMemoria(prev => prev + 1)
            const [primera, segunda] = nuevasVolteadas
            
            if (cartasMezcladas[primera] === cartasMezcladas[segunda]) {
                // Pareja encontrada
                setTimeout(() => {
                    setCartasEmparejadas(prev => [...prev, primera, segunda])
                    setCartasVolteadas([])
                    
                    if (cartasEmparejadas.length + 2 === cartasMezcladas.length) {
                        setMemoriaCompletada(true)
                        reproducirSonido("¡Increíble! Completaste el juego de memoria")
                    }
                }, 1000)
            } else {
                // No coinciden
                setTimeout(() => {
                    setCartasVolteadas([])
                }, 1000)
            }
        }
    }

    const reiniciarJuegos = () => {
        // Reiniciar sopa
        setPalabrasEncontradas([])
        setPalabrasEncontradasPosiciones([])
        setSopaCompletada(false)
        setSeleccionando(false)
        setCeldaInicio(null)
        setCeldaFin(null)
        setCeldasSeleccionadas([])

        // Reiniciar crucigrama
        setRespuestasCrucigrama({})
        setCrucigramaCompletado(false)
        setPistaActual(null)

        // Reiniciar memoria
        setCartasVolteadas([])
        setCartasEmparejadas([])
        setIntentosMemoria(0)
        setMemoriaCompletada(false)
        const mezcladas = [...cartasMemoria].sort(() => Math.random() - 0.5)
        setCartasMezcladas(mezcladas)
    }

    if (juegoActual === "menu") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 overflow-hidden relative">
                {/* Patrones decorativos */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-6xl animate-bounce">🎮</div>
                    <div className="absolute top-20 right-20 text-5xl animate-pulse">⭐</div>
                    <div className="absolute bottom-20 left-20 text-5xl animate-bounce delay-500">🎯</div>
                    <div className="absolute bottom-10 right-10 text-6xl animate-pulse delay-300">🏆</div>
                </div>

                <div className="container mx-auto px-4 py-8 relative z-10">
                    <header className="p-4 flex justify-between items-center mb-8">
                        <button
                            onClick={() => window.history.back()}
                            className="cursor-pointer flex items-center gap-2 bg-white/90 backdrop-blur-sm text-purple-800 px-4 py-2 rounded-full hover:bg-white transition-colors shadow-lg border-2 border-purple-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-bold">Volver</span>
                        </button>

                        <h1 className="text-3xl md:text-4xl font-bold text-center text-white drop-shadow-lg">
                            🎮 Centro de Juegos Educativos ⭐
                        </h1>

                        <div className="flex items-center gap-2">
                            <div className="text-3xl bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border-2 border-purple-300">{selectedAvatar}</div>
                            <button
                                onClick={toggleMute}
                                className="cursor-pointer p-3 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
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

                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto border-4 border-white/50">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-purple-800 mb-4">¡Elige tu aventura!</h2>
                            <p className="text-xl text-purple-600 mb-8">Selecciona el juego que más te guste</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Sopa de Letras */}
                            <div 
                                onClick={() => setJuegoActual("sopa")}
                                className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl border-4 border-white/30 hover:shadow-2xl"
                            >
                                <div className="text-center">
                                    <div className="text-6xl mb-4 animate-bounce">🔍</div>
                                    <h3 className="text-2xl font-bold mb-2">Sopa de Letras</h3>
                                    <p className="text-blue-100">Encuentra las palabras escondidas</p>
                                    <div className="mt-4 bg-white/20 rounded-lg p-2">
                                        <span className="text-sm">🎯 4 palabras por encontrar</span>
                                    </div>
                                </div>
                            </div>

                            

                            {/* Juego de Memoria */}
                            <div 
                                onClick={() => setJuegoActual("memoria")}
                                className="bg-gradient-to-br from-pink-400 to-pink-600 p-6 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-xl border-4 border-white/30 hover:shadow-2xl"
                            >
                                <div className="text-center">
                                    <div className="text-6xl mb-4 animate-bounce">🧠</div>
                                    <h3 className="text-2xl font-bold mb-2">Juego de Memoria</h3>
                                    <p className="text-pink-100">Encuentra las parejas iguales</p>
                                    <div className="mt-4 bg-white/20 rounded-lg p-2">
                                        <span className="text-sm">🎴 6 parejas por encontrar</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 overflow-hidden relative">
            {/* Patrones decorativos */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-4xl animate-bounce">🎮</div>
                <div className="absolute top-20 right-20 text-3xl animate-pulse">✨</div>
                <div className="absolute bottom-20 left-20 text-3xl animate-bounce delay-500">🎯</div>
                <div className="absolute bottom-10 right-10 text-4xl animate-pulse delay-300">⭐</div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                <header className="p-4 flex justify-between items-center mb-6">
                    <button
                        onClick={() => setJuegoActual("menu")}
                        className="cursor-pointer flex items-center gap-2 bg-white/90 backdrop-blur-sm text-purple-800 px-4 py-2 rounded-full hover:bg-white transition-colors shadow-lg border-2 border-purple-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-bold">Menú</span>
                    </button>

                    <h1 className="text-2xl md:text-3xl font-bold text-center text-white drop-shadow-lg">
                        {juegoActual === "sopa" && "🔍 Sopa de Letras"}
                        {juegoActual === "memoria" && "🧠 Juego de Memoria"}
                    </h1>

                    <div className="flex items-center gap-2">
                            <div className="text-3xl bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border-2 border-purple-300">{selectedAvatar}</div>
                            <button
                                onClick={toggleMute}
                                className="cursor-pointer p-3 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
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

                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl max-w-4xl mx-auto border-4 border-white/50">
                    {/* SOPA DE LETRAS */}
                    {juegoActual === "sopa" && (
                        <div className="text-center">
                            {!sopaCompletada ? (
                                <>
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 mb-6 text-white">
                                        <h2 className="text-2xl font-bold mb-2">🔍 Detective de Palabras</h2>
                                        <p className="mb-2">¡Encuentra las 4 palabras escondidas!</p>
                                        <div className="text-sm">Encontradas: {palabrasEncontradas.length}/4</div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                                        {/* Sopa más pequeña */}
                                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-2xl shadow-xl border-4 border-blue-300"
                                            onMouseLeave={handleCeldaMouseUp}
                                        >
                                            <div className="grid grid-cols-5 gap-1 mx-auto w-max">
                                                {sopaLetras.flatMap((fila, rowIndex) =>
                                                    fila.map((letra, colIndex) => (
                                                        <div
                                                            key={`${rowIndex}-${colIndex}`}
                                                            className={`w-10 h-10 flex items-center justify-center font-bold text-lg rounded-lg transition-all duration-200 select-none cursor-pointer transform hover:scale-110 shadow-md border-2
                                                                ${esCeldaPalabraEncontrada(rowIndex, colIndex)
                                                                    ? "bg-gradient-to-br from-green-400 to-green-500 text-white border-green-300"
                                                                    : esCeldaSeleccionada(rowIndex, colIndex)
                                                                        ? "bg-gradient-to-br from-yellow-300 to-yellow-400 text-purple-800 border-yellow-200"
                                                                        : "bg-gradient-to-br from-white to-blue-50 text-purple-800 border-blue-200"
                                                                }`}
                                                            onMouseDown={() => handleCeldaMouseDown(rowIndex, colIndex)}
                                                            onMouseEnter={() => handleCeldaMouseEnter(rowIndex, colIndex)}
                                                            onMouseUp={handleCeldaMouseUp}
                                                        >
                                                            {letra}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Lista de palabras */}
                                        <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-2xl shadow-xl border-4 border-pink-300 min-w-60">
                                            <h3 className="text-xl font-bold text-purple-800 mb-3">Palabras a encontrar:</h3>
                                            <div className="space-y-2">
                                                {[
                                                    { palabra: "CASA", emoji: "🏠" },
                                                    { palabra: "GATO", emoji: "🐱" },
                                                    { palabra: "SOL", emoji: "☀️" },
                                                    { palabra: "MAR", emoji: "🌊" }
                                                ].map(({ palabra, emoji }) => (
                                                    <div
                                                        key={palabra}
                                                        className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-between ${
                                                            palabrasEncontradas.includes(palabra)
                                                                ? "bg-green-400 text-white line-through"
                                                                : "bg-white text-purple-800"
                                                        }`}
                                                    >
                                                        <span>{palabra}</span>
                                                        <span className="text-lg">{emoji}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                                    <h2 className="text-3xl font-bold text-purple-800 mb-4">¡Excelente trabajo!</h2>
                                    <p className="text-xl text-purple-600 mb-6">Encontraste todas las palabras</p>
                                    <button
                                        onClick={() => {
                                            setPalabrasEncontradas([])
                                            setPalabrasEncontradasPosiciones([])
                                            setSopaCompletada(false)
                                        }}
                                        className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                                    >
                                        Jugar de nuevo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    

                    {/* JUEGO DE MEMORIA */}
                    {juegoActual === "memoria" && (
                        <div className="text-center">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-4 mb-6 text-white">
                                <h2 className="text-2xl font-bold mb-2">🧠 Juego de Memoria</h2>
                                <p>¡Encuentra las parejas iguales!</p>
                                <div className="mt-2 text-sm">
                                    Intentos: {intentosMemoria} | Parejas: {cartasEmparejadas.length / 2}/6
                                </div>
                            </div>

                            {!memoriaCompletada ? (
                                <div className="max-w-md mx-auto">
                                    <div className="grid grid-cols-4 gap-3">
                                        {cartasMezcladas.map((carta, indice) => (
                                            <div
                                                key={indice}
                                                onClick={() => voltearCarta(indice)}
                                                className={`w-16 h-16 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-2xl font-bold border-4 ${
                                                    cartasVolteadas.includes(indice) || cartasEmparejadas.includes(indice)
                                                        ? "bg-white border-pink-300 shadow-lg"
                                                        : "bg-gradient-to-br from-pink-400 to-purple-500 border-pink-300 hover:from-pink-500 hover:to-purple-600"
                                                }`}
                                            >
                                                {cartasVolteadas.includes(indice) || cartasEmparejadas.includes(indice) ? (
                                                    <span className={cartasEmparejadas.includes(indice) ? "animate-pulse" : ""}>
                                                        {carta}
                                                    </span>
                                                ) : (
                                                    <span className="text-white">?</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-6xl mb-4 animate-bounce">🎊</div>
                                    <h2 className="text-3xl font-bold text-pink-800 mb-4">¡Memoria increíble!</h2>
                                    <p className="text-xl text-pink-600 mb-2">Encontraste todas las parejas</p>
                                    <p className="text-lg text-pink-500 mb-6">en solo {intentosMemoria} intentos</p>
                                    <button
                                        onClick={() => {
                                            setCartasVolteadas([])
                                            setCartasEmparejadas([])
                                            setIntentosMemoria(0)
                                            setMemoriaCompletada(false)
                                            const mezcladas = [...cartasMemoria].sort(() => Math.random() - 0.5)
                                            setCartasMezcladas(mezcladas)
                                        }}
                                        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                                    >
                                        Jugar de nuevo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}