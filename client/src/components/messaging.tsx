import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Message, InsertMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X } from "lucide-react";

/**
 * Messaging Component
 * 
 * @description Floating messaging widget for authenticated users to communicate with
 * Holly Transportation admin. Features real-time message fetching, thread display,
 * and accessible messaging interface.
 * 
 * @component
 * @returns {JSX.Element} Floating messaging button and dialog interface
 */
export default function Messaging() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: "",
    message: "",
  });

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user && isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: Pick<InsertMessage, 'subject' | 'message'>) => {
      await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the admin team.",
      });
      setNewMessage({ subject: "", message: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newMessage.subject.trim() && newMessage.message.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  const unreadMessages = messages?.filter((msg: Message) => !msg.response).length || 0;

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Floating Message Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-healthcare-green text-white w-16 h-16 rounded-full shadow-lg hover:bg-healthcare-green/90 transition-colors relative"
              data-testid="messaging-button"
            >
              <MessageCircle className="w-6 h-6" />
              {unreadMessages > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center p-0"
                  data-testid="message-count"
                >
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="messaging-dialog">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-healthcare-green" />
                <span>Messages</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Send New Message */}
              <Card className="bg-healthcare-green/5">
                <CardHeader>
                  <CardTitle className="text-lg">Send New Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendMessage} className="space-y-4" data-testid="new-message-form">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <Input
                        value={newMessage.subject}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your inquiry"
                        required
                        data-testid="message-subject-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <Textarea
                        value={newMessage.message}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        placeholder="How can we help you?"
                        required
                        data-testid="message-content-input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-healthcare-green text-white hover:bg-healthcare-green/90"
                      disabled={sendMessageMutation.isPending}
                      data-testid="send-message-button"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Message History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Message History</h3>
                
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading messages...</p>
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {messages.map((message: Message) => (
                      <Card key={message.id} className="p-4" data-testid={`message-${message.id}`}>
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{message.subject}</span>
                              {!message.response && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                                  Pending
                                </Badge>
                              )}
                              {message.response && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                  Answered
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">{message.message}</p>
                          {message.response && (
                            <div className="bg-primary/5 p-3 rounded-lg">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                Admin Response:
                              </div>
                              <p className="text-gray-600 text-sm">{message.response}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400 mt-1">Send a message to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
