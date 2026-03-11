'use client';

import { useReducer, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { PxlKitIcon, AnimatedPxlKitIcon, generateIconCode, gridToSvg, generateAnimatedSvg, parseIconCode, RETRO_PALETTES } from '@pxlkit/core';
import type { PxlKitData, AnimatedPxlKitData, GridSize } from '@pxlkit/core';
import { Pencil, Eraser, PaintBucket, Eyedropper, Play, Pause, Undo, Redo, Close, Check, SparkleSmall } from '@pxlkit/ui';
import { PixelBareButton, PixelBareInput, PixelBareTextarea } from '../../components/ui-kit';

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type Tool = 'pencil' | 'eraser' | 'fill' | 'eyedropper';
type TabId = 'preview' | 'code' | 'import' | 'collection';

interface EditorState {
  grid: string[][];        
  size: GridSize;
  palette: Record<string, string>; 
  activeColor: string;     
  activeChar: string;      
  tool: Tool;
  iconName: string;
  category: string;
  tags: string;
  history: string[][][];
  historyIndex: number;
  mirrorX: boolean;
  mirrorY: boolean;
  // Animation
  animationMode: boolean;
  frames: string[][][];
  currentFrame: number;
  fps: number;
  onionSkin: boolean;
  isPlaying: boolean;
  animLoop: boolean;
}

type EditorAction =
  | { type: 'SET_PIXEL'; x: number; y: number }
  | { type: 'ERASE_PIXEL'; x: number; y: number }
  | { type: 'FILL'; x: number; y: number }
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_COLOR'; char: string; color: string }
  | { type: 'ADD_COLOR'; color: string }
  | { type: 'SET_ACTIVE_COLOR'; char: string }
  | { type: 'REMOVE_COLOR'; char: string }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_TAGS'; tags: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_MIRROR_X' }
  | { type: 'TOGGLE_MIRROR_Y' }
  | { type: 'LOAD_ICON'; icon: PxlKitData }
  | { type: 'LOAD_ANIMATED_ICON'; icon: AnimatedPxlKitData }
  | { type: 'SET_SIZE'; size: GridSize }
  | { type: 'TOGGLE_ANIMATION_MODE' }
  | { type: 'ADD_FRAME'; copy?: boolean }
  | { type: 'DELETE_FRAME' }
  | { type: 'DUPLICATE_FRAME' }
  | { type: 'SET_CURRENT_FRAME'; index: number }
  | { type: 'NEXT_FRAME' }
  | { type: 'SET_FPS'; fps: number }
  | { type: 'TOGGLE_ONION_SKIN' }
  | { type: 'TOGGLE_PLAYING' }
  | { type: 'TOGGLE_ANIM_LOOP' };

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────
function createEmptyGrid(size: number): string[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => '.'));
}

function cloneGrid(grid: string[][]): string[][] {
  return grid.map((row) => [...row]);
}

function pushHistory(state: EditorState, newGrid: string[][]): EditorState {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(cloneGrid(newGrid));
  let newFrames = state.frames;
  if (state.animationMode && state.frames.length > 0) {
    newFrames = [...state.frames];
    newFrames[state.currentFrame] = cloneGrid(newGrid);
  }
  return {
    ...state,
    grid: newGrid,
    frames: newFrames,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

function floodFill(grid: string[][], x: number, y: number, targetChar: string, fillChar: string, size: number): string[][] {
  if (targetChar === fillChar) return grid;
  const newGrid = cloneGrid(grid);
  const stack: [number, number][] = [[x, y]];
  
  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cx >= size || cy < 0 || cy >= size) continue;
    if (newGrid[cy][cx] !== targetChar) continue;
    newGrid[cy][cx] = fillChar;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  
  return newGrid;
}

function getNextCharKey(palette: Record<string, string>): string {
  const used = new Set(Object.keys(palette));
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (const c of chars) {
    if (!used.has(c)) return c;
  }
  return '?';
}

// ────────────────────────────────────────────
// Collection persistence
// ────────────────────────────────────────────
interface SavedIcon {
  id: string;
  data: PxlKitData;
  animatedData?: AnimatedPxlKitData;
  savedAt: number;
}

interface PackData {
  name: string;
  icons: SavedIcon[];
}

type CollectionData = Record<string, PackData>;

const COLLECTION_KEY = 'pxlkit-collection';
const EDITOR_KEY = 'pxlkit-editor';
const INCOMING_ICON_KEY = 'pxlkit-builder-incoming';

function loadCollection(): CollectionData {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY);
    return raw ? JSON.parse(raw) : { misc: { name: 'Misc', icons: [] } };
  } catch { return { misc: { name: 'Misc', icons: [] } }; }
}

function persistCollection(data: CollectionData) {
  try { localStorage.setItem(COLLECTION_KEY, JSON.stringify(data)); } catch {}
}

function toPascalCase(name: string): string {
  return name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function generatePackTS(pack: PackData): string {
  const iconDefs: string[] = [];
  const names: string[] = [];
  for (const saved of pack.icons) {
    const pn = toPascalCase(saved.data.name);
    names.push(pn);
    iconDefs.push(`export const ${pn}: PxlKitData = ${JSON.stringify(saved.data, null, 2)};`);
  }
  const packId = pack.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const packVar = toPascalCase(packId) + 'Pack';
  return [
    `import type { PxlKitData, IconPack } from '@pxlkit/core';`,
    '',
    ...iconDefs,
    '',
    `export const ${packVar}: IconPack = {`,
    `  id: '${packId}',`,
    `  name: '${pack.name}',`,
    `  description: 'Custom icon pack — ${pack.icons.length} icons',`,
    `  icons: [${names.join(', ')}],`,
    `  version: '1.0.0',`,
    `};`,
    '',
  ].join('\n');
}

// ────────────────────────────────────────────
// Reducer
// ────────────────────────────────────────────
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_PIXEL': {
      const { x, y } = action;
      const newGrid = cloneGrid(state.grid);
      newGrid[y][x] = state.activeChar;
      if (state.mirrorX) {
        const mx = state.size - 1 - x;
        newGrid[y][mx] = state.activeChar;
      }
      if (state.mirrorY) {
        const my = state.size - 1 - y;
        newGrid[my][x] = state.activeChar;
      }
      if (state.mirrorX && state.mirrorY) {
        const mx = state.size - 1 - x;
        const my = state.size - 1 - y;
        newGrid[my][mx] = state.activeChar;
      }
      return pushHistory(state, newGrid);
    }

    case 'ERASE_PIXEL': {
      const { x, y } = action;
      const newGrid = cloneGrid(state.grid);
      newGrid[y][x] = '.';
      if (state.mirrorX) newGrid[y][state.size - 1 - x] = '.';
      if (state.mirrorY) newGrid[state.size - 1 - y][x] = '.';
      if (state.mirrorX && state.mirrorY) newGrid[state.size - 1 - y][state.size - 1 - x] = '.';
      return pushHistory(state, newGrid);
    }

    case 'FILL': {
      const { x, y } = action;
      const targetChar = state.grid[y][x];
      const newGrid = floodFill(state.grid, x, y, targetChar, state.activeChar, state.size);
      return pushHistory(state, newGrid);
    }

    case 'SET_TOOL':
      return { ...state, tool: action.tool };

    case 'SET_COLOR': {
      const pal = { ...state.palette, [action.char]: action.color };
      return { ...state, palette: pal };
    }

    case 'ADD_COLOR': {
      const char = getNextCharKey(state.palette);
      const pal = { ...state.palette, [char]: action.color };
      return { ...state, palette: pal, activeChar: char, activeColor: action.color };
    }

    case 'SET_ACTIVE_COLOR':
      return { ...state, activeChar: action.char, activeColor: state.palette[action.char] || '#FFFFFF' };

    case 'REMOVE_COLOR': {
      const pal = { ...state.palette };
      delete pal[action.char];
      // Remove from grid too
      const newGrid = state.grid.map(row => row.map(c => c === action.char ? '.' : c));
      const firstKey = Object.keys(pal)[0];
      return pushHistory({
        ...state,
        palette: pal,
        activeChar: firstKey || 'A',
        activeColor: pal[firstKey] || '#FFFFFF',
      }, newGrid);
    }

    case 'SET_NAME':
      return { ...state, iconName: action.name };

    case 'SET_CATEGORY':
      return { ...state, category: action.category };

    case 'SET_TAGS':
      return { ...state, tags: action.tags };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        grid: cloneGrid(state.history[newIndex]),
        historyIndex: newIndex,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        grid: cloneGrid(state.history[newIndex]),
        historyIndex: newIndex,
      };
    }

    case 'CLEAR': {
      const empty = createEmptyGrid(state.size);
      return pushHistory(state, empty);
    }

    case 'TOGGLE_MIRROR_X':
      return { ...state, mirrorX: !state.mirrorX };

    case 'TOGGLE_MIRROR_Y':
      return { ...state, mirrorY: !state.mirrorY };

    case 'LOAD_ICON': {
      const icon = action.icon;
      const grid = icon.grid.map((row) => row.split(''));
      return {
        ...state,
        grid,
        size: icon.size,
        palette: { ...icon.palette },
        iconName: icon.name,
        category: icon.category,
        tags: icon.tags.join(', '),
        activeChar: Object.keys(icon.palette)[0] || 'A',
        activeColor: Object.values(icon.palette)[0] || '#FFFFFF',
        history: [cloneGrid(grid)],
        historyIndex: 0,
        mirrorX: false,
        mirrorY: false,
        animationMode: false,
        frames: [],
        currentFrame: 0,
        isPlaying: false,
      };
    }

    case 'LOAD_ANIMATED_ICON': {
      const aIcon = action.icon;
      const firstGrid = aIcon.frames[0].grid.map((row) => row.split(''));
      const allFrames = aIcon.frames.map((f) => f.grid.map((row) => row.split('')));
      return {
        ...state,
        grid: firstGrid,
        size: aIcon.size,
        palette: { ...aIcon.palette },
        iconName: aIcon.name,
        category: aIcon.category,
        tags: aIcon.tags.join(', '),
        activeChar: Object.keys(aIcon.palette)[0] || 'A',
        activeColor: Object.values(aIcon.palette)[0] || '#FFFFFF',
        history: [cloneGrid(firstGrid)],
        historyIndex: 0,
        mirrorX: false,
        mirrorY: false,
        animationMode: true,
        frames: allFrames,
        currentFrame: 0,
        fps: aIcon.frameDuration > 0 ? Math.round(1000 / aIcon.frameDuration) : 8,
        isPlaying: false,
        animLoop: aIcon.loop !== false,
      };
    }

    case 'SET_SIZE': {
      const empty = createEmptyGrid(action.size);
      return {
        ...state,
        size: action.size,
        grid: empty,
        history: [cloneGrid(empty)],
        historyIndex: 0,
        animationMode: false,
        frames: [],
        currentFrame: 0,
      };
    }

    // ── Animation ──────────────────────────
    case 'TOGGLE_ANIMATION_MODE': {
      if (!state.animationMode) {
        return {
          ...state,
          animationMode: true,
          frames: [cloneGrid(state.grid)],
          currentFrame: 0,
          isPlaying: false,
        };
      }
      return {
        ...state,
        animationMode: false,
        grid: state.frames.length > 0 ? cloneGrid(state.frames[0]) : state.grid,
        frames: [],
        currentFrame: 0,
        isPlaying: false,
      };
    }

    case 'ADD_FRAME': {
      if (!state.animationMode) return state;
      const aFrames = [...state.frames];
      aFrames[state.currentFrame] = cloneGrid(state.grid);
      const fresh = action.copy ? cloneGrid(state.grid) : createEmptyGrid(state.size);
      aFrames.splice(state.currentFrame + 1, 0, fresh);
      return {
        ...state,
        frames: aFrames,
        currentFrame: state.currentFrame + 1,
        grid: cloneGrid(fresh),
        history: [cloneGrid(fresh)],
        historyIndex: 0,
      };
    }

    case 'DELETE_FRAME': {
      if (!state.animationMode || state.frames.length <= 1) return state;
      const dFrames = state.frames.filter((_, i) => i !== state.currentFrame);
      const dIdx = Math.min(state.currentFrame, dFrames.length - 1);
      return {
        ...state,
        frames: dFrames,
        currentFrame: dIdx,
        grid: cloneGrid(dFrames[dIdx]),
        history: [cloneGrid(dFrames[dIdx])],
        historyIndex: 0,
      };
    }

    case 'DUPLICATE_FRAME': {
      if (!state.animationMode) return state;
      const dupFrames = [...state.frames];
      dupFrames[state.currentFrame] = cloneGrid(state.grid);
      dupFrames.splice(state.currentFrame + 1, 0, cloneGrid(state.grid));
      return {
        ...state,
        frames: dupFrames,
        currentFrame: state.currentFrame + 1,
        grid: cloneGrid(state.grid),
        history: [cloneGrid(state.grid)],
        historyIndex: 0,
      };
    }

    case 'SET_CURRENT_FRAME': {
      if (!state.animationMode) return state;
      const fIdx = action.index;
      if (fIdx < 0 || fIdx >= state.frames.length || fIdx === state.currentFrame) return state;
      const sfFrames = [...state.frames];
      sfFrames[state.currentFrame] = cloneGrid(state.grid);
      return {
        ...state,
        frames: sfFrames,
        currentFrame: fIdx,
        grid: cloneGrid(sfFrames[fIdx]),
        history: [cloneGrid(sfFrames[fIdx])],
        historyIndex: 0,
      };
    }

    case 'NEXT_FRAME': {
      if (!state.animationMode || state.frames.length <= 1) return state;
      const nfFrames = [...state.frames];
      nfFrames[state.currentFrame] = cloneGrid(state.grid);
      let nextIdx = state.currentFrame + 1;
      if (nextIdx >= nfFrames.length) {
        if (state.animLoop) nextIdx = 0;
        else return { ...state, frames: nfFrames, isPlaying: false };
      }
      return {
        ...state,
        frames: nfFrames,
        currentFrame: nextIdx,
        grid: cloneGrid(nfFrames[nextIdx]),
      };
    }

    case 'SET_FPS':
      return { ...state, fps: Math.max(1, Math.min(30, action.fps)) };

    case 'TOGGLE_ONION_SKIN':
      return { ...state, onionSkin: !state.onionSkin };

    case 'TOGGLE_PLAYING':
      return { ...state, isPlaying: !state.isPlaying };

    case 'TOGGLE_ANIM_LOOP':
      return { ...state, animLoop: !state.animLoop };

    default:
      return state;
  }
}

// ────────────────────────────────────────────
// Initial state
// ────────────────────────────────────────────
const defaultPalette: Record<string, string> = {
  'A': '#FF004D',
  'B': '#29ADFF',
  'C': '#00E436',
  'D': '#FFA300',
  'E': '#FFEC27',
};

const initialGrid = createEmptyGrid(16);

const initialState: EditorState = {
  grid: initialGrid,
  size: 16,
  palette: defaultPalette,
  activeColor: '#FF004D',
  activeChar: 'A',
  tool: 'pencil',
  iconName: 'my-icon',
  category: 'custom',
  tags: '',
  history: [cloneGrid(initialGrid)],
  historyIndex: 0,
  mirrorX: false,
  mirrorY: false,
  animationMode: false,
  frames: [],
  currentFrame: 0,
  fps: 8,
  onionSkin: false,
  isPlaying: false,
  animLoop: true,
};

// ────────────────────────────────────────────
// Builder Page
// ────────────────────────────────────────────
export default function BuilderPage() {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const [activeTab, setActiveTab] = useState<TabId>('preview');
  const [isPainting, setIsPainting] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [copied, setCopied] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Collection state
  const [collection, setCollection] = useState<CollectionData>({ misc: { name: 'Misc', icons: [] } });
  const [activePack, setActivePack] = useState('misc');
  const [newPackName, setNewPackName] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Load collection on mount + restore last editor state + detect incoming icon
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollection(loadCollection());

    // Check for incoming icon from landing/icons page
    try {
      const incoming = localStorage.getItem(INCOMING_ICON_KEY);
      if (incoming) {
        localStorage.removeItem(INCOMING_ICON_KEY);
        const parsed = JSON.parse(incoming);

        // Auto-save current editor work to collection before overwriting
        try {
          const prev = localStorage.getItem(EDITOR_KEY);
          if (prev) {
            const prevIcon = JSON.parse(prev) as PxlKitData;
            const hasPixels = prevIcon.grid?.some((row) => row.replace(/\./g, '').length > 0);
            if (hasPixels) {
              const col = loadCollection();
              const recoveryId = `recovery-${Date.now()}`;
              if (!col.misc) col.misc = { name: 'Misc', icons: [] };
              col.misc.icons.unshift({
                id: recoveryId,
                data: prevIcon,
                savedAt: Date.now(),
              });
              persistCollection(col);
              setCollection(col);
            }
          }
        } catch {}

        // Load the incoming icon
        if (parsed && 'frames' in parsed && Array.isArray(parsed.frames)) {
          dispatch({ type: 'LOAD_ANIMATED_ICON', icon: parsed as AnimatedPxlKitData });
        } else if (parsed && parsed.grid && parsed.palette && parsed.size) {
          dispatch({ type: 'LOAD_ICON', icon: parsed as PxlKitData });
        }
        return;
      }
    } catch {}

    // Fall back to restoring previous editor state
    try {
      const raw = localStorage.getItem(EDITOR_KEY);
      if (raw) {
        const icon = JSON.parse(raw) as PxlKitData;
        if (icon && icon.grid && icon.palette && icon.size) {
          dispatch({ type: 'LOAD_ICON', icon });
        }
      }
    } catch {}
  }, []);

  // Playback timer
  useEffect(() => {
    if (!state.animationMode || !state.isPlaying || state.frames.length <= 1) return;
    const ms = Math.round(1000 / state.fps);
    const timer = setInterval(() => dispatch({ type: 'NEXT_FRAME' }), ms);
    return () => clearInterval(timer);
  }, [state.animationMode, state.isPlaying, state.fps, state.frames.length]);

  // Build the PxlKitData from current state
  const currentIcon: PxlKitData = useMemo(() => ({
    name: state.iconName || 'unnamed',
    size: state.size,
    category: state.category || 'custom',
    grid: state.grid.map((row) => row.join('')),
    palette: state.palette,
    tags: state.tags.split(',').map((t) => t.trim()).filter(Boolean),
  }), [state.iconName, state.size, state.category, state.grid, state.palette, state.tags]);

  // Animated icon data (when in animation mode)
  const animatedIcon: AnimatedPxlKitData | null = useMemo(() => {
    if (!state.animationMode || state.frames.length === 0) return null;
    const syncedFrames = [...state.frames];
    syncedFrames[state.currentFrame] = state.grid;
    return {
      name: state.iconName || 'unnamed',
      size: state.size,
      category: state.category || 'custom',
      palette: state.palette,
      frames: syncedFrames.map((frame) => ({
        grid: frame.map((row) => row.join('')),
      })),
      frameDuration: Math.round(1000 / state.fps),
      loop: state.animLoop,
      tags: state.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
  }, [state.animationMode, state.frames, state.currentFrame, state.grid, state.iconName, state.size, state.category, state.palette, state.tags, state.fps, state.animLoop]);

  // Display frames with current grid synced
  const displayFrames = useMemo(() => {
    if (!state.animationMode || state.frames.length === 0) return state.frames;
    const f = [...state.frames];
    f[state.currentFrame] = state.grid;
    return f;
  }, [state.animationMode, state.frames, state.currentFrame, state.grid]);

  // Download animated SVG
  function handleDownloadAnimSvg() {
    if (!animatedIcon) return;
    const svg = generateAnimatedSvg(animatedIcon);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${animatedIcon.name}-animated.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch({ type: 'REDO' });
        } else {
          dispatch({ type: 'UNDO' });
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }
      // Tool shortcuts
      if (e.key === 'b' || e.key === 'p') dispatch({ type: 'SET_TOOL', tool: 'pencil' });
      if (e.key === 'e') dispatch({ type: 'SET_TOOL', tool: 'eraser' });
      if (e.key === 'g') dispatch({ type: 'SET_TOOL', tool: 'fill' });
      if (e.key === 'i') dispatch({ type: 'SET_TOOL', tool: 'eyedropper' });
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const applyTool = useCallback((x: number, y: number) => {
    switch (state.tool) {
      case 'pencil':
        dispatch({ type: 'SET_PIXEL', x, y });
        break;
      case 'eraser':
        dispatch({ type: 'ERASE_PIXEL', x, y });
        break;
      case 'fill':
        dispatch({ type: 'FILL', x, y });
        break;
      case 'eyedropper': {
        const char = state.grid[y][x];
        if (char !== '.' && state.palette[char]) {
          dispatch({ type: 'SET_ACTIVE_COLOR', char });
          dispatch({ type: 'SET_TOOL', tool: 'pencil' });
        }
        break;
      }
    }
  }, [state.tool, state.grid, state.palette]);

  // Handle cell interaction
  const handleCellDown = useCallback(
    (x: number, y: number) => {
      setIsPainting(true);
      applyTool(x, y);
    },
    [applyTool]
  );

  const handleCellEnter = useCallback(
    (x: number, y: number) => {
      if (!isPainting) return;
      if (state.tool === 'pencil') {
        dispatch({ type: 'SET_PIXEL', x, y });
      } else if (state.tool === 'eraser') {
        dispatch({ type: 'ERASE_PIXEL', x, y });
      }
    },
    [isPainting, state.tool]
  );



  // Import handler
  function handleImport() {
    setImportError('');
    const parsed = parseIconCode(importCode);
    if (parsed) {
      dispatch({ type: 'LOAD_ICON', icon: parsed });
      setActiveTab('preview');
      setImportCode('');
    } else {
      setImportError('Could not parse icon code. Check the format and try again.');
    }
  }

  // Copy code
  async function handleCopyCode() {
    const code = generateIconCode(currentIcon);
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Download SVG
  function handleDownloadSvg(mode: 'colorful' | 'monochrome') {
    const svg = gridToSvg(currentIcon, { mode, xmlDeclaration: true });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentIcon.name}-${mode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Auto-save current icon to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      try { localStorage.setItem(EDITOR_KEY, JSON.stringify(currentIcon)); } catch {}
    }, 500);
    return () => clearTimeout(timeout);
  }, [currentIcon]);

  // Download PNG
  function handleDownloadPng(pxSize: number) {
    const svg = gridToSvg(currentIcon, { mode: 'colorful', xmlDeclaration: true });
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pxSize;
      canvas.height = pxSize;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, pxSize, pxSize);
      const a = document.createElement('a');
      a.download = `${currentIcon.name}-${pxSize}x${pxSize}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  // Save icon to collection
  function handleSaveToCollection() {
    const id = `${currentIcon.name}-${Date.now()}`;
    const saved: SavedIcon = {
      id,
      data: { ...currentIcon },
      animatedData: animatedIcon || undefined,
      savedAt: Date.now(),
    };
    const updated = { ...collection };
    if (!updated[activePack]) {
      updated[activePack] = { name: activePack, icons: [] };
    }
    const existingIdx = updated[activePack].icons.findIndex(i => i.data.name === currentIcon.name);
    if (existingIdx >= 0) {
      updated[activePack].icons[existingIdx] = saved;
    } else {
      updated[activePack].icons.push(saved);
    }
    setCollection(updated);
    persistCollection(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1500);
  }

  // Remove icon from collection
  function handleRemoveIcon(packId: string, iconId: string) {
    const updated = { ...collection };
    if (updated[packId]) {
      updated[packId] = { ...updated[packId], icons: updated[packId].icons.filter(i => i.id !== iconId) };
      setCollection(updated);
      persistCollection(updated);
    }
  }

  // Load icon from collection into editor
  function handleLoadIcon(icon: SavedIcon) {
    dispatch({ type: 'LOAD_ICON', icon: icon.data });
    setActiveTab('preview');
  }

  // Create new pack
  function handleCreatePack() {
    const id = newPackName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!id || collection[id]) return;
    const updated = { ...collection, [id]: { name: newPackName, icons: [] } };
    setCollection(updated);
    persistCollection(updated);
    setActivePack(id);
    setNewPackName('');
  }

  // Delete pack
  function handleDeletePack(packId: string) {
    if (packId === 'misc') return;
    const updated = { ...collection };
    delete updated[packId];
    setCollection(updated);
    persistCollection(updated);
    if (activePack === packId) setActivePack('misc');
  }

  // Export pack as JSON
  function handleExportJSON(packId: string) {
    const pack = collection[packId];
    if (!pack || pack.icons.length === 0) return;
    const json = JSON.stringify(pack.icons.map(i => i.data), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${packId}-icons.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Export pack as TypeScript file
  function handleExportTS(packId: string) {
    const pack = collection[packId];
    if (!pack || pack.icons.length === 0) return;
    const ts = generatePackTS(pack);
    const blob = new Blob([ts], { type: 'text/typescript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${packId}-pack.ts`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Export all icons from all packs as single JSON
  function handleExportAllJSON() {
    const allIcons = Object.values(collection).flatMap(p => p.icons.map(i => i.data));
    if (allIcons.length === 0) return;
    const json = JSON.stringify(allIcons, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pxlkit-all-icons.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Responsive viewport tracking
  const [vpWidth, setVpWidth] = useState(768);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVpWidth(window.innerWidth);
    const onResize = () => setVpWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = vpWidth < 768;

  // Zoom and Scale Control
  const [zoomLevel, setZoomLevel] = useState(1);
  const maxGridPx = isMobile ? vpWidth - 64 : 320;
  // Calculate base size ensuring it fits, then apply scalar zoom. Minimum cell size is 2.
  const baseCellSize = Math.max(2, Math.min(Math.floor(maxGridPx / state.size), isMobile ? 32 : 32));
  const cellSize = Math.floor(Math.max(2, baseCellSize * zoomLevel));

  return (
    <div
      className="h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] flex flex-col md:flex-row relative"
      onMouseUp={() => setIsPainting(false)}
      onMouseLeave={() => setIsPainting(false)}
      onTouchEnd={() => setIsPainting(false)}
    >
        {/* ═══ MOBILE TOP BAR ═══ */}
        <div className="flex md:hidden items-center gap-1.5 px-2 py-1.5 border-b border-retro-border bg-retro-surface/80 backdrop-blur-sm shrink-0">
          {/* Left drawer toggle */}
          <PixelBareButton
            onClick={() => setLeftOpen(true)}
            className="shrink-0 p-1.5 rounded border border-retro-border/30 text-retro-muted hover:text-retro-green hover:border-retro-green/40 transition-all"
            title="Tools & palette"
          >
            <svg viewBox="0 0 8 8" className="w-5 h-5" fill="currentColor" shapeRendering="crispEdges">
              <rect x="0" y="1" width="8" height="1"/>
              <rect x="0" y="3" width="5" height="1"/>
              <rect x="0" y="5" width="8" height="1"/>
            </svg>
          </PixelBareButton>

          {/* Tools */}
          <div className="flex gap-0.5 shrink-0">
            {([
              { id: 'pencil' as Tool, icon: Pencil },
              { id: 'eraser' as Tool, icon: Eraser },
              { id: 'fill' as Tool, icon: PaintBucket },
              { id: 'eyedropper' as Tool, icon: Eyedropper },
            ]).map((t) => (
              <PixelBareButton
                key={t.id}
                onClick={() => dispatch({ type: 'SET_TOOL', tool: t.id })}
                className={`p-1.5 rounded text-sm transition-all ${
                  state.tool === t.id
                    ? 'bg-retro-green/20 border border-retro-green/50'
                    : 'border border-transparent'
                }`}
              >
                <PxlKitIcon icon={t.icon} size={16} colorful />
              </PixelBareButton>
            ))}
          </div>

          {/* Active color */}
          <div
            className="shrink-0 w-6 h-6 rounded border-2 border-white/50 shadow"
            style={{ backgroundColor: state.activeColor }}
          />

          {/* Undo / Redo */}
          <div className="flex gap-0.5 shrink-0">
            <PixelBareButton
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.historyIndex <= 0}
              className="px-1.5 py-1 text-xs font-mono rounded border border-retro-border/30 text-retro-muted hover:bg-retro-card disabled:opacity-30 transition-all"
            >
              <PxlKitIcon icon={Undo} size={12} />
            </PixelBareButton>
            <PixelBareButton
              onClick={() => dispatch({ type: 'REDO' })}
              disabled={state.historyIndex >= state.history.length - 1}
              className="px-1.5 py-1 text-xs font-mono rounded border border-retro-border/30 text-retro-muted hover:bg-retro-card disabled:opacity-30 transition-all"
            >
              <PxlKitIcon icon={Redo} size={12} />
            </PixelBareButton>
          </div>

          {/* Right drawer toggle */}
          <PixelBareButton
            onClick={() => setRightOpen(true)}
            className="shrink-0 ml-auto p-1.5 rounded border border-retro-border/30 text-retro-muted hover:text-retro-cyan hover:border-retro-cyan/40 transition-all"
            title="Preview & export"
          >
            <svg viewBox="0 0 8 8" className="w-5 h-5" fill="currentColor" shapeRendering="crispEdges">
              <rect x="0" y="0" width="8" height="1"/>
              <rect x="0" y="0" width="1" height="8"/>
              <rect x="7" y="0" width="1" height="8"/>
              <rect x="0" y="7" width="8" height="1"/>
              <rect x="3" y="2" width="2" height="2"/>
              <rect x="3" y="5" width="2" height="1"/>
            </svg>
          </PixelBareButton>
        </div>

        {/* Mobile backdrop (left) */}
        {leftOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-[100] transition-opacity"
            onClick={() => setLeftOpen(false)}
          />
        )}

        {/* ─── LEFT TOOLBAR ─── */}
        <aside className={`
          ${leftOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          fixed md:relative left-0 top-0 md:top-auto h-full md:h-auto
          z-[110] md:z-auto w-72 md:w-56
          border-r border-retro-border bg-retro-surface md:bg-retro-surface/50
          flex flex-col overflow-y-auto shrink-0
          transition-transform md:transition-none duration-300 ease-out
        `}>
          {/* Mobile drawer header */}
          <div className="flex md:hidden items-center justify-between p-3 border-b border-retro-border shrink-0">
            <span className="font-pixel text-[8px] text-retro-green">TOOLS & PALETTE</span>
            <PixelBareButton
              onClick={() => setLeftOpen(false)}
              className="p-1 text-retro-muted hover:text-retro-text transition-colors"
            >
              <PxlKitIcon icon={Close} size={12} />
            </PixelBareButton>
          </div>
          {/* Tools */}
          <div className="p-3 border-b border-retro-border/50">
            <p className="font-pixel text-[8px] text-retro-muted mb-2">TOOLS</p>
            <div className="grid grid-cols-4 gap-1">
              {([
                { id: 'pencil' as Tool, label: 'P', title: 'Pencil (P)', icon: Pencil },
                { id: 'eraser' as Tool, label: 'E', title: 'Eraser (E)', icon: Eraser },
                { id: 'fill' as Tool, label: 'G', title: 'Fill (G)', icon: PaintBucket },
                { id: 'eyedropper' as Tool, label: 'I', title: 'Eyedropper (I)', icon: Eyedropper },
              ]).map((t) => (
                <PixelBareButton
                  key={t.id}
                  title={t.title}
                  onClick={() => dispatch({ type: 'SET_TOOL', tool: t.id })}
                  className={`p-2 rounded text-center text-lg transition-all ${
                    state.tool === t.id
                      ? 'bg-retro-green/20 border border-retro-green/50'
                      : 'border border-retro-border/30 hover:bg-retro-card'
                  }`}
                >
                  <PxlKitIcon icon={t.icon} size={20} colorful />
                </PixelBareButton>
              ))}
            </div>
          </div>

          {/* Mirror & Actions */}
          <div className="p-3 border-b border-retro-border/50">
            <p className="font-pixel text-[8px] text-retro-muted mb-2">ACTIONS</p>
            <div className="grid grid-cols-2 gap-1">
              <PixelBareButton
                onClick={() => dispatch({ type: 'TOGGLE_MIRROR_X' })}
                className={`px-2 py-1.5 text-xs font-mono rounded border transition-all ${
                  state.mirrorX
                    ? 'bg-retro-cyan/20 border-retro-cyan/50 text-retro-cyan'
                    : 'border-retro-border/30 text-retro-muted hover:bg-retro-card'
                }`}
              >
                Mirror X
              </PixelBareButton>
              <PixelBareButton
                onClick={() => dispatch({ type: 'TOGGLE_MIRROR_Y' })}
                className={`px-2 py-1.5 text-xs font-mono rounded border transition-all ${
                  state.mirrorY
                    ? 'bg-retro-cyan/20 border-retro-cyan/50 text-retro-cyan'
                    : 'border-retro-border/30 text-retro-muted hover:bg-retro-card'
                }`}
              >
                Mirror Y
              </PixelBareButton>
              <PixelBareButton
                onClick={() => dispatch({ type: 'UNDO' })}
                disabled={state.historyIndex <= 0}
                className="px-2 py-1.5 text-xs font-mono rounded border border-retro-border/30 text-retro-muted hover:bg-retro-card disabled:opacity-30 transition-all"
              >
                Undo
              </PixelBareButton>
              <PixelBareButton
                onClick={() => dispatch({ type: 'REDO' })}
                disabled={state.historyIndex >= state.history.length - 1}
                className="px-2 py-1.5 text-xs font-mono rounded border border-retro-border/30 text-retro-muted hover:bg-retro-card disabled:opacity-30 transition-all"
              >
                Redo
              </PixelBareButton>
              <PixelBareButton
                onClick={() => dispatch({ type: 'CLEAR' })}
                className="col-span-2 px-2 py-1.5 text-xs font-mono rounded border border-retro-red/30 text-retro-red hover:bg-retro-red/10 transition-all"
              >
                Clear All
              </PixelBareButton>
            </div>
          </div>

          {/* Color Palette */}
          <div className="p-3 border-b border-retro-border/50 flex-1">
            <p className="font-pixel text-[8px] text-retro-muted mb-2">PALETTE</p>

            <div className="grid grid-cols-5 gap-1 mb-3">
              {Object.entries(state.palette).map(([char, color]) => (
                <PixelBareButton
                  key={char}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_COLOR', char })}
                  className={`relative w-8 h-8 rounded border-2 transition-all ${
                    state.activeChar === char
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-retro-border/50 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`${char}: ${color}`}
                >
                  <span className="absolute bottom-0 right-0 text-[7px] font-mono bg-black/50 px-0.5 text-white leading-none">
                    {char}
                  </span>
                </PixelBareButton>
              ))}
            </div>

            {/* Active color editor */}
            <div className="flex items-center gap-2 mb-3">
              <PixelBareInput
                type="color"
                value={state.activeColor}
                onChange={(e) =>
                  dispatch({ type: 'SET_COLOR', char: state.activeChar, color: e.target.value })
                }
                className="w-8 h-8 rounded border border-retro-border cursor-pointer"
              />
              <PixelBareInput
                type="text"
                value={state.palette[state.activeChar] || ''}
                onChange={(e) =>
                  dispatch({ type: 'SET_COLOR', char: state.activeChar, color: e.target.value })
                }
                className="flex-1 px-2 py-1 bg-retro-bg border border-retro-border rounded font-mono text-base sm:text-xs text-retro-text"
              />
            </div>

            {/* Opacity slider */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-pixel text-[7px] text-retro-muted">OPACITY</span>
                <span className="font-mono text-[10px] text-retro-muted">
                  {(() => {
                    const hex = state.palette[state.activeChar] || '';
                    const h = hex.startsWith('#') ? hex.slice(1) : hex;
                    if (h.length === 8) return `${Math.round((parseInt(h.slice(6, 8), 16) / 255) * 100)}%`;
                    return '100%';
                  })()}
                </span>
              </div>
              <PixelBareInput
                type="range"
                min="0"
                max="100"
                value={(() => {
                  const hex = state.palette[state.activeChar] || '';
                  const h = hex.startsWith('#') ? hex.slice(1) : hex;
                  if (h.length === 8) return Math.round((parseInt(h.slice(6, 8), 16) / 255) * 100);
                  return 100;
                })()}
                onChange={(e) => {
                  const opacity = parseInt(e.target.value) / 100;
                  const currentHex = state.palette[state.activeChar] || '#FFFFFF';
                  const rgb = currentHex.startsWith('#') ? currentHex.slice(1) : currentHex;
                  const baseRgb = rgb.slice(0, 6);
                  let newColor: string;
                  if (opacity >= 1) {
                    newColor = `#${baseRgb}`;
                  } else {
                    const alphaByte = Math.round(opacity * 255).toString(16).padStart(2, '0').toUpperCase();
                    newColor = `#${baseRgb}${alphaByte}`;
                  }
                  dispatch({ type: 'SET_COLOR', char: state.activeChar, color: newColor });
                }}
                className="w-full h-1.5 bg-retro-border rounded-sm appearance-none cursor-pointer accent-retro-green"
              />
            </div>

            <div className="flex gap-1 mb-4">
              <PixelBareButton
                onClick={() => dispatch({ type: 'ADD_COLOR', color: '#FFFFFF' })}
                className="flex-1 px-2 py-1 text-[10px] font-mono text-retro-green border border-retro-green/30 rounded hover:bg-retro-green/10"
              >
                + Add
              </PixelBareButton>
              {Object.keys(state.palette).length > 1 && (
                <PixelBareButton
                  onClick={() => dispatch({ type: 'REMOVE_COLOR', char: state.activeChar })}
                  className="flex-1 px-2 py-1 text-[10px] font-mono text-retro-red border border-retro-red/30 rounded hover:bg-retro-red/10"
                >
                  - Remove
                </PixelBareButton>
              )}
            </div>

            {/* Retro palette presets */}
            <p className="font-pixel text-[8px] text-retro-muted mb-2">PRESETS</p>
            <div className="space-y-2">
              {Object.entries(RETRO_PALETTES).map(([key, pal]) => (
                <div key={key}>
                  <p className="font-mono text-[9px] text-retro-muted/70 mb-1">{pal.name}</p>
                  <div className="flex flex-wrap gap-0.5">
                    {pal.colors.slice(0, 16).map((color, i) => (
                      <PixelBareButton
                        key={i}
                        onClick={() => {
                          dispatch({ type: 'SET_COLOR', char: state.activeChar, color });
                        }}
                        className="w-4 h-4 rounded-sm border border-retro-border/20 hover:scale-125 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid size */}
          <div className="p-3 border-t border-retro-border/50">
            <p className="font-pixel text-[8px] text-retro-muted mb-2">GRID SIZE</p>
            <div className="flex flex-wrap gap-1">
              {([8, 16, 24, 32, 48, 64] as GridSize[]).map((s) => (
                <PixelBareButton
                  key={s}
                  onClick={() => dispatch({ type: 'SET_SIZE', size: s })}
                  className={`flex-1 min-w-[40px] px-1.5 py-1 text-xs font-mono rounded border transition-all ${
                    state.size === s
                      ? 'bg-retro-gold/20 border-retro-gold/50 text-retro-gold'
                      : 'border-retro-border/30 text-retro-muted hover:bg-retro-card'
                  }`}
                >
                  {s}×{s}
                </PixelBareButton>
              ))}
            </div>
          </div>

          {/* Animation */}
          <div className="p-3 border-t border-retro-border/50">
            <p className="font-pixel text-[8px] text-retro-muted mb-2">ANIMATION</p>
            <PixelBareButton
              onClick={() => dispatch({ type: 'TOGGLE_ANIMATION_MODE' })}
              className={`w-full px-2 py-1.5 text-xs font-mono rounded border transition-all mb-2 ${
                state.animationMode
                  ? 'bg-retro-gold/20 border-retro-gold/50 text-retro-gold'
                  : 'border-retro-border/30 text-retro-muted hover:bg-retro-card'
              }`}
            >
              {state.animationMode ? <><PxlKitIcon icon={SparkleSmall} size={12} className="inline-block mr-1" /> Anim ON</> : 'Enable Anim'}
            </PixelBareButton>
            {state.animationMode && (
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-pixel text-[7px] text-retro-muted">FPS</span>
                    <span className="font-mono text-[10px] text-retro-gold">{state.fps}</span>
                  </div>
                  <PixelBareInput
                    type="range"
                    min="1"
                    max="24"
                    value={state.fps}
                    onChange={(e) => dispatch({ type: 'SET_FPS', fps: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-retro-border rounded-sm appearance-none cursor-pointer accent-retro-gold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <PixelBareButton
                    onClick={() => dispatch({ type: 'TOGGLE_ONION_SKIN' })}
                    className={`px-2 py-1.5 text-[10px] font-mono rounded border transition-all ${
                      state.onionSkin
                        ? 'bg-retro-cyan/20 border-retro-cyan/50 text-retro-cyan'
                        : 'border-retro-border/30 text-retro-muted hover:bg-retro-card'
                    }`}
                  >
                    Onion
                  </PixelBareButton>
                  <PixelBareButton
                    onClick={() => dispatch({ type: 'TOGGLE_ANIM_LOOP' })}
                    className={`px-2 py-1.5 text-[10px] font-mono rounded border transition-all ${
                      state.animLoop
                        ? 'bg-retro-cyan/20 border-retro-cyan/50 text-retro-cyan'
                        : 'border-retro-border/30 text-retro-muted hover:bg-retro-card'
                    }`}
                  >
                    Loop
                  </PixelBareButton>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─── CENTER: CANVAS ─── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-retro-bg overflow-auto p-2 md:p-4 min-h-0 relative">
          
          {/* Zoom Controls */}
          <div className="absolute right-4 bottom-4 flex md:flex-col gap-1 z-10 p-1 md:p-2 bg-retro-surface/80 backdrop-blur-sm border border-retro-border rounded">
            <PixelBareButton onClick={() => setZoomLevel(z => Math.min(5, z + 0.25))} className="p-1 px-[10px] text-lg font-bold text-retro-cyan hover:bg-retro-cyan/10 rounded" title="Zoom In">
              +
            </PixelBareButton>
            <PixelBareButton onClick={() => setZoomLevel(1)} className="p-1 px-1 text-[10px] text-retro-muted hover:text-retro-cyan font-mono text-center" title="Reset Zoom">
              {Math.round(zoomLevel * 100)}%
            </PixelBareButton>
            <PixelBareButton onClick={() => setZoomLevel(z => Math.max(0.25, z - 0.25))} className="p-1 px-[10px] text-lg font-bold text-retro-cyan hover:bg-retro-cyan/10 rounded" title="Zoom Out">
              -
            </PixelBareButton>
          </div>

          <div className="flex flex-col items-center justify-center m-auto p-4 shrink-0">
            {/* Column numbers */}
            <div className="flex mb-1" style={{ marginLeft: '20px' }}>
              {Array.from({ length: state.size }, (_, i) => (
                <div
                  key={i}
                  className="text-[8px] font-mono text-retro-muted/40 text-center"
                  style={{ width: cellSize }}
                >
                  {i}
                </div>
              ))}
            </div>

          <div className="flex">
            {/* Row numbers */}
            <div className="flex flex-col mr-1">
              {Array.from({ length: state.size }, (_, i) => (
                <div
                  key={i}
                  className="text-[8px] font-mono text-retro-muted/40 flex items-center justify-end pr-1"
                  style={{ height: cellSize, width: 16 }}
                >
                  {i}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div
              ref={gridContainerRef}
              className="grid border border-retro-border/50 bg-retro-surface/30 touch-none"
              style={{
                gridTemplateColumns: `repeat(${state.size}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${state.size}, ${cellSize}px)`,
              }}
              onTouchStart={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const touch = e.touches[0];
                const x = Math.floor((touch.clientX - rect.left) / cellSize);
                const y = Math.floor((touch.clientY - rect.top) / cellSize);
                if (x >= 0 && x < state.size && y >= 0 && y < state.size) {
                  e.preventDefault();
                  setIsPainting(true);
                  applyTool(x, y);
                }
              }}
              onTouchMove={(e) => {
                if (!isPainting) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const touch = e.touches[0];
                const x = Math.floor((touch.clientX - rect.left) / cellSize);
                const y = Math.floor((touch.clientY - rect.top) / cellSize);
                if (x >= 0 && x < state.size && y >= 0 && y < state.size) {
                  e.preventDefault();
                  if (state.tool === 'pencil') dispatch({ type: 'SET_PIXEL', x, y });
                  else if (state.tool === 'eraser') dispatch({ type: 'ERASE_PIXEL', x, y });
                }
              }}
            >
              {state.grid.flatMap((row, y) =>
                row.map((char, x) => {
                  const rawColor = char !== '.' ? state.palette[char] : undefined;
                  const isTransparent = !rawColor;
                  // Parse #RRGGBBAA for display
                  let displayColor = rawColor;
                  let cellOpacity = 1;
                  if (rawColor) {
                    const h = rawColor.startsWith('#') ? rawColor.slice(1) : rawColor;
                    if (h.length === 8) {
                      displayColor = `#${h.slice(0, 6)}`;
                      cellOpacity = parseInt(h.slice(6, 8), 16) / 255;
                    }
                  }
                  // Onion skin: show previous frame in transparent cells
                  let onionColor: string | undefined;
                  if (isTransparent && state.animationMode && state.onionSkin && state.currentFrame > 0 && !state.isPlaying) {
                    const prevChar = state.frames[state.currentFrame - 1]?.[y]?.[x];
                    if (prevChar && prevChar !== '.' && state.palette[prevChar]) {
                      onionColor = state.palette[prevChar].slice(0, 7);
                    }
                  }
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`grid-cell ${isTransparent && !onionColor ? 'bg-transparent' : ''}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: onionColor || displayColor || undefined,
                        opacity: onionColor ? 0.3 : (isTransparent ? 1 : cellOpacity),
                        backgroundImage: isTransparent && !onionColor
                          ? 'linear-gradient(45deg, rgb(var(--retro-card)) 25%, transparent 25%, transparent 75%, rgb(var(--retro-card)) 75%), linear-gradient(45deg, rgb(var(--retro-card)) 25%, transparent 25%, transparent 75%, rgb(var(--retro-card)) 75%)'
                          : undefined,
                        backgroundSize: isTransparent && !onionColor ? `${cellSize/2}px ${cellSize/2}px` : undefined,
                        backgroundPosition: isTransparent && !onionColor
                          ? `0 0, ${cellSize/4}px ${cellSize/4}px`
                          : undefined,
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleCellDown(x, y);
                      }}
                      onMouseEnter={() => handleCellEnter(x, y)}
                    />
                  );
                })
              )}
            </div>
          </div>
          </div>

          {/* Coordinates display */}
          <div className="mt-3 font-mono text-[10px] text-retro-muted/50">
            {state.size}×{state.size} grid &middot; {state.tool} tool &middot;{' '}
            {state.grid.flat().filter((c) => c !== '.').length} pixels drawn
            {state.animationMode && (
              <> &middot; Frame {state.currentFrame + 1}/{state.frames.length} &middot; {state.fps} FPS</>
            )}
          </div>

          {/* Frame timeline */}
          {state.animationMode && (
            <div className="mt-3 md:mt-4 w-full max-w-lg px-2 md:px-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                <span className="font-pixel text-[8px] text-retro-gold">FRAMES</span>
                <div className="flex gap-1 flex-wrap">
                  <PixelBareButton
                    onClick={() => dispatch({ type: 'TOGGLE_PLAYING' })}
                    className={`px-2 py-1 text-[10px] font-mono rounded border transition-all ${
                      state.isPlaying
                        ? 'bg-retro-gold/20 border-retro-gold/50 text-retro-gold'
                        : 'border-retro-border/30 text-retro-muted hover:bg-retro-card'
                    }`}
                  >
                    {state.isPlaying ? <PxlKitIcon icon={Pause} size={12} /> : <PxlKitIcon icon={Play} size={12} />}
                  </PixelBareButton>
                  <PixelBareButton
                    onClick={() => dispatch({ type: 'ADD_FRAME' })}
                    className="px-2 py-1 text-[10px] font-mono text-retro-green border border-retro-green/30 rounded hover:bg-retro-green/10"
                  >
                    + New
                  </PixelBareButton>
                  <PixelBareButton
                    onClick={() => dispatch({ type: 'ADD_FRAME', copy: true })}
                    className="px-2 py-1 text-[10px] font-mono text-retro-cyan border border-retro-cyan/30 rounded hover:bg-retro-cyan/10"
                  >
                    Copy
                  </PixelBareButton>
                  <PixelBareButton
                    onClick={() => dispatch({ type: 'DUPLICATE_FRAME' })}
                    className="px-2 py-1 text-[10px] font-mono text-retro-muted border border-retro-border/30 rounded hover:bg-retro-card"
                  >
                    Dup
                  </PixelBareButton>
                  {state.frames.length > 1 && (
                    <PixelBareButton
                      onClick={() => dispatch({ type: 'DELETE_FRAME' })}
                      className="px-2 py-1 text-[10px] font-mono text-retro-red border border-retro-red/30 rounded hover:bg-retro-red/10"
                    >
                      Del
                    </PixelBareButton>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {displayFrames.map((frame, i) => {
                  const isActive = i === state.currentFrame;
                  const thumbPx = state.size <= 8 ? 4 : state.size <= 16 ? 2 : state.size <= 32 ? 1.5 : 1;
                  return (
                    <PixelBareButton
                      key={i}
                      onClick={() => dispatch({ type: 'SET_CURRENT_FRAME', index: i })}
                      className={`shrink-0 p-1 rounded border-2 transition-all ${
                        isActive
                          ? 'border-retro-gold shadow-lg shadow-retro-gold/20'
                          : 'border-retro-border/30 hover:border-retro-border'
                      }`}
                    >
                      <div
                        className="grid bg-retro-surface/50"
                        style={{
                          gridTemplateColumns: `repeat(${state.size}, ${thumbPx}px)`,
                          gridTemplateRows: `repeat(${state.size}, ${thumbPx}px)`,
                        }}
                      >
                        {frame.flatMap((row, y) =>
                          row.map((char, x) => (
                            <div
                              key={`t${i}-${x}-${y}`}
                              style={{
                                width: thumbPx,
                                height: thumbPx,
                                backgroundColor:
                                  char !== '.' && state.palette[char]
                                    ? state.palette[char].slice(0, 7)
                                    : 'transparent',
                              }}
                            />
                          ))
                        )}
                      </div>
                      <span className="block text-center font-mono text-[8px] text-retro-muted mt-0.5">
                        {i + 1}
                      </span>
                    </PixelBareButton>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mobile backdrop (right) */}
        {rightOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-[100] transition-opacity"
            onClick={() => setRightOpen(false)}
          />
        )}

        {/* ─── RIGHT PANEL ─── */}
        <aside className={`
          ${rightOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0
          fixed md:relative right-0 top-0 md:top-auto h-full md:h-auto
          z-[110] md:z-auto w-80
          border-l border-retro-border bg-retro-surface md:bg-retro-surface/50
          flex flex-col overflow-y-auto shrink-0
          transition-transform md:transition-none duration-300 ease-out
        `}>
          {/* Mobile drawer header */}
          <div className="flex md:hidden items-center justify-between p-3 border-b border-retro-border shrink-0">
            <span className="font-pixel text-[8px] text-retro-cyan">PREVIEW & EXPORT</span>
            <PixelBareButton
              onClick={() => setRightOpen(false)}
              className="p-1 text-retro-muted hover:text-retro-text transition-colors"
            >
              <PxlKitIcon icon={Close} size={12} />
            </PixelBareButton>
          </div>
          {/* Icon metadata */}
          <div className="p-3 border-b border-retro-border/50 space-y-2">
            <div>
              <label className="font-pixel text-[8px] text-retro-muted block mb-1">NAME</label>
              <PixelBareInput
                type="text"
                value={state.iconName}
                onChange={(e) => dispatch({ type: 'SET_NAME', name: e.target.value })}
                className="w-full px-2 py-1.5 bg-retro-bg border border-retro-border rounded font-mono text-base sm:text-xs text-retro-text"
                placeholder="my-icon"
              />
            </div>
            <div>
              <label className="font-pixel text-[8px] text-retro-muted block mb-1">CATEGORY</label>
              <PixelBareInput
                type="text"
                value={state.category}
                onChange={(e) => dispatch({ type: 'SET_CATEGORY', category: e.target.value })}
                className="w-full px-2 py-1.5 bg-retro-bg border border-retro-border rounded font-mono text-base sm:text-xs text-retro-text"
                placeholder="gamification"
              />
            </div>
            <div>
              <label className="font-pixel text-[8px] text-retro-muted block mb-1">TAGS</label>
              <PixelBareInput
                type="text"
                value={state.tags}
                onChange={(e) => dispatch({ type: 'SET_TAGS', tags: e.target.value })}
                className="w-full px-2 py-1.5 bg-retro-bg border border-retro-border rounded font-mono text-base sm:text-xs text-retro-text"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-retro-border/50">
            {(['preview', 'code', 'import', 'collection'] as TabId[]).map((tab) => {
              const totalSaved = Object.values(collection).reduce((s, p) => s + p.icons.length, 0);
              return (
                <PixelBareButton
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-2 py-2 text-[10px] font-mono uppercase transition-all ${
                    activeTab === tab
                      ? 'text-retro-green border-b-2 border-retro-green bg-retro-green/5'
                      : 'text-retro-muted hover:text-retro-text'
                  }`}
                >
                  {tab}{tab === 'collection' && totalSaved > 0 ? ` (${totalSaved})` : ''}
                </PixelBareButton>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === 'preview' && (
              <div className="space-y-4">
                {state.animationMode && animatedIcon && (
                  <div>
                    <p className="font-pixel text-[8px] text-retro-gold mb-2">ANIMATED PREVIEW</p>
                    <div className="flex items-center justify-center gap-4 p-4 bg-retro-bg rounded-lg border border-retro-gold/30">
                      <AnimatedPxlKitIcon icon={animatedIcon} size={48} colorful />
                      <AnimatedPxlKitIcon icon={animatedIcon} size={64} colorful />
                    </div>
                  </div>
                )}
                <div>
                  <p className="font-pixel text-[8px] text-retro-muted mb-2">COLORFUL</p>
                  <div className="flex items-end gap-3 p-4 bg-retro-bg rounded-lg border border-retro-border/30">
                    <PxlKitIcon icon={currentIcon} size={24} colorful />
                    <PxlKitIcon icon={currentIcon} size={32} colorful />
                    <PxlKitIcon icon={currentIcon} size={48} colorful />
                    <PxlKitIcon icon={currentIcon} size={64} colorful />
                  </div>
                </div>
                <div>
                  <p className="font-pixel text-[8px] text-retro-muted mb-2">MONOCHROME</p>
                  <div className="flex items-end gap-3 p-4 bg-retro-bg rounded-lg border border-retro-border/30">
                    <div className="text-retro-green">
                      <PxlKitIcon icon={currentIcon} size={32} />
                    </div>
                    <div className="text-retro-cyan">
                      <PxlKitIcon icon={currentIcon} size={32} />
                    </div>
                    <div className="text-retro-red">
                      <PxlKitIcon icon={currentIcon} size={32} />
                    </div>
                    <div className="text-retro-gold">
                      <PxlKitIcon icon={currentIcon} size={32} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-pixel text-[8px] text-retro-muted mb-2">ON WHITE</p>
                  <div className="flex items-end gap-3 p-4 bg-white rounded-lg">
                    <PxlKitIcon icon={currentIcon} size={48} colorful />
                    <PxlKitIcon icon={currentIcon} size={48} color="#333333" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {state.animationMode && (
                    <PixelBareButton
                      onClick={handleDownloadAnimSvg}
                      className="flex-1 px-3 py-2 font-mono text-xs text-retro-gold border border-retro-gold/30 rounded hover:bg-retro-gold/10 transition-all"
                    >
                      Anim SVG
                    </PixelBareButton>
                  )}
                  <PixelBareButton
                    onClick={() => handleDownloadSvg('colorful')}
                    className="flex-1 px-3 py-2 font-mono text-xs text-retro-green border border-retro-green/30 rounded hover:bg-retro-green/10 transition-all"
                  >
                    SVG Color
                  </PixelBareButton>
                  <PixelBareButton
                    onClick={() => handleDownloadSvg('monochrome')}
                    className="flex-1 px-3 py-2 font-mono text-xs text-retro-cyan border border-retro-cyan/30 rounded hover:bg-retro-cyan/10 transition-all"
                  >
                    SVG Mono
                  </PixelBareButton>
                </div>
                {/* PNG Export */}
                <div>
                  <p className="font-pixel text-[8px] text-retro-muted mb-2">PNG EXPORT</p>
                  <div className="flex gap-1.5">
                    {[64, 128, 256, 512].map((s) => (
                      <PixelBareButton
                        key={s}
                        onClick={() => handleDownloadPng(s)}
                        className="flex-1 px-2 py-1.5 text-[10px] font-mono text-retro-purple border border-retro-purple/30 rounded hover:bg-retro-purple/10 transition-all"
                      >
                        {s}px
                      </PixelBareButton>
                    ))}
                  </div>
                </div>
                {/* Save to Collection */}
                <div className="border-t border-retro-border/30 pt-4">
                  <p className="font-pixel text-[8px] text-retro-muted mb-2">SAVE TO COLLECTION</p>
                  <div className="flex gap-1.5 mb-2">
                    <select
                      value={activePack}
                      onChange={(e) => setActivePack(e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-retro-bg border border-retro-border rounded font-mono text-xs text-retro-text"
                    >
                      {Object.entries(collection).map(([id, pack]) => (
                        <option key={id} value={id}>{pack.name} ({pack.icons.length})</option>
                      ))}
                    </select>
                  </div>
                  <PixelBareButton
                    onClick={handleSaveToCollection}
                    className={`w-full px-3 py-2 font-mono text-xs rounded border transition-all ${
                      savedFeedback
                        ? 'text-retro-green border-retro-green/50 bg-retro-green/10'
                        : 'text-retro-gold border-retro-gold/30 hover:bg-retro-gold/10'
                    }`}
                  >
                    {savedFeedback ? <><PxlKitIcon icon={Check} size={10} className="inline-block mr-1" /> Saved!</> : <><PxlKitIcon icon={SparkleSmall} size={10} className="inline-block mr-1" /> Save Icon</>}
                  </PixelBareButton>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-pixel text-[8px] text-retro-muted">TYPESCRIPT</p>
                  <PixelBareButton
                    onClick={handleCopyCode}
                    className="font-mono text-[10px] text-retro-green hover:underline"
                  >
                    {copied ? <><PxlKitIcon icon={Check} size={10} className="inline-block mr-1" /> Copied!</> : 'Copy'}
                  </PixelBareButton>
                </div>
                <pre className="code-block text-[10px] leading-relaxed max-h-[500px] overflow-auto">
                  <code className="text-retro-text/80">
                    {generateIconCode(currentIcon)}
                  </code>
                </pre>
                <div>
                  <p className="font-pixel text-[8px] text-retro-muted mb-1">JSON (AI FRIENDLY)</p>
                  <pre className="code-block text-[10px] leading-relaxed max-h-[200px] overflow-auto">
                    <code className="text-retro-text/80">
                      {JSON.stringify(currentIcon, null, 2)}
                    </code>
                  </pre>
                </div>
                {state.animationMode && animatedIcon && (
                  <div>
                    <p className="font-pixel text-[8px] text-retro-gold mb-1">ANIMATED JSON</p>
                    <pre className="code-block text-[10px] leading-relaxed max-h-[200px] overflow-auto">
                      <code className="text-retro-text/80">
                        {JSON.stringify(animatedIcon, null, 2)}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'import' && (
              <div className="space-y-3">
                <p className="font-mono text-xs text-retro-muted leading-relaxed">
                  Paste a PxlKitData JSON or TypeScript export below. You can
                  generate this with any AI — use the prompt template from the
                  landing page.
                </p>
                <PixelBareTextarea
                  value={importCode}
                  onChange={(e) => {
                    setImportCode(e.target.value);
                    setImportError('');
                  }}
                  placeholder={`{
  "name": "my-icon",
  "size": 16,
  "category": "custom",
  "grid": [...],
  "palette": {...},
  "tags": [...]
}`}
                  className="w-full h-48 bg-retro-bg border border-retro-border rounded-lg p-3 font-mono text-base sm:text-xs text-retro-text resize-none focus:outline-none focus:border-retro-cyan/50"
                />
                {importError && (
                  <p className="text-retro-red font-mono text-xs">{importError}</p>
                )}
                <PixelBareButton
                  onClick={handleImport}
                  className="w-full px-3 py-2 font-mono text-xs text-retro-cyan border border-retro-cyan/30 rounded hover:bg-retro-cyan/10 transition-all"
                >
                  Load Icon
                </PixelBareButton>
                <div className="border-t border-retro-border/30 pt-3 mt-3">
                  <p className="font-pixel text-[8px] text-retro-muted mb-2">AI PROMPT TIP</p>
                  <p className="font-mono text-[10px] text-retro-muted/70 leading-relaxed">
                    Ask an AI: &quot;Generate a 16×16 pixel art [description] icon as a JSON
                    with name, size (16), category, grid (16 strings of 16 chars where
                    . is transparent), palette (char → hex color map), and tags.&quot;
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'collection' && (
              <div className="space-y-4">
                {/* Create new pack */}
                <div>
                  <p className="font-pixel text-[8px] text-retro-muted mb-2">NEW PACK</p>
                  <div className="flex gap-1.5">
                    <PixelBareInput
                      type="text"
                      value={newPackName}
                      onChange={(e) => setNewPackName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreatePack()}
                      placeholder="Pack name..."
                      className="flex-1 px-2 py-1.5 bg-retro-bg border border-retro-border rounded font-mono text-base sm:text-xs text-retro-text"
                    />
                    <PixelBareButton
                      onClick={handleCreatePack}
                      disabled={!newPackName.trim()}
                      className="px-3 py-1.5 text-xs font-mono text-retro-green border border-retro-green/30 rounded hover:bg-retro-green/10 disabled:opacity-30 transition-all"
                    >
                      Create
                    </PixelBareButton>
                  </div>
                </div>

                {/* Pack list */}
                {Object.entries(collection).map(([packId, pack]) => (
                  <div key={packId} className="border border-retro-border/30 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-retro-surface/50">
                      <div>
                        <span className="font-pixel text-[9px] text-retro-gold">{pack.name.toUpperCase()}</span>
                        <span className="ml-2 font-mono text-[9px] text-retro-muted">{pack.icons.length} icons</span>
                      </div>
                      <div className="flex gap-1">
                        {pack.icons.length > 0 && (
                          <>
                            <PixelBareButton
                              onClick={() => handleExportJSON(packId)}
                              className="px-1.5 py-0.5 text-[9px] font-mono text-retro-cyan border border-retro-cyan/30 rounded hover:bg-retro-cyan/10 transition-all"
                              title="Export as JSON"
                            >
                              JSON
                            </PixelBareButton>
                            <PixelBareButton
                              onClick={() => handleExportTS(packId)}
                              className="px-1.5 py-0.5 text-[9px] font-mono text-retro-green border border-retro-green/30 rounded hover:bg-retro-green/10 transition-all"
                              title="Export as TypeScript pack"
                            >
                              .TS
                            </PixelBareButton>
                          </>
                        )}
                        {packId !== 'misc' && (
                          <PixelBareButton
                            onClick={() => handleDeletePack(packId)}
                            className="px-1.5 py-0.5 text-[9px] font-mono text-retro-red border border-retro-red/30 rounded hover:bg-retro-red/10 transition-all"
                            title="Delete pack"
                          >
                            <PxlKitIcon icon={Close} size={8} />
                          </PixelBareButton>
                        )}
                      </div>
                    </div>
                    {pack.icons.length === 0 ? (
                      <div className="px-3 py-4 text-center">
                        <p className="font-mono text-[10px] text-retro-muted/50">No icons yet — save one from the Preview tab</p>
                      </div>
                    ) : (
                      <div className="p-2 grid grid-cols-4 gap-1">
                        {pack.icons.map((saved) => (
                          <div key={saved.id} className="group relative">
                            <PixelBareButton
                              onClick={() => handleLoadIcon(saved)}
                              className="w-full p-2 rounded border border-retro-border/20 hover:border-retro-green/40 hover:bg-retro-green/5 transition-all flex flex-col items-center gap-1"
                              title={`Load ${saved.data.name}`}
                            >
                              <PxlKitIcon icon={saved.data} size={24} colorful />
                              <span className="font-mono text-[7px] text-retro-muted truncate w-full text-center">{saved.data.name}</span>
                            </PixelBareButton>
                            <PixelBareButton
                              onClick={() => handleRemoveIcon(packId, saved.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-retro-red/80 text-white text-[8px] items-center justify-center hidden group-hover:flex transition-all"
                              title="Remove"
                            >
                              ×
                            </PixelBareButton>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Export all */}
                {Object.values(collection).some(p => p.icons.length > 0) && (
                  <div className="border-t border-retro-border/30 pt-3">
                    <PixelBareButton
                      onClick={handleExportAllJSON}
                      className="w-full px-3 py-2 font-mono text-xs text-retro-cyan border border-retro-cyan/30 rounded hover:bg-retro-cyan/10 transition-all"
                    >
                      Export All Icons (JSON)
                    </PixelBareButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
    </div>
  );
}
