import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { CreateEventInput, RSVPInput } from './validations';

// Event hooks
export function useEvents(userEmail?: string) {
  return useQuery({
    queryKey: ['events', userEmail],
    queryFn: async () => {
      if (!userEmail || !supabase) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('invited_by', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userEmail && !!supabase,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId && !!supabase,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData: CreateEventInput) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'active',
          participant_count: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...eventData }: { id: string } & Partial<CreateEventInput>) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', data.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// RSVP hooks
export function useEventRSVPs(eventId: string) {
  return useQuery({
    queryKey: ['rsvps', eventId],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');
      
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!eventId && !!supabase,
  });
}

export function useRSVP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, ...rsvpData }: { eventId: string } & RSVPInput) => {
      if (!supabase) throw new Error('Supabase not configured');
      
      // Check if participant already exists
      if (rsvpData.email) {
        const { data: existing } = await supabase
          .from('event_rsvps')
          .select('id')
          .eq('event_id', eventId)
          .eq('email', rsvpData.email)
          .single();

        if (existing) {
          // Update existing RSVP
          const { data, error } = await supabase
            .from('event_rsvps')
            .update({
              name: rsvpData.name,
              will_attend: rsvpData.willAttend,
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      }

      // Create new RSVP
      const { data, error } = await supabase
        .from('event_rsvps')
        .insert([{
          event_id: eventId,
          name: rsvpData.name,
          email: rsvpData.email || null,
          will_attend: rsvpData.willAttend,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rsvps', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event', data.event_id] });
    },
  });
}

// User hooks
export function useUser(userId?: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...userData }: { id: string; name?: string; email?: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
    },
  });
}
