import { supabase } from './supabase';

export interface JournalEntry {
  id: string;
  created_at: string;
  user_id: string;
  text: string;
  ai_response?: string; // This field is optional
  mood?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  created_at: string;
  journal_entry_id: string;
  text: string;
  is_user: boolean;
  user_id: string;
}

export const createJournalEntry = async (
  userId: string,
  text: string,
  aiResponse?: string,
  mood?: string,
  tags?: string[]
): Promise<JournalEntry> => {
  try {
    // Start with only the absolutely required fields
    const entryData: any = {
      user_id: userId,
      text
    };
    
    // Conditionally add mood if provided
    if (mood) {
      entryData.mood = mood;
    }
    
    // Do not include tags or ai_response as they seem to be missing from the schema
    
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entryData])
      .select()
      .single();

    if (error) throw error;
    
    // If we need to add other fields later, we can attempt to update separately,
    // but don't fail the main operation if they don't exist
    if (data && data.id) {
      try {
        if (aiResponse) {
          // Try to update with ai_response, but don't fail if it doesn't exist
          try {
            await supabase
              .from('journal_entries')
              .update({ ai_response: aiResponse })
              .eq('id', data.id);
          } catch (updateError) {
            console.log('Could not save AI response, continuing without it.');
          }
        }
        
        if (tags && tags.length > 0) {
          // Try to update with tags, but don't fail if it doesn't exist
          try {
            await supabase
              .from('journal_entries')
              .update({ tags: tags })
              .eq('id', data.id);
          } catch (updateError) {
            console.log('Could not save tags, continuing without them.');
          }
        }
      } catch (updateError) {
        console.log('Error updating additional fields, but entry was created.');
      }
    }
    
    return data as JournalEntry;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

// Separate function for updating just the AI response
export const updateJournalEntryAIResponse = async (
  entryId: string,
  aiResponse: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .update({ ai_response: aiResponse })
      .eq('id', entryId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating AI response:', error);
    throw error;
  }
};

export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as JournalEntry[];
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

export const getJournalEntry = async (entryId: string): Promise<JournalEntry> => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (error) throw error;
    return data as JournalEntry;
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    throw error;
  }
};

export const updateJournalEntry = async (
  entryId: string,
  updates: Partial<JournalEntry>
): Promise<JournalEntry> => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data as JournalEntry;
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (entryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// Functions for chat messages

export const createChatMessage = async (
  userId: string,
  journalEntryId: string,
  text: string,
  isUser: boolean
): Promise<ChatMessage> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{
        user_id: userId,
        journal_entry_id: journalEntryId,
        text,
        is_user: isUser
      }])
      .select()
      .single();

    if (error) throw error;
    return data as ChatMessage;
  } catch (error) {
    console.error('Error creating chat message:', error);
    throw error;
  }
};

export const getChatMessages = async (journalEntryId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('journal_entry_id', journalEntryId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ChatMessage[];
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

// Initial conversation handling
export const initializeConversation = async (
  userId: string,
  journalEntryId: string,
  entryText: string,
  aiResponse: string | null
): Promise<ChatMessage[]> => {
  try {
    // Add the user's initial entry as a message
    await createChatMessage(userId, journalEntryId, entryText, true);
    
    // If there's an AI response, add it as a message
    if (aiResponse) {
      await createChatMessage(userId, journalEntryId, aiResponse, false);
    }
    
    // Return the full conversation
    return await getChatMessages(journalEntryId);
  } catch (error) {
    console.error('Error initializing conversation:', error);
    throw error;
  }
};