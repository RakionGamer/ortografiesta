"use client"

import { useState, useEffect } from "react"

// Tipos para el sistema de progreso
export type ActivityType = "diferencias" | "completar" | "dictado" | "sopa"



type PenaltyReason = 'too_many_errors' | 'timeout' | 'hint_used'


export interface ActivityProgress {
  attempts: number
  lastScore: number
  completed: boolean
  stars: number,
  errors: number
  lastCompletedAt?: string
}

export interface UnitProgress {
  id: number
  name: string
  activities: Record<ActivityType, ActivityProgress>
  completionPercentage: number
  stars: number
  unlockedAt?: string,
  unlocked: boolean // Nueva propiedad
}

export interface Medal {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export interface UserProgress {

  activities: UserProgress | null
  totalPoints: number
  totalStars: number
  streak: number
  lastPlayedAt?: string
  units: Record<string, UnitProgress>
  medals: Medal[]
}

// Medallas disponibles en el sistema
const availableMedals: Medal[] = [
  {
    id: "first_activity",
    name: "¡Primera Actividad!",
    description: "Completaste tu primera actividad",
    icon: "🏆",
    unlocked: false,
  },
  {
    id: "unit1_complete",
    name: "Unidad 1 Completada",
    description: "Completaste todas las actividades de la Unidad 1",
    icon: "📚",
    unlocked: false,
  },
  {
    id: "perfect_score",
    name: "Puntuación Perfecta",
    description: "Obtuviste 100% en una actividad",
    icon: "💯",
    unlocked: false,
  },
  {
    id: "three_stars",
    name: "Tres Estrellas",
    description: "Conseguiste 3 estrellas en una actividad",
    icon: "⭐",
    unlocked: false,
  },
  {
    id: "streak_3",
    name: "Racha de 3 días",
    description: "Has practicado durante 3 días seguidos",
    icon: "🔥",
    unlocked: false,
  },
  {
    id: "points_500",
    name: "500 Puntos",
    description: "Acumulaste 500 puntos en total",
    icon: "🎮",
    unlocked: false,
  },
  {
    id: "all_activities",
    name: "Explorador",
    description: "Probaste todas las actividades disponibles",
    icon: "🧭",
    unlocked: false,
  },
  {
    id: "word_master",
    name: "Maestro de Palabras",
    description: "Completaste el dictado con 90% o más de aciertos",
    icon: "🎤",
    unlocked: false,
  },
]

// Estructura inicial para una unidad
const createInitialUnitProgress = (id: number, name: string): UnitProgress => ({
  id,
  name,
  activities: {
    diferencias: {
      attempts: 0, lastScore: 0, completed: false, stars: 0,
      errors: 0
    },
    completar: {
      attempts: 0, lastScore: 0, completed: false, stars: 0,
      errors: 0
    },
    dictado: {
      attempts: 0, lastScore: 0, completed: false, stars: 0,
      errors: 0
    },
    sopa: {
      attempts: 0, lastScore: 0, completed: false, stars: 0,
      errors: 0
    },
  },

  completionPercentage: 0,
  stars: 0,
  unlockedAt: id === 1 ? new Date().toISOString() : undefined,
  unlocked: id === 1,
})

// Progreso inicial del usuario
const initialProgress: UserProgress = {
  totalPoints: 0,
  totalStars: 0,
  streak: 0,
  units: {
    unidad1: createInitialUnitProgress(1, "Sonidos y Letras"),
    unidad2: createInitialUnitProgress(2, "Uso de Mayúsculas"),
    unidad3: createInitialUnitProgress(3, "Reglas de Acentuación"),
    unidad4: createInitialUnitProgress(4, "Palabras Homófonas"),
  },
  medals: availableMedals,
  activities: null
}

export default function useProgress(unitId?: string) {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar progreso desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProgress = localStorage.getItem("ortografiesta-progress")

      if (savedProgress) {
        try {
          setProgress(JSON.parse(savedProgress))
        } catch (e) {
          console.error("Error al cargar el progreso:", e)
          setProgress(initialProgress)
        }
      } else {
        setProgress(initialProgress)
      }

      setLoading(false)
    }
  }, [])

  // Guardar progreso en localStorage cuando cambie
  useEffect(() => {
    if (progress && typeof window !== "undefined") {
      localStorage.setItem("ortografiesta-progress", JSON.stringify(progress))
    }
  }, [progress])

  // Actualizar el progreso de una actividad
  const updateActivity = (activityType: ActivityType, activityProgress: Partial<ActivityProgress>, penalty?: { reason: PenaltyReason; amount: number }) => {
    if (!progress || !unitId) return

    setProgress((prevProgress) => {
      if (!prevProgress) return null




      // Crear una copia profunda del progreso actual
      const newProgress = JSON.parse(JSON.stringify(prevProgress)) as UserProgress

      // Actualizar la actividad específica
      const unit = newProgress.units[unitId]
      if (!unit) return prevProgress

      // Asegurar que la actividad existe
      if (!unit.activities[activityType]) {
        unit.activities[activityType] = {
          attempts: 0,
          lastScore: 0,
          completed: false,
          stars: 0,
          errors: 0
        }
      }

      const currentActivity = unit.activities[activityType]
      // Calcular puntos a añadir (ahora cada actividad vale 50 puntos)
      let pointsToAdd = 0

      // SOLUCIÓN: Verificar si currentActivity existe antes de acceder a sus propiedades
      if (activityProgress.lastScore !== undefined && currentActivity) {
        // Si es la primera vez o si mejora la puntuación anterior
        const isFirstAttempt = currentActivity.attempts === 0
        const isImprovement = activityProgress.lastScore > currentActivity.lastScore

        if (isFirstAttempt || isImprovement) {
          // Calcular puntos basados en el porcentaje de éxito (máximo 50 puntos por actividad)
          const maxPoints = 50
          const earnedPoints = Math.round((activityProgress.lastScore / 100) * maxPoints)

          // Si es una mejora, añadir solo la diferencia
          if (currentActivity.completed) {
            const previousPoints = Math.round((currentActivity.lastScore / 100) * maxPoints)
            pointsToAdd = earnedPoints - previousPoints
          } else {
            // Si es la primera vez, añadir todos los puntos
            pointsToAdd = earnedPoints
          }

          // Asegurarse de que siempre se añadan al menos los puntos de la actividad actual
          if (pointsToAdd <= 0 && activityProgress.completed) {
            pointsToAdd = earnedPoints
          }
        }
      }

      // Calcular estrellas basadas en el porcentaje de éxito
      // Si hay muchos errores (menos del 60%), se reduce a 0 estrellas
      let stars = 0
      if (activityProgress.lastScore !== undefined) {
        if (activityProgress.lastScore >= 90) {
          stars = 1 // Una estrella por actividad completada con éxito
        } else if (activityProgress.lastScore >= 60) {
          stars = 1 // Mantener una estrella si el rendimiento es aceptable
        } else {
          stars = 0 // Quitar la estrella si hay muchos errores
        }
      }

      if (penalty) {
        switch (penalty.reason) {
          case 'too_many_errors':
            pointsToAdd = -penalty.amount
            // Quitar estrella si corresponde
            if (currentActivity.stars > 0) {
              stars = Math.max(currentActivity.stars - 1, 0)
            }
            break
          // Puedes añadir más casos de penalización
        }
      }

      // Asegurar que los puntos no sean negativos
      newProgress.totalPoints = Math.max(newProgress.totalPoints + pointsToAdd, 0)

      // Actualizar los campos de la actividad
      const updatedActivity = {
        ...currentActivity,
        ...activityProgress,
        stars: stars,
        lastCompletedAt: activityProgress.completed ? new Date().toISOString() : currentActivity.lastCompletedAt,
      }

      unit.activities[activityType] = updatedActivity

      // Recalcular el porcentaje de completado de la unidad
      const completedActivities = Object.values(unit.activities).filter((a) => a.completed).length
      unit.completionPercentage = (completedActivities / 4) * 100

      // Recalcular las estrellas de la unidad (ahora es la suma de las estrellas de cada actividad)
      unit.stars = Object.values(unit.activities).reduce((sum, a) => sum + a.stars, 0)

      // Actualizar puntos totales
      newProgress.totalPoints += pointsToAdd

      // Actualizar estrellas totales
      newProgress.totalStars = Object.values(newProgress.units).reduce((sum, u) => sum + u.stars, 0)

      // Actualizar fecha de último juego
      newProgress.lastPlayedAt = new Date().toISOString()

      // Verificar y actualizar racha
      const today = new Date().toDateString()
      const lastPlayed = newProgress.lastPlayedAt ? new Date(newProgress.lastPlayedAt).toDateString() : null

      if (lastPlayed && lastPlayed !== today) {
        const dayDiff = Math.floor((new Date().getTime() - new Date(lastPlayed).getTime()) / (1000 * 3600 * 24))
        if (dayDiff === 1) {
          newProgress.streak += 1
        } else if (dayDiff > 1) {
          newProgress.streak = 1
        }
      }

      


      checkAndUnlockMedals(newProgress, unitId, activityType, updatedActivity)

      return newProgress
    })
  }

  // Verificar y desbloquear medallas según los logros
  const checkAndUnlockMedals = (
    progress: UserProgress,
    unitId: string,
    activityType: ActivityType,
    activity: ActivityProgress,
  ) => {
    const medals = progress.medals
    const now = new Date().toISOString()

    // Primera actividad completada
    if (activity.completed) {
      const firstActivityMedal = medals.find((m) => m.id === "first_activity")
      if (firstActivityMedal && !firstActivityMedal.unlocked) {
        firstActivityMedal.unlocked = true
        firstActivityMedal.unlockedAt = now
      }
    }

    // Unidad 1 completada
    if (unitId === "unidad1") {
      const unit = progress.units[unitId]
      const allCompleted = Object.values(unit.activities).every((a) => a.completed)

      if (allCompleted) {
        const unitCompleteMedal = medals.find((m) => m.id === "unit1_complete")
        if (unitCompleteMedal && !unitCompleteMedal.unlocked) {
          unitCompleteMedal.unlocked = true
          unitCompleteMedal.unlockedAt = now
        }
      }
    }

    // Puntuación perfecta
    if (activity.lastScore === 100) {
      const perfectScoreMedal = medals.find((m) => m.id === "perfect_score")
      if (perfectScoreMedal && !perfectScoreMedal.unlocked) {
        perfectScoreMedal.unlocked = true
        perfectScoreMedal.unlockedAt = now
      }
    }

    // Tres estrellas en una actividad
    if (activity.stars === 3) {
      const threeStarsMedal = medals.find((m) => m.id === "three_stars")
      if (threeStarsMedal && !threeStarsMedal.unlocked) {
        threeStarsMedal.unlocked = true
        threeStarsMedal.unlockedAt = now
      }
    }

    // Racha de 3 días
    if (progress.streak >= 3) {
      const streakMedal = medals.find((m) => m.id === "streak_3")
      if (streakMedal && !streakMedal.unlocked) {
        streakMedal.unlocked = true
        streakMedal.unlockedAt = now
      }
    }

    // 500 puntos
    if (progress.totalPoints >= 500) {
      const pointsMedal = medals.find((m) => m.id === "points_500")
      if (pointsMedal && !pointsMedal.unlocked) {
        pointsMedal.unlocked = true
        pointsMedal.unlockedAt = now
      }
    }

    // Todas las actividades probadas
    const unit = progress.units[unitId]
    const allAttempted = Object.values(unit.activities).every((a) => a.attempts > 0)

    if (allAttempted) {
      const allActivitiesMedal = medals.find((m) => m.id === "all_activities")
      if (allActivitiesMedal && !allActivitiesMedal.unlocked) {
        allActivitiesMedal.unlocked = true
        allActivitiesMedal.unlockedAt = now
      }
    }

    // Maestro de palabras (dictado con 90% o más)
    if (unitId === "unidad1" && activityType === "dictado" && activity.lastScore >= 90) {
      const wordMasterMedal = medals.find((m) => m.id === "word_master")
      if (wordMasterMedal && !wordMasterMedal.unlocked) {
        wordMasterMedal.unlocked = true
        wordMasterMedal.unlockedAt = now
      }
    }
  }

  // Añadir puntos manualmente (para casos especiales)
  const addPoints = (points: number) => {
    if (!progress) return

    setProgress((prevProgress) => {
      if (!prevProgress) return null

      return {
        ...prevProgress,
        totalPoints: prevProgress.totalPoints + points,
        lastPlayedAt: new Date().toISOString(),
      }
    })
  }

  const resetProgress = () => {
    setProgress(initialProgress)
    if (typeof window !== "undefined") {
      localStorage.setItem("ortografiesta-progress", JSON.stringify(initialProgress))
      window.location.href = '/'
    }
  }

useEffect(() => {
  if (!progress) return;

  Object.values(progress.units).forEach((unit) => {
    const completedActivities = Object.values(unit.activities).filter((a) => a.completed).length;

    if (completedActivities === 4 && unit.id < 5) {
      const nextUnitId = `unidad${unit.id + 1}`;
      const nextUnit = progress.units[nextUnitId];
      if (nextUnit && !nextUnit.unlocked) {
        nextUnit.unlocked = true;
        nextUnit.unlockedAt = new Date().toISOString();
        console.log(`Unidad ${nextUnit.name} desbloqueada automáticamente (verificación en efecto).`);
        setProgress({ ...progress }); // Fuerza actualización
      }
    }
  });
}, [progress]);




  return {
    progress,
    loading,
    updateActivity,
    addPoints,
    resetProgress,
  }
}
