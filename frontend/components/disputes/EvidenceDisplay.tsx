'use client';

import { Evidence } from '@/lib/contracts/disputeResolution';
import { formatEvidenceType, getIPFSGatewayURL } from '@/lib/utils/evidenceHandler';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface EvidenceDisplayProps {
  evidence: Evidence;
}

export default function EvidenceDisplay({ evidence }: EvidenceDisplayProps) {
  const evidenceUrl = evidence.evidenceHash.startsWith('0x')
    ? null
    : getIPFSGatewayURL(evidence.evidenceHash);

  const isImage = evidence.evidenceType === 2;
  const isVideo = evidence.evidenceType === 3;

  return (
    <div className="p-8 glass-card border border-white/10 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-xl font-bold text-white mb-2">
            {formatEvidenceType(evidence.evidenceType as any)}
          </h4>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Payload by <span className="text-indigo-400 font-bold">{evidence.submittedBy.slice(0, 6)}...{evidence.submittedBy.slice(-4)}</span>
          </p>
        </div>
        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {formatDistanceToNow(new Date(evidence.timestamp), { addSuffix: true })}
        </div>
      </div>

      {evidence.description && (
        <div className="mb-6 p-4 bg-white/5 border-l-2 border-indigo-500 rounded-r-xl">
          <p className="text-gray-400 text-sm leading-relaxed">{evidence.description}</p>
        </div>
      )}

      {evidenceUrl && (
        <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          {isImage && (
            <div className="relative w-full h-80 bg-black/40">
              <Image
                src={evidenceUrl}
                alt="Secured Evidence Payload"
                fill
                className="object-contain p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {isVideo && (
            <video
              src={evidenceUrl}
              controls
              className="w-full bg-black/40"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {!isImage && !isVideo && (
            <div className="p-10 text-center bg-white/5">
              <a
                href={evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 transition-all active:scale-95"
              >
                Download Payload
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <p className="mt-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Secure External Access Provided</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="text-[10px] font-mono text-gray-600">
          ID: {evidence.evidenceId}
        </div>
        {evidence.evidenceHash && (
          <div className="text-[10px] font-mono text-indigo-500/50 truncate max-w-[200px]">
            HASH: {evidence.evidenceHash}
          </div>
        )}
      </div>
    </div>
  );
}
