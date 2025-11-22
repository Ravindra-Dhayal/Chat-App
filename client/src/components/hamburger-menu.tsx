import { useState } from "react";
import { Menu, X } from "lucide-react";
import AsideBar from "./aside-bar";
import { Button } from "./ui/button";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-[9997] bg-card hover:bg-accent border-2 border-border shadow-lg hover:shadow-xl transition-all min-h-[44px] min-w-[44px] rounded-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-foreground" />
        )}
      </Button>

      {/* Sidebar */}
      {isOpen && <AsideBar onClose={closeMenu} />}
    </>
  );
};

export default HamburgerMenu;
