import { create } from 'zustand';

export interface CourseDetails {
  courseId: string;
  versionId?: string;
  moduleId?: string;
  sectionId?: string;
  itemId?: string;
  watchItemId?: string;
}

interface CourseStore {
  currentCourse?: CourseDetails;
  setCurrentCourse: (details: CourseDetails) => void;
  setWatchItemId: (id: string) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  currentCourse: undefined,
  setCurrentCourse: (details) => set({ currentCourse: details }),
  setWatchItemId: (watchItemId) =>
    set((state) => ({
      currentCourse: state.currentCourse
        ? { ...state.currentCourse, watchItemId }
        : state.currentCourse,
    })),
})); 