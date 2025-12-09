"use client";

export default function Dialog({ isOpen, title, message, onClose, onConfirm, confirmText = "OK", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-center">
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        <p className="mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          {onClose && (
            <button
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
