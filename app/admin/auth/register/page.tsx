"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, User, Mail, Lock, Loader2, UserPlus, Shield } from "lucide-react"

interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

interface RegisterError {
  message: string
  type?: 'error' | 'warning' | 'info'
}

export default function AdminRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<RegisterError | null>(null)
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Check password strength
    if (name === 'password') {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      })
    }

    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError({ message: 'Passwords do not match', type: 'error' })
      setLoading(false)
      return
    }

    const isPasswordStrong = Object.values(passwordStrength).every(Boolean)
    if (!isPasswordStrong) {
      setError({ message: 'Password does not meet the security requirements', type: 'error' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to OTP verification page
        const queryParams = new URLSearchParams({
          email: data.data.email,
          purpose: 'email_verification',
          firstName: data.data.firstName,
        })
        router.push(`/admin/auth/verify-otp?${queryParams}`)
      } else {
        setError({ 
          message: data.message,
          type: response.status === 429 ? 'warning' : 'error'
        })
      }
    } catch (error) {
      setError({ 
        message: 'Network error. Please check your connection and try again.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.firstName && 
                     formData.lastName && 
                     formData.email && 
                     formData.password && 
                     formData.confirmPassword && 
                     formData.role &&
                     formData.password === formData.confirmPassword &&
                     Object.values(passwordStrength).every(Boolean)

  const getStrengthIndicatorColor = (condition: boolean) => 
    condition ? 'text-green-600' : 'text-red-500'

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary via-secondary to-accent rounded-full flex items-center justify-center shadow-lg">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Create Admin Account
        </CardTitle>
        <CardDescription className="text-gray-600">
          Join the D-lighter Tutor admin team
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant={error.type === 'error' ? 'destructive' : 'default'} className="mb-4">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-semibold text-gray-800">
                First Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-semibold text-gray-800">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                className="pl-10 h-12 bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-800">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john.doe@d-lightertutor.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-semibold text-gray-800">
              Role
            </Label>
            <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
              <SelectTrigger className="h-12 bg-white border-2 border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-800">
              Password
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12 bg-white border-2 border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {formData.password && (
              <div className="mt-2 space-y-1 text-xs">
                <div className={getStrengthIndicatorColor(passwordStrength.hasMinLength)}>
                  ✓ At least 8 characters
                </div>
                <div className={getStrengthIndicatorColor(passwordStrength.hasUpperCase)}>
                  ✓ One uppercase letter
                </div>
                <div className={getStrengthIndicatorColor(passwordStrength.hasLowerCase)}>
                  ✓ One lowercase letter
                </div>
                <div className={getStrengthIndicatorColor(passwordStrength.hasNumber)}>
                  ✓ One number
                </div>
                <div className={getStrengthIndicatorColor(passwordStrength.hasSpecialChar)}>
                  ✓ One special character
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-800">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12 bg-white border-2 border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full h-12 bg-gradient-to-r from-secondary via-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an admin account?{" "}
            <Link
              href="/admin/auth/login"
              className="text-secondary hover:text-secondary/80 font-semibold hover:underline transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>Maximum 4 admin accounts allowed</span>
        </div>
      </CardFooter>
    </Card>
  )
}