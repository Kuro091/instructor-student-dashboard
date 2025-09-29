import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/stores/auth-context'
import { routes } from '@/app/routes'
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  Bell,
  Search,
  Plus,
  User,
  ChevronDown
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: routes.instructor.dashboard, icon: LayoutDashboard },
  { name: 'Students', href: routes.instructor.students, icon: Users },
  { name: 'Lessons', href: routes.instructor.lessons, icon: BookOpen },
  { name: 'Messages', href: routes.chat.list, icon: MessageSquare },
]

export function InstructorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      {/* Mobile sidebar */}
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

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:w-64">
        <div className="flex flex-col flex-grow bg-white border-gray-200 border-r overflow-y-auto">
          <div className="flex justify-center items-center h-16">
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
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="mr-3 w-5 h-5" />
                  {item.name}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="top-0 z-40 sticky flex items-center gap-x-4 sm:gap-x-6 bg-white shadow-sm px-4 sm:px-6 lg:px-8 border-gray-200 border-b h-16 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>

          {/* Search */}
          <div className="flex flex-1 self-stretch gap-x-4 lg:gap-x-6">
            <div className="relative flex flex-1">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students, lessons..."
                className="block py-1.5 pr-3 pl-10 border-0 rounded-md ring-1 ring-gray-300 focus:ring-2 focus:ring-primary ring-inset focus:ring-inset w-full text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge 
                variant="destructive" 
                className="-top-1 -right-1 absolute p-0 rounded-full w-5 h-5 text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Quick Add */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 w-4 h-4" />
                  Quick Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(routes.instructor.students)}>
                  <Users className="mr-2 w-4 h-4" />
                  Add Student
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(routes.instructor.lessons)}>
                  <BookOpen className="mr-2 w-4 h-4" />
                  Assign Lesson
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                    <p className="text-gray-500 text-xs">Instructor</p>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 w-4 h-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
