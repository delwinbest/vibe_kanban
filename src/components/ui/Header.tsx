import React from 'react';
import { Board as BoardType } from '../../types';

interface HeaderProps {
  board: BoardType | null;
}

const Header: React.FC<HeaderProps> = ({ board }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {board ? board.name : 'Vibe Kanban'}
            </h1>
            {board && (
              <span className="text-sm text-gray-500">
                Last updated: {new Date(board.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="btn-secondary">
              Export Board
            </button>
            <button className="btn-secondary">
              Import Board
            </button>
            <button className="btn-primary">
              Add Column
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
