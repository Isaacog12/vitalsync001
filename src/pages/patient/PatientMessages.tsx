import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatWindow from '@/components/messaging/ChatWindow';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Loader2, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  full_name: string;
  role: string;
  department: string | null;
  unread_count: number;
}

export default function PatientMessages() {
  const { profile } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchContacts();
    }
  }, [profile?.id]);

  const fetchContacts = async () => {
    try {
      const { data: doctors, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, department')
        .eq('role', 'doctor');

      if (error) throw error;

      const contactsWithUnread = await Promise.all(
        (doctors || []).map(async (doctor) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', doctor.id)
            .eq('receiver_id', profile?.id)
            .eq('is_read', false);

          return {
            ...doctor,
            unread_count: count || 0,
          };
        })
      );

      setContacts(contactsWithUnread);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">Chat with your care team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
          <Card className="lg:col-span-1">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Care Team
                </h2>
              </div>
              <ScrollArea className="h-[calc(100vh-320px)]">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No doctors available</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {contacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left",
                          selectedContact?.id === contact.id && "bg-muted"
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {getInitials(contact.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{contact.full_name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {contact.department || 'Doctor'}
                          </p>
                        </div>
                        {contact.unread_count > 0 && (
                          <Badge className="bg-primary">{contact.unread_count}</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-0 h-full">
              {selectedContact ? (
                <ChatWindow
                  recipientId={selectedContact.id}
                  recipientName={selectedContact.full_name}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a doctor to start messaging</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
