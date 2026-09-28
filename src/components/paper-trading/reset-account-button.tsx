"use client";

import { useState } from "react";

interface Props {
  onConfirm: () => void;
}

export function ResetAccountButton({ onConfirm }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 rounded border border-red-500/40 text-red-400 text-xs font-mono uppercase hover:bg-red-500/10 transition-colors"
        aria-label="Reset paper trading account"
      >
        RESET PAPER ACCOUNT
      </button>

      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm account reset"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onKeyDown={(e) => { if (e.key === "Escape") setShowConfirm(false); }}
          tabIndex={-1}
        >
          <div className="bg-[#121212] border border-[#2b2b2b] rounded p-6 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-white font-semibold text-sm uppercase">Reset Paper Account?</h2>
            <p className="text-zinc-400 text-xs">
              This will delete all open positions, trade history, and reset virtual balance to{" "}
              <span className="font-mono text-white">$10,000.00</span>.
            </p>
            <p className="text-zinc-500 text-xs">
              This action cannot be undone. Your connected wallet and real funds are not affected.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded text-xs font-mono text-zinc-400 border border-[#2b2b2b] hover:border-zinc-600 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded text-xs font-mono text-white bg-red-600 hover:bg-red-500 transition-colors"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
