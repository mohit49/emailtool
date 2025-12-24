'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Settings, Trash2, X } from 'lucide-react';

interface ElementToolbarProps {
  toolbarPosition: { top: number; left: number };
  selectedElementId: string;
  moveElementSibling: (selector: string, direction: 'up' | 'down') => void;
  openCssEditor: () => void;
  deleteSelectedElement: () => void;
  onClose: () => void;
}

const ElementToolbar: React.FC<ElementToolbarProps> = ({
  toolbarPosition,
  selectedElementId,
  moveElementSibling,
  openCssEditor,
  deleteSelectedElement,
  onClose,
}) => {
  return (
    <div
      className="fixed bg-white border border-gray-300 rounded-lg shadow-xl flex items-center gap-1 px-2 py-1.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
      style={{
        top: `${toolbarPosition.top}px`,
        left: `${toolbarPosition.left}px`,
        zIndex: 999999,
      }}
    >
      {/* Move Up */}
      <button
        onClick={() => moveElementSibling(selectedElementId, 'up')}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Move Up"
      >
        <ArrowUp size={16} />
      </button>
      {/* Move Down */}
      <button
        onClick={() => moveElementSibling(selectedElementId, 'down')}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Move Down"
      >
        <ArrowDown size={16} />
      </button>
      
      <div className="w-px h-4 bg-gray-200 mx-1"></div>

      <button
        onClick={openCssEditor}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
        title="Edit CSS"
      >
        <Settings size={16} />
        <span className="font-medium">Edit CSS</span>
      </button>

      <div className="w-px h-4 bg-gray-200 mx-1"></div>

      <button
        onClick={deleteSelectedElement}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete Element"
      >
        <Trash2 size={16} />
      </button>

      <div className="w-px h-4 bg-gray-200 mx-1"></div>

      <button
        onClick={onClose}
        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
        title="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ElementToolbar;

