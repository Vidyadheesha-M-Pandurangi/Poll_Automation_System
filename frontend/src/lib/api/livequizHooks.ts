import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Types for Room, Poll, and Answer based on backend schema
export interface Answer {
  userId: string;
  answerIndex: number;
  answeredAt: string;
}

export interface Poll {
  _id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  timer?: number;
  createdAt: string;
  answers: Answer[];
}

export interface Room {
  roomCode: string;
  name: string;
  teacherId: string;
  createdAt: string;
  status: "active" | "ended";
  polls: Poll[];
}

/**
 * Fetch all rooms created by a teacher.
 * This endpoint hits GET /livequizzes/rooms/teacher/:teacherId on the backend.
 */
export function useRoomsByTeacher(teacherId: string | undefined) {
  return useQuery<Room[] | null>({
    queryKey: ["rooms-by-teacher", teacherId],
    queryFn: async () => {
      if (!teacherId) return null;
      const { data } = await api.get<Room[]>(
        `/livequizzes/rooms/teacher/${teacherId}`
      );
      return data;
    },
    // Only run when we actually have a teacherId
    enabled: !!teacherId,
  });
}

/**
 * Fetch all rooms (for student or admin overviews)
 * GET /livequizzes/rooms/all
 */
export function useAllRooms() {
  return useQuery<Room[]>({
    queryKey: ["all-rooms"],
    queryFn: async () => {
      const { data } = await api.get<Room[]>("/livequizzes/rooms/all");
      return data;
    },
  });
} 