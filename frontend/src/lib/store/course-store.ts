import { create } from 'zustand';

type Course = {
  id: string;
  title: string;
  description?: string;
};

type CourseStore = {
  currentCourse: Course | null;
  setCurrentCourse: (course: Course | null) => void;
  setWatchItemId: (id: string) => void;
};

export const useCourseStore = create<CourseStore>()((set) => ({
  currentCourse: null,
  setCurrentCourse: (course) => set({ currentCourse: course }),
  setWatchItemId: (id) => {
    // Basic implementation - just log for now
    console.log('Watch item ID set:', id);
  },
})); 