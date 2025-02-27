
import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const Layout = ({ children, activeFilter, onFilterChange }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeFilter={activeFilter} onFilterChange={onFilterChange} />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
