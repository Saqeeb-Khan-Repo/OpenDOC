import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Folder } from '@/types';

interface FoldersState {
  folders: Folder[];
  createFolder: (name: string, parentId?: string | null, color?: string) => Folder;
  updateFolder: (id: string, patch: Partial<Pick<Folder, 'name' | 'color' | 'icon' | 'parentId'>>) => void;
  deleteFolder: (id: string) => void;
  getFolder: (id: string) => Folder | undefined;
  getRootFolders: () => Folder[];
  getChildFolders: (parentId: string) => Folder[];
  getFolderPath: (id: string) => Folder[];
  searchFolders: (query: string) => Folder[];
}

const FOLDER_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#06b6d4', '#84cc16',
];

export const useFoldersStore = create<FoldersState>()(
  persist(
    (set, get) => ({
      folders: [
        {
          id: 'work',
          name: 'Work',
          parentId: null,
          color: '#3b82f6',
          icon: 'briefcase',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'personal',
          name: 'Personal',
          parentId: null,
          color: '#10b981',
          icon: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'projects',
          name: 'Projects',
          parentId: null,
          color: '#8b5cf6',
          icon: 'folder',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      createFolder: (name, parentId = null, color) => {
        const now = new Date().toISOString();
        const folder: Folder = {
          id: uuidv4(),
          name,
          parentId: parentId ?? null,
          color: color ?? FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)],
          icon: 'folder',
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ folders: [...state.folders, folder] }));
        return folder;
      },

      updateFolder: (id, patch) => {
        set(state => ({
          folders: state.folders.map(f =>
            f.id === id ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f
          ),
        }));
      },

      deleteFolder: (id) => {
        // Also delete all children recursively
        const getAllChildIds = (parentId: string): string[] => {
          const children = get().folders.filter(f => f.parentId === parentId);
          return children.flatMap(c => [c.id, ...getAllChildIds(c.id)]);
        };
        const toDelete = new Set([id, ...getAllChildIds(id)]);
        set(state => ({ folders: state.folders.filter(f => !toDelete.has(f.id)) }));
      },

      getFolder: (id) => get().folders.find(f => f.id === id),

      getRootFolders: () => get().folders.filter(f => f.parentId === null),

      getChildFolders: (parentId) => get().folders.filter(f => f.parentId === parentId),

      getFolderPath: (id) => {
        const path: Folder[] = [];
        let current: Folder | undefined = get().folders.find(f => f.id === id);
        while (current) {
          path.unshift(current);
          current = current.parentId ? get().folders.find(f => f.id === current!.parentId) : undefined;
        }
        return path;
      },

      searchFolders: (query) => {
        const q = query.toLowerCase();
        return get().folders.filter(f => f.name.toLowerCase().includes(q));
      },
    }),
    {
      name: 'docflow-folders',
      version: 1,
    }
  )
);
