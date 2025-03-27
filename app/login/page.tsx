import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-12 px-4">
      <div className="container max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gradient">ELD Trip Planner</h1>
        <LoginForm />
      </div>
    </main>
  )
}

