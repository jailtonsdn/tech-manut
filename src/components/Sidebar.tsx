
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart2, LogOut, Home, Menu, X, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const Sidebar = ({ activeFilter = 'all', onFilterChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFilterClick = (filter: string) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  const MenuItem = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center px-4 py-3 rounded-lg transition-colors",
          isActive 
            ? "bg-gray-700 text-white" 
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        )}
      >
        {icon}
        {!isCollapsed && <span className="ml-3">{children}</span>}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "bg-gray-800 text-white h-screen flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && <span className="text-xl font-bold">Sistema de Manutenção</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-700 focus:outline-none"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* User Info */}
      <div className={cn(
        "border-b border-gray-700 py-4 px-4",
        isCollapsed ? "text-center" : ""
      )}>
        {!isCollapsed ? (
          <div>
            <p className="font-medium">Olá, {user?.name}</p>
            <p className="text-xs text-gray-400">Logado como admin</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
              {user?.name.charAt(0)}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-2 space-y-1">
        <MenuItem to="/" icon={<Home className="h-5 w-5" />}>
          Equipamentos
        </MenuItem>
        <MenuItem to="/dashboard" icon={<BarChart2 className="h-5 w-5" />}>
          Dashboard
        </MenuItem>
        <MenuItem to="/invoices" icon={<Receipt className="h-5 w-5" />}>
          Notas Fiscais
        </MenuItem>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "text-white border-gray-600 hover:bg-gray-700",
            isCollapsed ? "w-full p-2 justify-center" : "w-full"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
