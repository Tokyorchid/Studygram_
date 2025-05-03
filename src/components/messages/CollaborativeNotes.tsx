
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Plus, Trash } from "lucide-react";

interface CollaborativeNotesProps {
  sessionId?: string;
}

const CollaborativeNotes = ({ sessionId = "default" }: CollaborativeNotesProps) => {
  const [notes, setNotes] = useState([
    { id: "1", content: "Key points from today's study session:", author: "You", timestamp: new Date().toISOString() }
  ]);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      const noteObj = {
        id: Date.now().toString(),
        content: newNote,
        author: "You",
        timestamp: new Date().toISOString()
      };
      setNotes([...notes, noteObj]);
      setNewNote("");
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleSaveNotes = () => {
    // In a real app, this would save to the database
    console.log("Saving notes for session", sessionId, notes);
    // TODO: Implement actual saving functionality
  };

  return (
    <div className="p-4 bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold gradient-text">Collaborative Notes</h3>
        <Button size="sm" onClick={handleSaveNotes}>
          <Save className="w-4 h-4 mr-1" /> Save
        </Button>
      </div>
      
      <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
        {notes.map(note => (
          <div key={note.id} className="p-3 bg-gray-800/50 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="text-sm text-purple-400 mb-1">{note.author}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteNote(note.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-200">{note.content}</p>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="bg-gray-800/50 border-gray-700 resize-none min-h-[80px]"
        />
        <Button onClick={handleAddNote} className="self-end">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CollaborativeNotes;
