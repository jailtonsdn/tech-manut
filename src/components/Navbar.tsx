
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, BarChart2, LogOut } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">Sistema de Manutenção</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded hover:bg-gray-700">
              Equipamentos
            </Link>
            <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-gray-700">
              Dashboard
            </Link>
            <div className="ml-4 flex items-center space-x-2">
              <span>Olá, {user?.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-3 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Equipamentos
              </Link>
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart2 className="h-4 w-4 inline mr-1" />
                Dashboard
              </Link>
              <div className="flex items-center justify-between border-t border-gray-700 pt-2 mt-2">
                <span>Olá, {user?.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
