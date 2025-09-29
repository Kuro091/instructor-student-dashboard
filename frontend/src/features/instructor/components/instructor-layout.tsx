import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/stores/auth-context'
import { routes } from '@/app/routes'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageSquare, 
  LogOut, 
  Menu
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: routes.instructor.dashboard, icon: LayoutDashboard },
  { name: 'Students', href: routes.instructor.students, icon: Users },
  { name: 'Lessons', href: routes.instructor.lessons, icon: BookOpen },
  { name: 'Messages', href: routes.chat.list, icon: MessageSquare },
]

export function InstructorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate(routes.login)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="bg-gray-50 min-h-screen">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center px-6 h-16">
                <h1 className="font-bold text-primary text-xl">Classroom</h1>
              </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => {
                      navigate(item.href)
                      setSidebarOpen(false)
                    }}
                  >
                    <item.icon className="mr-3 w-5 h-5" />
                    {item.name}
                  </Button>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${desktopSidebarOpen ? 'lg:w-64' : 'lg:w-16'}`}>
        <div className="flex flex-col flex-grow bg-white border-gray-200 border-r overflow-y-auto">
          <div className="flex justify-between items-center px-4 h-16">
            {desktopSidebarOpen && <h1 className="font-bold text-primary text-xl">Classroom</h1>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
              className="lg:block"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full ${desktopSidebarOpen ? 'justify-start' : 'justify-center'}`}
                  onClick={() => navigate(item.href)}
                  title={!desktopSidebarOpen ? item.name : undefined}
                >
                  <item.icon className={`w-5 h-5 ${desktopSidebarOpen ? 'mr-3' : ''}`} />
                  {desktopSidebarOpen && item.name}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>

      <div className={`flex-1 transition-all duration-300 ${desktopSidebarOpen ? 'lg:pl-64' : 'lg:pl-16'}`}>
        <div className="top-0 z-40 sticky flex justify-between items-center bg-white shadow-sm px-4 sm:px-6 lg:px-8 border-gray-200 border-b h-16 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>

          <div className="flex-1"></div>

          <Card className="hidden lg:block">
            <CardContent className="flex items-center gap-x-3 px-4 py-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                <p className="text-gray-500 text-xs">Instructor</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <main className="bg-white py-6 min-h-screen">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
