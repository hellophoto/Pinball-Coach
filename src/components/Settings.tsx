import React, { useState } from 'react';
import type { TableStrategy } from '../types';
import { getTableStrategies, saveTableStrategy, deleteTableStrategy } from '../utils';

export const Settings: React.FC = () => {
  const [strategies, setStrategies] = useState<Record<string, TableStrategy>>(getTableStrategies());
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TableStrategy>({
    table: '',
    skillShot: '',
    modes: '',
    multiballs: '',
    tips: '',
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNewStrategy = () => {
    setIsEditing('new');
    setEditForm({
      table: '',
      skillShot: '',
      modes: '',
      multiballs: '',
      tips: '',
    });
  };

  const handleEditStrategy = (tableName: string) => {
    const strategy = strategies[tableName];
    if (strategy) {
      setIsEditing(tableName);
      setEditForm(strategy);
    }
  };

  const handleSaveStrategy = () => {
    if (!editForm.table.trim()) {
      setErrorMessage('Table name is required');
      return;
    }

    saveTableStrategy(editForm);
    setStrategies(getTableStrategies());
    setIsEditing(null);
    setErrorMessage(null);
    setEditForm({
      table: '',
      skillShot: '',
      modes: '',
      multiballs: '',
      tips: '',
    });
  };

  const handleDeleteStrategy = (tableName: string) => {
    deleteTableStrategy(tableName);
    setStrategies(getTableStrategies());
    setConfirmDelete(null);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setErrorMessage(null);
    setEditForm({
      table: '',
      skillShot: '',
      modes: '',
      multiballs: '',
      tips: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Table Strategies</h2>
        {!isEditing && (
          <button
            onClick={handleNewStrategy}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            + Add Strategy
          </button>
        )}
      </div>

      {/* Edit/Add Form */}
      {isEditing && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">
            {isEditing === 'new' ? 'Add New Strategy' : 'Edit Strategy'}
          </h3>
          
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 bg-red-900/30 border border-red-600 rounded p-3">
              <p className="text-red-200 text-sm">{errorMessage}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Table Name</label>
              <input
                type="text"
                value={editForm.table}
                onChange={(e) => setEditForm({ ...editForm, table: e.target.value })}
                disabled={isEditing !== 'new'}
                className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="e.g., Medieval Madness"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Skill Shot</label>
              <textarea
                value={editForm.skillShot}
                onChange={(e) => setEditForm({ ...editForm, skillShot: e.target.value })}
                rows={2}
                className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the skill shot strategy..."
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Modes</label>
              <textarea
                value={editForm.modes}
                onChange={(e) => setEditForm({ ...editForm, modes: e.target.value })}
                rows={3}
                className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe mode strategy..."
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Multiballs</label>
              <textarea
                value={editForm.multiballs}
                onChange={(e) => setEditForm({ ...editForm, multiballs: e.target.value })}
                rows={2}
                className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe multiball strategy..."
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Tips</label>
              <textarea
                value={editForm.tips}
                onChange={(e) => setEditForm({ ...editForm, tips: e.target.value })}
                rows={3}
                className="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="General gameplay tips..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveStrategy}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Save Strategy
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategies List */}
      {!isEditing && (
        <div className="space-y-3">
          {Object.keys(strategies).length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">No strategies yet. Add your first strategy!</p>
            </div>
          ) : (
            Object.entries(strategies)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([tableName, strategy]) => (
                <div key={tableName} className="bg-gray-800 rounded-lg p-4 shadow-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white">{strategy.table}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditStrategy(tableName)}
                        className="text-blue-400 hover:text-blue-300 p-2"
                        title="Edit strategy"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(tableName)}
                        className="text-gray-400 hover:text-red-400 p-2"
                        title="Delete strategy"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {strategy.skillShot && (
                      <div>
                        <span className="text-blue-400 font-semibold">Skill Shot: </span>
                        <span className="text-gray-300">{strategy.skillShot}</span>
                      </div>
                    )}
                    {strategy.modes && (
                      <div>
                        <span className="text-blue-400 font-semibold">Modes: </span>
                        <span className="text-gray-300">{strategy.modes}</span>
                      </div>
                    )}
                    {strategy.multiballs && (
                      <div>
                        <span className="text-blue-400 font-semibold">Multiballs: </span>
                        <span className="text-gray-300">{strategy.multiballs}</span>
                      </div>
                    )}
                    {strategy.tips && (
                      <div>
                        <span className="text-blue-400 font-semibold">Tips: </span>
                        <span className="text-gray-300">{strategy.tips}</span>
                      </div>
                    )}
                  </div>

                  {/* Delete Confirmation */}
                  {confirmDelete === tableName && (
                    <div className="mt-3 bg-red-900/30 border border-red-600 rounded p-3">
                      <p className="text-white text-sm mb-3">
                        Are you sure you want to delete this strategy?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteStrategy(tableName)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};
