import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, Send, Star } from "lucide-react";

interface MessageProps {
  sender: string;
  content: string;
  time: string;
  isStarred?: boolean;
}

const Messages = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full md:w-80 bg-gray-900/50 backdrop-blur-xl border-r border-purple-500/20 p-4"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Messages</h1>
            <p className="text-gray-400 text-sm">"Together, we are bulletproof" - BTS</p>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search messages..."
              className="pl-10 bg-gray-800/50 border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <ChatPreview
              name="Study Group A"
              lastMessage="Hey, when's our next session?"
              time="2m ago"
              active
            />
            <ChatPreview
              name="Math Squad"
              lastMessage="Thanks for the help!"
              time="1h ago"
            />
            <ChatPreview
              name="Science Team"
              lastMessage="Check out this cool experiment"
              time="2h ago"
            />
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-gray-900/50 backdrop-blur-xl border-b border-purple-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Study Group A</h2>
                <p className="text-sm text-gray-400">4 members</p>
              </div>
              <Button variant="outline" size="sm">
                Add Member
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Message
              sender="Alex"
              content="Hey everyone! Ready for our study session?"
              time="2:30 PM"
              isStarred
            />
            <Message
              sender="You"
              content="Yes! Let's focus on chapter 5 today"
              time="2:31 PM"
            />
            <Message
              sender="Sarah"
              content="Perfect! I had some questions about that chapter"
              time="2:32 PM"
            />
          </div>

          {/* Input Area */}
          <div className="bg-gray-900/50 backdrop-blur-xl border-t border-purple-500/20 p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                className="bg-gray-800/50 border-gray-700"
              />
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatPreview = ({ name, lastMessage, time, active = false }) => (
  <div
    className={`p-3 rounded-lg transition-colors cursor-pointer ${
      active
        ? "bg-purple-500/20 text-purple-400"
        : "hover:bg-purple-500/10 text-gray-400"
    }`}
  >
    <div className="flex justify-between items-start mb-1">
      <h3 className="font-medium">{name}</h3>
      <span className="text-xs">{time}</span>
    </div>
    <p className="text-sm truncate">{lastMessage}</p>
  </div>
);

const Message = ({ sender, content, time, isStarred = false }: MessageProps) => (
  <div className="flex items-start gap-2">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium">{sender}</span>
        <span className="text-xs text-gray-400">{time}</span>
        {isStarred && <Star className="w-4 h-4 text-yellow-500" />}
      </div>
      <p className="text-gray-300">{content}</p>
    </div>
  </div>
);

export default Messages;