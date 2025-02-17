
import { useRef } from "react";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  headerUrl: string | null;
  onProfileUpdate: () => Promise<void>;
}

export const ProfileHeader = ({ headerUrl, onProfileUpdate }: ProfileHeaderProps) => {
  const headerInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadHeader = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login first!");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/header_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ header_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await onProfileUpdate();
      
      toast({
        title: "Header updated! ✨",
        description: "Your new header is giving main character energy!",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed bestie 😭",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadHeader(file);
  };

  return (
    <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-purple-900 to-pink-900">
      {headerUrl && (
        <img 
          src={headerUrl} 
          alt="Profile header" 
          className="w-full h-full object-cover"
        />
      )}
      <button 
        onClick={() => headerInputRef.current?.click()}
        className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
      >
        <Camera className="w-5 h-5 text-white" />
      </button>
      <input
        ref={headerInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
