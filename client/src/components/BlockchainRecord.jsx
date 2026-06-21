import React from 'react';
import { motion } from 'framer-motion';
import { Link2, CheckCircle, Clock, ExternalLink } from 'lucide-react';

export default function BlockchainRecord({ txHash, blockNumber, timestamp, gasUsed, network = 'Ethereum Sepolia', status = 'confirmed' }) {
  const shortHash = txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : '';
  const etherscanUrl = txHash ? `https://sepolia.etherscan.io/tx/${txHash}` : '#';

  const formattedBlock = blockNumber
    ? blockNumber.toLocaleString()
    : '19,847,293';

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="p-4 rounded-xl"
      style={{
        background: 'rgba(13, 148, 136, 0.06)',
        border: '1px solid rgba(13, 148, 136, 0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(13, 148, 136, 0.15)', border: '1px solid rgba(13, 148, 136, 0.3)' }}
          >
            <Link2 size={15} style={{ color: '#2DD4BF' }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Blockchain Record</div>
            <div className="text-xs" style={{ color: '#94A3B8' }}>CognitiveVault.sol</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, delay: 0.5 }}
          >
            <CheckCircle size={16} style={{ color: '#10B981' }} />
          </motion.div>
          <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Confirmed</span>
        </div>
      </div>

      {/* Details grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#94A3B8' }}>Tx Hash</span>
          <span className="font-mono text-xs text-white">{shortHash}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#94A3B8' }}>Block</span>
          <span className="font-mono text-xs text-white">#{formattedBlock}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#94A3B8' }}>Network</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-white">{network}</span>
          </div>
        </div>
        {gasUsed && (
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#94A3B8' }}>Gas Used</span>
            <span className="font-mono text-xs text-white">{gasUsed.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: '#94A3B8' }}>Timestamp</span>
          <span className="text-xs text-white">{formattedTime}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Etherscan link */}
      <a
        href={etherscanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-xs font-medium w-full py-2 rounded-lg transition-all"
        style={{
          color: '#2DD4BF',
          background: 'rgba(13, 148, 136, 0.1)',
          border: '1px solid rgba(13, 148, 136, 0.2)',
          textDecoration: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(13, 148, 136, 0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(13, 148, 136, 0.1)'}
      >
        View on Etherscan
        <ExternalLink size={11} />
      </a>
    </motion.div>
  );
}
