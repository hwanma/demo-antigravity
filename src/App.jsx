import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import confetti from 'canvas-confetti';
import { 
  Coffee, 
  Wallet, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Settings, 
  Flame, 
  HeartHandshake,
  ArrowUpRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { 
  SEPOLIA_CHAIN_ID, 
  SEPOLIA_CHAIN_ID_DECIMAL, 
  DEFAULT_CONTRACT_ADDRESS, 
  CONTRACT_ABI, 
  MOCK_TIPS 
} from './contractInfo';

export default function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [network, setNetwork] = useState(null);
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [showConfig, setShowConfig] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('0.002');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Vibes feed
  const [vibes, setVibes] = useState(MOCK_TIPS);
  const [isChainData, setIsChainData] = useState(false);
  const [isLoadingVibes, setIsLoadingVibes] = useState(false);

  // Quick amount presets
  const presets = ['0.001', '0.002', '0.005', '0.01'];

  // Check if wallet is already connected
  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      await updateAccountDetails(accounts[0]);
    } else {
      setAccount('');
      setBalance('');
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      const currentNetwork = await provider.getNetwork();
      setNetwork(Number(currentNetwork.chainId));

      if (accounts.length > 0) {
        const address = accounts[0].address;
        setAccount(address);
        await updateAccountDetails(address, provider);
      }
    } catch (err) {
      console.error("Error checking wallet:", err);
    }
  };

  const updateAccountDetails = async (address, customProvider = null) => {
    try {
      const provider = customProvider || new ethers.BrowserProvider(window.ethereum);
      const rawBalance = await provider.getBalance(address);
      setBalance(Number(ethers.formatEther(rawBalance)).toFixed(4));
    } catch (e) {
      console.warn("Could not fetch balance:", e);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask (or a Web3 browser wallet) is required to interact with Sepolia!");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      await updateAccountDetails(accounts[0], provider);

      const net = await provider.getNetwork();
      setNetwork(Number(net.chainId));
    } catch (err) {
      console.error("User rejected wallet connection:", err);
    }
  };

  const switchToSepolia = async () => {
    try {
      if (!window.ethereum) return;
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                nativeCurrency: { name: 'SepoliaETH', symbol: 'SEP', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Sepolia network", addError);
        }
      }
    }
  };

  // Fetch vibes from contract
  const fetchVibesFromContract = async () => {
    if (!window.ethereum || !contractAddress) return;
    setIsLoadingVibes(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      
      const rawTips = await contract.getAllTips();
      if (rawTips && rawTips.length > 0) {
        const formatted = rawTips.map((t) => ({
          from: t.from,
          name: t.name,
          message: t.message,
          amount: ethers.formatEther(t.amount),
          timestamp: Number(t.timestamp) * 1000,
          tag: 'On-Chain'
        })).reverse();
        setVibes(formatted);
        setIsChainData(true);
      } else {
        setVibes(MOCK_TIPS);
        setIsChainData(false);
      }
    } catch (err) {
      console.warn("Could not query contract tips, using demo vibe feed:", err);
      setIsChainData(false);
    } finally {
      setIsLoadingVibes(false);
    }
  };

  useEffect(() => {
    if (account && network === SEPOLIA_CHAIN_ID_DECIMAL) {
      fetchVibesFromContract();
    }
  }, [account, network, contractAddress]);

  const handleSendTip = async (e) => {
    e.preventDefault();
    if (!account) {
      await connectWallet();
      return;
    }
    if (network !== SEPOLIA_CHAIN_ID_DECIMAL) {
      await switchToSepolia();
      return;
    }
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a name or alias!' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage({ type: 'info', text: 'Waiting for signature in MetaMask...' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      const parsedAmount = ethers.parseEther(amount.toString());

      const tx = await contract.sendTip(name, message || 'Vibing at the Antigravity bootcamp!', {
        value: parsedAmount
      });

      setTxHash(tx.hash);
      setStatusMessage({ type: 'info', text: 'Transaction broadcast! Mining on Sepolia...' });

      await tx.wait(1);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setStatusMessage({ 
        type: 'success', 
        text: 'Vibe successfully registered on Sepolia blockchain!' 
      });

      const newVibe = {
        from: account,
        name,
        message: message || 'Vibing at the Antigravity bootcamp!',
        amount,
        timestamp: Date.now(),
        tag: 'Just Now ✨'
      };
      setVibes((prev) => [newVibe, ...prev]);

      setMessage('');
      updateAccountDetails(account);
    } catch (err) {
      console.error("Tip failed:", err);
      const errorText = err.reason || err.message || "Transaction was rejected or failed.";
      setStatusMessage({ type: 'error', text: errorText.slice(0, 100) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSepolia = network === SEPOLIA_CHAIN_ID_DECIMAL;
  const totalEthCollected = vibes.reduce((acc, v) => acc + parseFloat(v.amount || '0'), 0).toFixed(4);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        
        {/* Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl shadow-lg shadow-purple-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                  Demo <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Antigravity</span>
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono">
                  Sepolia
                </span>
              </div>
              <p className="text-xs text-slate-400">Vibecoded with Google Antigravity &bull; Firebase Hosting</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {account && (
              isSepolia ? (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Sepolia Testnet
                </div>
              ) : (
                <button
                  onClick={switchToSepolia}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-semibold hover:bg-amber-500/30 transition-all"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Switch to Sepolia
                </button>
              )
            )}

            {account ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono">
                <span className="text-slate-400">{balance ? `${balance} ETH` : 'Connected'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span className="text-purple-300 font-semibold">{account.slice(0, 6)}...{account.slice(-4)}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium shadow-md shadow-purple-600/25 transition-all active:scale-95"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all"
              title="Contract Configuration"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {showConfig && (
          <div className="mb-8 p-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-purple-400" />
                Smart Contract Settings
              </span>
              <span className="text-xs text-slate-500">Paste your teammate's contract address to tip them!</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x... (Deployed TipJar Sepolia Address)"
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={fetchVibesFromContract}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync Chain
              </button>
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Antigravity Vibecoding Showcase
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Send test ETH, leave your vibe on <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Sepolia</span>.
          </h2>
          <p className="text-slate-400 text-sm">
            Built live with Antigravity AI pair programming. Every tip is permanently recorded on Ethereum Sepolia.
          </p>
        </section>

        {/* Main Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form */}
          <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-3xl p-6 shadow-xl shadow-black/40">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                Send a Vibe
              </h3>
              <span className="text-xs text-purple-300/80 font-mono">Sepolia Testnet</span>
            </div>

            <form onSubmit={handleSendTip} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Select Tip Amount (Sepolia ETH)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presets.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        amount === val
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm shadow-purple-500/20'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {val} ETH
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Your Handle or Alias
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vitalik.eth or Satoshi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={3}
                  placeholder="Leave a message for the live wall..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all resize-none"
                />
              </div>

              {statusMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  statusMessage.type === 'error' 
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300' 
                    : statusMessage.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                    : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
                }`}>
                  {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                  {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />}
                  <div className="flex-1">
                    <p>{statusMessage.text}</p>
                    {txHash && (
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-purple-400 underline font-mono text-[11px]"
                      >
                        View on Sepolia Etherscan <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Signing & Broadcasting...
                  </>
                ) : (
                  <>
                    <HeartHandshake className="w-4 h-4" />
                    Send {amount} ETH & Vibe
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Wall */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Live Vibe Wall ({vibes.length})
                </h3>
                <p className="text-xs text-slate-400">
                  {isChainData ? 'Verified on Sepolia testnet' : 'Showing demo vibes until first contract interaction'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Total Tipped</span>
                  <span className="text-sm font-bold font-mono text-purple-300">{totalEthCollected} ETH</span>
                </div>
                <button
                  onClick={fetchVibesFromContract}
                  disabled={isLoadingVibes}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                  title="Refresh Feed"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingVibes ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {vibes.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-slate-900/70 border border-slate-800/70 hover:border-purple-500/40 rounded-2xl transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white uppercase">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">
                          {typeof item.from === 'string' && item.from.length > 12 
                            ? `${item.from.slice(0, 6)}...${item.from.slice(-4)}`
                            : item.from}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        +{item.amount} ETH
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 pl-10 leading-relaxed">
                    "{item.message}"
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-950 rounded text-slate-400">
                      {item.tag || 'Sepolia Event'}
                    </span>
                    <a
                      href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-purple-400 flex items-center gap-1 transition-colors"
                    >
                      Etherscan <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>

      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ⚡ <strong>Demo Antigravity</strong> &bull; Vibecoding Bootcamp
          </span>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://firebase.google.com" target="_blank" rel="noreferrer" className="hover:text-white">Firebase Hosting</a>
            <a href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer" className="hover:text-white">Sepolia Explorer</a>
            <a href="https://remix.ethereum.org" target="_blank" rel="noreferrer" className="hover:text-white">Remix IDE</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
