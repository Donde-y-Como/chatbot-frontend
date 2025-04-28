import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/axiosInstance';
import { useGetEvents } from '../../events/hooks/useGetEvents';
import { Booking, EventPrimitives } from '../../events/types';

/**
 * Interface defining the client event data structure
 */
export interface ClientEvent {
  event: EventPrimitives;
  booking: Booking;
}

/**
 * Custom hook for getting client bookings
 * @param clientId - The client ID
 * @param enabled - Whether the query should execute
 * @returns Query result for client bookings
 */
export function useGetClientBookings(clientId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['clientBookings', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      try {
        // Fetch bookings for the specific client
        const response = await api.get<Booking[]>(`/bookings?clientId=${clientId}`);
        
        // Double check on the client side to ensure we only have bookings for this client
        const filteredBookings = response.data.filter(booking => booking.clientId === clientId);
        
        console.log(`Fetched ${filteredBookings.length} bookings for client ${clientId}`);
        return filteredBookings;
      } catch (error) {
        console.error(`Error fetching bookings for client ${clientId}:`, error);
        throw error;
      }
    },
    enabled: !!clientId && enabled
  });
}

/**
 * Custom hook that combines events and bookings data for a specific client
 * @param clientId - The client ID
 * @param enabled - Whether the queries should execute
 * @returns Client events data, loading state, and any error
 */
export function useClientEvents(clientId: string | undefined, enabled: boolean = true) {
  const { 
    data: events, 
    isLoading: isLoadingEvents, 
    error: eventsError 
  } = useGetEvents();
  
  const { 
    data: bookings, 
    isLoading: isLoadingBookings, 
    error: bookingsError 
  } = useGetClientBookings(clientId, enabled);
  
  // Combine the event and booking data
  const clientEvents = useMemo<ClientEvent[]>(() => {
    if (!events || !bookings || !clientId) return [];
    
    // Only include bookings for this specific client
    const clientBookings = bookings.filter(booking => booking.clientId === clientId);
    
    return clientBookings.map(booking => {
      // Find the corresponding event for the booking
      const event = events.find(e => e.id === booking.eventId);
      if (!event) return null;
      
      return { event, booking };
    }).filter((item): item is ClientEvent => item !== null);
  }, [events, bookings, clientId]);
  
  // Combine errors from both queries if any exist
  const error = useMemo(() => {
    if (eventsError) return eventsError;
    if (bookingsError) return bookingsError;
    return null;
  }, [eventsError, bookingsError]);

  // Sort events by date (newest first) for immediate use in UI
  const sortedEvents = useMemo(() => {
    if (!clientEvents.length) return [];
    
    return [...clientEvents].sort((a, b) => 
      new Date(b.event.duration.startAt).getTime() - 
      new Date(a.event.duration.startAt).getTime()
    );
  }, [clientEvents]);
  
  // Log information about the events we're returning
  useEffect(() => {
    if (sortedEvents.length > 0 && clientId) {
      console.log(`Returning ${sortedEvents.length} events for client ${clientId}`);
    }
  }, [sortedEvents, clientId]);

  return {
    clientEvents: sortedEvents,
    isLoading: isLoadingEvents || isLoadingBookings,
    isError: !!error,
    error
  };
}
