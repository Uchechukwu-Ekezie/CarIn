'use client';

import { useState } from 'react';
import { useStacksAuth } from '@/lib/providers/AppKitProvider';
import { useDisputeResolution } from '@/lib/hooks/useDisputeResolution';
import { EvidenceType, uploadEvidenceToIPFS, ipfsHashToBytes, validateEvidence, formatEvidenceType } from '@/lib/utils/evidenceHandler';

interface FileDisputeFormProps {
  escrowId: string;
  bookingId: string;
  onSuccess?: (disputeId: string) => void;
  onCancel?: () => void;
}

export default function FileDisputeForm({ escrowId, bookingId, onSuccess, onCancel }: FileDisputeFormProps) {
  const { stxAddress: address } = useStacksAuth();
  const { fileDispute, isPending } = useDisputeResolution();
  const [reason, setReason] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>(EvidenceType.Other);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateEvidence(evidenceType, file, evidenceDescription);
      if (!validation.valid) {
        setError(validation.error || 'Invalid evidence');
        return;
      }
      setEvidenceFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError('Please connect your Stacks wallet');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a clear reason for this dispute');
      return;
    }

    try {
      let evidenceHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

      if (evidenceFile) {
        setUploading(true);
        const ipfsHash = await uploadEvidenceToIPFS(evidenceFile, evidenceType);
        evidenceHash = ipfsHashToBytes(ipfsHash);
        setUploading(false);
      } else if (evidenceType === EvidenceType.CheckInTimestamp || evidenceType === EvidenceType.CheckOutTimestamp) {
        evidenceHash = '0x' + BigInt(Math.floor(Date.now() / 1000)).toString(16).padStart(64, '0');
      }

      await fileDispute(escrowId, bookingId, reason, evidenceHash, evidenceType);
      if (onSuccess) onSuccess("NEW-DISP-" + Date.now());
    } catch (err: any) {
      setError(err.message || 'Failed to file dispute');
      setUploading(false);
    }
  };

  return (
    <div className="glass-card border border-white/10 rounded-[3rem] overflow-hidden animate-fade-in-up">
      <div className="p-10 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Open Case</h2>
        <p className="text-gray-500">Initiate a decentralized dispute resolution for Booking #{bookingId}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-8">
          <div>
            <label htmlFor="reason" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Case Statement
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="evidenceType" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Evidence Category
              </label>
              <select
                id="evidenceType"
                value={evidenceType}
                onChange={(e) => setEvidenceType(Number(e.target.value) as EvidenceType)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
              >
                {Object.values(EvidenceType)
                  .filter((v) => !isNaN(Number(v)))
                  .map((type) => (
                    <option key={type} value={type} className="bg-[#111] text-white">
                      {formatEvidenceType(Number(type) as EvidenceType)}
                    </option>
                  ))}
              </select>
            </div>

            {(evidenceType === EvidenceType.Image ||
              evidenceType === EvidenceType.Video ||
              evidenceType === EvidenceType.Document) && (
                <div>
                  <label htmlFor="evidenceFile" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Upload Payload
                  </label>
                  <div className="relative group">
                    <input
                      id="evidenceFile"
                      type="file"
                      onChange={handleFileChange}
                      accept={
                        evidenceType === EvidenceType.Image
                          ? 'image/*'
                          : evidenceType === EvidenceType.Video
                            ? 'video/*'
                            : 'application/pdf,application/msword,.doc,.docx'
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="px-6 py-4 bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-between group-hover:border-indigo-500/50 transition-colors">
                      <span className="text-gray-500 text-sm truncate max-w-[150px]">
                        {evidenceFile ? evidenceFile.name : `Select ${formatEvidenceType(evidenceType)}`}
                      </span>
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
          </div>

          <div>
            <label htmlFor="evidenceDescription" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Context Annotation
            </label>
            <textarea
              id="evidenceDescription"
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              rows={2}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
              placeholder="Provide a brief explanation of the attached payload..."
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isPending || uploading || !address}
            className="flex-1 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 disabled:bg-white/5 disabled:text-gray-600 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3"
          >
            {uploading || isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>PROCESSING...</span>
              </>
            ) : (
              'FILE DISPUTE'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 bg-white/5 text-gray-400 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              CANCEL
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
