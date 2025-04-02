
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, getProfile, updateProfile } from "@/integrations/supabase/client";

const themes = [
  { name: "Calming", value: "calming" },
  { name: "Earth", value: "earth" },
  { name: "Water", value: "water" },
];

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState("calming");
  const { toast } = useToast();

  useEffect(() => {
    getInitialTheme();
  }, []);

  const getInitialTheme = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await getProfile(user.id);
      
      if (profile?.theme) {
        setCurrentTheme(profile.theme);
        applyTheme(profile.theme);
      }
    }
  };

  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute("data-theme", theme);
    const root = document.documentElement;
    
    switch (theme) {
      case "calming":
        root.style.setProperty("--background", "#F2FCE2");
        root.style.setProperty("--foreground", "#8E9196");
        root.style.setProperty("--primary", "#E5DEFF");
        root.style.setProperty("--secondary", "#D3E4FD");
        break;
      case "earth":
        root.style.setProperty("--background", "#F2FCE2");
        root.style.setProperty("--foreground", "#8E9196");
        root.style.setProperty("--primary", "#FEC6A1");
        root.style.setProperty("--secondary", "#FDE1D3");
        break;
      case "water":
        root.style.setProperty("--background", "#D3E4FD");
        root.style.setProperty("--foreground", "#8E9196");
        root.style.setProperty("--primary", "#0EA5E9");
        root.style.setProperty("--secondary", "#33C3F0");
        break;
    }
  };

  const updateTheme = async (theme: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await updateProfile(user.id, { theme });

      if (!error) {
        setCurrentTheme(theme);
        applyTheme(theme);
        toast({
          title: "Theme Updated ✨",
          description: `Your theme has been changed to ${theme}`,
        });
      } else {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => updateTheme(theme.value)}
            className={currentTheme === theme.value ? "bg-accent" : ""}
          >
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
