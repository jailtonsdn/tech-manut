
import { useState } from 'react';
import { MobileIcon, Laptop, Printer, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavbarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const Navbar = ({ activeFilter, onFilterChange }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFilterClick = (filter: string) => {
    onFilterChange(filter);
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: 'all', label: 'Todos', icon: null },
    { id: 'ups', label: 'Nobreaks', icon: <MobileIcon className="h-4 w-4 mr-2" /> },
    { id: 'printer', label: 'Impressoras', icon: <Printer className="h-4 w-4 mr-2" /> },
    { id: 'computer', label: 'Computadores', icon: <Laptop className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex items-center justify-between h-16 mx-auto px-4">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold tracking-tight">Sistema de Manutenção de TI</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeFilter === item.id ? "default" : "ghost"}
              className={`text-sm ${activeFilter === item.id ? 'bg-gray-900 text-white' : ''}`}
              onClick={() => handleFilterClick(item.id)}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[280px]">
            <nav className="flex flex-col gap-4 mt-6">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeFilter === item.id ? "default" : "ghost"}
                  className={`justify-start ${activeFilter === item.id ? 'bg-gray-900 text-white' : ''}`}
                  onClick={() => handleFilterClick(item.id)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;
