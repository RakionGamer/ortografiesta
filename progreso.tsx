"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Star, Trophy, Medal, Target, Zap, BookOpen, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import useProgress, { type ActivityType } from "./app/hooks/useProgress"

export default function Progreso() {
  const router = useRouter()
  const { progress, loading, resetProgress } = useProgress()
  const [selectedAvatar, setSelectedAvatar] = useState("🐱")
  const [seccionActiva, setSeccionActiva] = useState<"medallas" | "unidades">("medallas")
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    const savedAvatar = localStorage.getItem("ortografia-avatar")
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar)
    }
  }, [])

  const volverAlInicio = () => {
    router.push("/")
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible"

    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getActivityName = (activityType: ActivityType, unitId: string) => {
    if (unitId === "unidad2") {
        switch (activityType) {
            case "diferencias": return "Reglas de Mayúsculas";
            case "completar": return "Completar Oraciones";
            case "dictado": return "Corregir Textos";
            case "sopa": return "Sopa de Nombres";
            default: return activityType;
        }
    }

  
    switch (activityType) {
        case "diferencias": return "Diferencias B/V, C/S/Z, G/J";
        case "completar": return "Completar Palabras";
        case "dictado": return "Dictado Interactivo";
        case "sopa": return "Sopa de Letras";
        default: return activityType;
    }
}



  // Calcular tiempo desde la última vez que se jugó
  const getLastPlayedText = () => {
    if (!progress?.lastPlayedAt) return "Nunca"

    const lastPlayed = new Date(progress.lastPlayedAt)
    const now = new Date()
    const diffMs = now.getTime() - lastPlayed.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `Hace ${diffMinutes} minutos`
      }
      return `Hace ${diffHours} horas`
    } else if (diffDays === 1) {
      return "Ayer"
    } else {
      return `Hace ${diffDays} días`
    }
  }

  // Calcular el tiempo total de juego (simulado)
  const getTotalPlayTime = () => {
    if (!progress) return "0h 0m"

    // Simulamos el tiempo basado en los intentos totales (5 minutos por intento)
    let totalAttempts = 0
    Object.values(progress.units).forEach((unit) => {
      Object.values(unit.activities).forEach((activity) => {
        totalAttempts += activity.attempts
      })
    })

    const totalMinutes = totalAttempts * 5
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-200 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="animate-spin text-5xl mb-4">⏳</div>
            <p className="text-xl font-bold text-purple-800">Cargando tu progreso...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-200 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-xl font-bold text-purple-800 mb-4">No se pudo cargar tu progreso</p>
            <button
              onClick={volverAlInicio}
              className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-yellow-200 overflow-hidden relative">


     

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Encabezado */}
        <header className="mb-8 flex flex-col md:flex-row gap-4 md:items-center justify-between relative">
          <div className="flex items-center justify-between w-full md:w-auto">
            <button
              onClick={volverAlInicio}
              className="cursor-pointer flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
            >
              <ArrowLeft size={20} className="shrink-0" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            {/* Puntos - Versión móvil */}
            <div className="md:hidden bg-white/80 rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-purple-800">{progress.totalPoints}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-800 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            Mi Progreso
          </h1>

          <div className="flex items-center justify-end gap-4 md:gap-6 w-full md:w-auto">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="cursor-pointer flex items-center gap-2 bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors shadow-md hover:shadow-lg text-sm md:text-base"
            >
              <span className="hidden sm:inline">Reiniciar Progreso</span>
              <span className="sm:hidden">Reiniciar</span>
            </button>

            {/* Puntos - Versión desktop */}
            <div className="hidden md:flex bg-white/80 rounded-full px-4 py-2 items-center gap-2 shadow-sm backdrop-blur-sm">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <div className="flex flex-col">
                <span className="font-bold text-purple-800 text-lg leading-tight">{progress.totalPoints}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tarjeta de resumen */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-lg max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar grande */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-5xl mb-2">
                {selectedAvatar}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-purple-800">Estudiante</h2>
                <p className="text-purple-600">Nivel {Math.floor(progress.totalPoints / 100) + 1}</p>
              </div>
            </div>

            {/* Estadísticas principales */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-purple-100 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-purple-600">Puntos</p>
                <p className="text-xl font-bold text-purple-800">{progress.totalPoints}</p>
              </div>

              <div className="bg-teal-100 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">
                  <Medal className="w-6 h-6 text-teal-600" />
                </div>
                <p className="text-sm text-teal-600 cursor-pointer">Medallas</p>
                <p className="text-xl font-bold text-teal-800">
                  {progress.medals.filter((m) => m.unlocked).length}/{progress.medals.length}
                </p>
              </div>

              <div className="bg-orange-100 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm text-orange-600">Actividades</p>
                <p className="text-xl font-bold text-orange-800">
                  {
                    Object.values(progress.units)
                      .flatMap((unit) => Object.values(unit.activities))
                      .filter((activity) => activity.completed).length
                  }
                  /24
                </p>
              </div>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-purple-800 mb-1">
              <span>Progreso general</span>
              <span>
                {Math.round(
                  Object.values(progress.units).reduce((acc, unit) => acc + unit.completionPercentage, 0) / 6,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                style={{
                  width: `${Object.values(progress.units).reduce((acc, unit) => acc + unit.completionPercentage, 0) / 6
                    }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/60 rounded-full p-1 flex">
            <button
              onClick={() => setSeccionActiva("medallas")}
              className={`px-4 py-2 rounded-full font-bold transition-colors cursor-pointer ${seccionActiva === "medallas" ? "bg-purple-600 text-white" : "text-purple-800 hover:bg-purple-100"
                }`}
            >
              Medallas
            </button>
            <button
              onClick={() => setSeccionActiva("unidades")}
              className={`px-4 py-2 rounded-full font-bold transition-colors cursor-pointer ${seccionActiva === "unidades" ? "bg-teal-500 text-white" : "text-teal-800 hover:bg-teal-100"
                }`}
            >
              Unidades
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-lg max-w-4xl mx-auto">
          {/* Sección de Medallas */}
          {seccionActiva === "medallas" && (
            <div>
              <h2 className="text-2xl font-bold text-purple-800 mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                Mis Medallas
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {progress.medals.map((medalla) => (
                  <div
                    key={medalla.id}
                    className={`rounded-xl p-4 text-center transition-all ${medalla.unlocked ? "bg-gradient-to-b from-yellow-100 to-yellow-200" : "bg-gray-100 opacity-70"
                      }`}
                  >
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-2 ${medalla.unlocked ? "bg-yellow-300" : "bg-gray-300"
                        }`}
                    >
                      {medalla.unlocked ? medalla.icon : "?"}
                    </div>
                    <h3 className="font-bold text-purple-800">{medalla.name}</h3>
                    <p className="text-xs text-purple-600 mt-1">{medalla.description}</p>
                    {medalla.unlocked && medalla.unlockedAt && (
                      <p className="text-xs text-purple-500 mt-2">Conseguida: {formatDate(medalla.unlockedAt)}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-purple-100 rounded-xl p-4">
                <h3 className="font-bold text-purple-800 mb-2">Próximas medallas</h3>
                <ul className="space-y-2">
                  {progress.medals
                    .filter((m) => !m.unlocked)
                    .slice(0, 3)
                    .map((medalla) => (
                      <li key={medalla.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-lg">
                          {medalla.icon}
                        </div>
                        <div>
                          <p className="font-medium text-purple-800">{medalla.name}</p>
                          <p className="text-xs text-purple-600">{medalla.description}</p>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {/* Sección de Unidades */}
          {seccionActiva === "unidades" && (
            <div>
              <h2 className="text-2xl font-bold text-teal-800 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-teal-500" />
                Progreso por Unidades
              </h2>

              <div className="space-y-6">
                {Object.entries(progress.units).map(([unitId, unit]) => (
                  <div key={unitId} className="bg-teal-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-teal-800">
                        Unidad {unit.id}: {unit.name}
                      </h3>
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < unit.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-teal-800 mb-1">
                        <span>Progreso</span>
                        <span>{Math.round(unit.completionPercentage)}%</span>
                      </div>
                      <div className="w-full bg-teal-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-teal-500 h-2.5 rounded-full"
                          style={{ width: `${unit.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                      {Object.entries(unit.activities).map(([activityType, activity]) => {
                        const activityName = getActivityName(activityType as ActivityType, unitId)
                      
                        return (
                          <div
                            key={activityType}
                            className={`flex items-center gap-2 p-2 rounded-lg ${activity.completed ? "bg-teal-100" : "bg-gray-100"
                              }`}
                          >
                            {activity.completed ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                            )}
                            <span className="text-sm font-bold text-teal-800">{activityName}</span>
                            {activity.attempts > 0 && (
                              <span className="ml-auto text-xs font-bold text-teal-700">{activity.lastScore}%</span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {unit.unlockedAt && (
                      <div className="mt-2 text-xs text-teal-600">Desbloqueada: {formatDate(unit.unlockedAt)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para resetear progreso */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">¿Resetear todo el progreso?</h3>
            <p className="text-gray-700 mb-6">
              Esta acción eliminará todo tu progreso, medallas y puntos. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetProgress()
                  setShowResetConfirm(false)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                Resetear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
