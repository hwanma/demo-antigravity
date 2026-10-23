export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111
export const SEPOLIA_CHAIN_ID_DECIMAL = 11155111;

// Default demo address (replace with your deployed Sepolia contract address)
export const DEFAULT_CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export const CONTRACT_ABI = [
  "function sendTip(string calldata _name, string calldata _message) external payable",
  "function getAllTips() external view returns (tuple(address from, string name, string message, uint256 amount, uint256 timestamp)[])",
  "function getTotalTips() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function withdraw() external",
  "event NewTip(address indexed from, string name, string message, uint256 amount, uint256 timestamp)"
];

// Fallback demo vibes to display if no contract is connected yet
export const MOCK_TIPS = [
  {
    from: "0x12aB...34Cd",
    name: "Satoshi_Nakamoto",
    message: "Keep vibecoding! The future of decentralized apps is bright 🚀",
    amount: "0.01",
    timestamp: Date.now() - 1000 * 60 * 25,
    tag: "Genesis Vibe"
  },
  {
    from: "0x98fE...76ba",
    name: "Elena_Web3",
    message: "Built and deployed in 45 minutes using Antigravity and Firebase! 💜",
    amount: "0.005",
    timestamp: Date.now() - 1000 * 60 * 12,
    tag: "Bootcamp Crew"
  },
  {
    from: "0x44cC...99aa",
    name: "CyberDave",
    message: "Sent 0.002 Sepolia ETH from MetaMask! Works like a charm ✨",
    amount: "0.002",
    timestamp: Date.now() - 1000 * 60 * 3,
    tag: "Sepolia Testnet"
  }
];
