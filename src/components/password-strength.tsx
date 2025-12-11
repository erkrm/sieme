'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0)
  const [feedback, setFeedback] = useState<string[]>([])

  useEffect(() => {
    calculateStrength()
  }, [password])

  const calculateStrength = () => {
    let score = 0
    const checks: string[] = []

    // Length check
    if (password.length >= 8) {
      score += 20
      checks.push('8+ caracteres')
    }
    if (password.length >= 12) {
      score += 10
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 20
      checks.push('Mayúsculas')
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 20
      checks.push('Minúsculas')
    }

    // Number check
    if (/[0-9]/.test(password)) {
      score += 20
      checks.push('Números')
    }

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 20
      checks.push('Caracteres especiales')
    }

    setStrength(Math.min(score, 100))
    setFeedback(checks)
  }

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500'
    if (strength < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (strength < 40) return 'Débil'
    if (strength < 70) return 'Media'
    return 'Fuerte'
  }

  if (!password) return null

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600 min-w-[50px]">{getStrengthText()}</span>
      </div>

      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
          {password.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>8+ caracteres</span>
        </div>
        <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
          {/[A-Z]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>Mayúsculas</span>
        </div>
        <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
          {/[a-z]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>Minúsculas</span>
        </div>
        <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
          {/[0-9]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>Números</span>
        </div>
        <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
          {/[^A-Za-z0-9]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          <span>Especiales (!@#$)</span>
        </div>
      </div>
    </div>
  )
}
