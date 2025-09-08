export interface DocSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  content: {
    overview?: string;
    steps?: Array<{
      title: string;
      description: string;
      note?: string;
    }>;
    features?: Array<{
      title: string;
      description: string;
    }>;
    keyPoints?: string[];
    codeExample?: string;
  };
}

export const docsContent: DocSection[] = [
  {
    id: "overview",
    title: "Overview",
    icon: "📖",
    description: "Introduction to PupsBot",
    content: {
      overview: "PupsBot is a Telegram bot designed primarily for trading Rune tokens on Odin.fun through private chats. It provides a seamless trading experience with advanced features for managing your Rune portfolio.",
      features: [
        {
          title: "Private Token Trading",
          description: "Trade Rune tokens directly through Telegram private chats"
        },
        {
          title: "Token Information Assistant",
          description: "Get instant token details in any Telegram group"
        },
        {
          title: "Portfolio Management",
          description: "Track your holdings, PnL, and market positions"
        },
        {
          title: "Secure Wallet Integration",
          description: "Built-in Bitcoin wallet with SegWit support"
        }
      ],
      steps: [
        {
          title: "Getting Started",
          description: "Go to https://t.me/pupsodinbot or click the link to initiate chat with PupsBot"
        },
        {
          title: "Group Integration",
          description: "Invite PupsBot to your Telegram group for token information",
          note: "Click '+ Add Member' → Search '@pupsodinbot' → Add as member"
        },
        {
          title: "Request Token Info",
          description: "Type token ID (e.g., 2jj9) or full Odin.fun token URL in group chat"
        }
      ]
    }
  },
  {
    id: "start",
    title: "/start — Main Menu",
    icon: "✨",
    description: "Central hub for all PupsBot features",
    content: {
      overview: "The main menu is your central hub for PupsBot, accessible via /start or /trade commands. It displays your account summary and provides quick access to all major functions. Trading fees: 1% standard rate, 0.9% with invite code.",
      features: [
        {
          title: "Account Summary",
          description: "View your deposit address, current balance, and active positions"
        },
        {
          title: "Quick Navigation",
          description: "Access all trading and account management features with one click"
        },
        {
          title: "Real-time Updates",
          description: "See your latest balance and position changes instantly"
        }
      ],
      keyPoints: [
        "Access with /start or /trade command",
        "View complete account overview",
        "Navigate to any feature quickly",
        "Check recent activity and updates"
      ]
    }
  },
  {
    id: "deposit",
    title: "/deposit — Add Funds",
    icon: "💸",
    description: "Fund your in-bot Bitcoin wallet",
    content: {
      overview: "Fund your in-bot Bitcoin wallet to start trading Rune tokens. PupsBot provides a unique SegWit address for secure deposits.",
      steps: [
        {
          title: "Access Deposit",
          description: "Use /deposit command or click 'Deposit' from main menu"
        },
        {
          title: "Get Your Address",
          description: "Receive your unique SegWit deposit address (bc1q...)"
        },
        {
          title: "Send Bitcoin",
          description: "Transfer BTC from any wallet to your PupsBot address",
          note: "Minimum deposit: 0.00005 BTC"
        },
        {
          title: "Wait for Confirmation",
          description: "Funds appear after 2 block confirmations (~20 minutes)"
        }
      ],
      keyPoints: [
        "Bitcoin SegWit Native network only",
        "Minimum deposit: 0.00005 BTC",
        "2 block confirmations required",
        "~20 minutes processing time",
        "Secure wallet generation",
        "No deposit fees - only network transaction fees"
      ]
    }
  },
  {
    id: "buy",
    title: "/buy — Purchase Tokens",
    icon: "🛒",
    description: "Buy Rune tokens on Odin.fun",
    content: {
      overview: "Purchase any token available on Odin.fun directly through PupsBot. View token information and execute trades instantly.",
      steps: [
        {
          title: "Start Purchase",
          description: "Use /buy command or click 'Buy' from main menu"
        },
        {
          title: "Enter Token",
          description: "Provide token ID or full Odin.fun URL",
          note: "Example: '2jj9' or 'https://odin.fun/token/2jj9'"
        },
        {
          title: "Review Information",
          description: "Check token name, price, market cap, and ascended status"
        },
        {
          title: "Select Amount",
          description: "Choose predefined amount or enter custom value",
          note: "Minimum buy: 500 sats (0.000005 BTC)"
        },
        {
          title: "Confirm Purchase",
          description: "Review and confirm your transaction"
        }
      ],
      features: [
        {
          title: "Real-time Pricing",
          description: "Get current market prices and liquidity information"
        },
        {
          title: "Token Analytics",
          description: "View market cap, volume, and ascended status"
        },
        {
          title: "Flexible Amounts",
          description: "Choose from quick options or enter custom amounts"
        },
        {
          title: "Transparent Fees",
          description: "1% trading fee (0.9% with invite code) clearly displayed"
        }
      ],
      keyPoints: [
        "Trading fees: 1% standard rate, 0.9% with invite code",
        "Minimum buy amount: 500 sats (0.000005 BTC)",
        "Real-time price quotes before purchase",
        "Instant trade execution on Odin.fun platform"
      ]
    }
  },
  {
    id: "sell",
    title: "/sell — Sell Tokens",
    icon: "💰",
    description: "Sell your Rune token holdings",
    content: {
      overview: "Sell your existing token holdings with real-time pricing and PnL tracking. Choose from quick sell options or custom percentages.",
      steps: [
        {
          title: "Access Sell",
          description: "Use /sell command or click 'Sell' from main menu"
        },
        {
          title: "Select Token",
          description: "Choose from your current holdings"
        },
        {
          title: "View Details",
          description: "Check balance, current price, market cap, and PnL"
        },
        {
          title: "Choose Amount",
          description: "Select 50%, 100%, initial investment, or custom percentage",
          note: "Minimum sell: 500 sats (0.000005 BTC)"
        },
        {
          title: "Execute Sale",
          description: "Confirm and complete your transaction"
        }
      ],
      features: [
        {
          title: "PnL Tracking",
          description: "See your profit/loss in both USD and BTC"
        },
        {
          title: "Quick Sell Options",
          description: "Preset percentages for fast execution"
        },
        {
          title: "Initial Investment Recovery",
          description: "Option to sell exactly your initial investment amount"
        },
        {
          title: "Fee Structure",
          description: "Same 1% trading fee (0.9% with invite code) as purchases"
        }
      ],
      keyPoints: [
        "Trading fees: 1% standard rate, 0.9% with invite code",
        "Minimum sell amount: 500 sats (0.000005 BTC)",
        "Real-time PnL calculations displayed",
        "Instant execution with current market prices"
      ]
    }
  },
  {
    id: "positions",
    title: "/positions — View Holdings",
    icon: "📊",
    description: "Track your token portfolio",
    content: {
      overview: "Monitor all your current token holdings and their performance. View detailed analytics including entry prices, profit/loss, and complete trading history for each position.",
      features: [
        {
          title: "Comprehensive Portfolio View",
          description: "See all tokens with balance, current value, and performance metrics"
        },
        {
          title: "Advanced Analytics",
          description: "Track detailed PnL in both USD and BTC with percentage gains/losses"
        },
        {
          title: "Trading History",
          description: "View complete purchase and sale history for each token"
        },
        {
          title: "Entry Price Tracking",
          description: "View average entry prices and cost basis for each position"
        },
        {
          title: "Real-time Updates",
          description: "Live price updates and PnL calculations"
        },
        {
          title: "Portfolio Sorting",
          description: "Sort by recent activity, holding value, or performance"
        }
      ],
      keyPoints: [
        "Displays up to 4 tokens per page with pagination",
        "Complete trading history and transaction details",
        "Real-time profit/loss calculations",
        "Average entry price with cost basis tracking",
        "Performance metrics in both USD and BTC",
        "Quick access to buy/sell for each position",
        "Integration with Auto TP/SL settings"
      ]
    }
  },
  {
    id: "withdraw",
    title: "/withdraw — Transfer Funds",
    icon: "🔄",
    description: "Withdraw BTC or Runes",
    content: {
      overview: "Transfer your Bitcoin or Rune tokens to any external Bitcoin address. Support for both BTC and Rune withdrawals.",
      steps: [
        {
          title: "Start Withdrawal",
          description: "Use /withdraw command or click 'Withdraw' from main menu"
        },
        {
          title: "Select Asset",
          description: "Choose between BTC or available Rune tokens"
        },
        {
          title: "Enter Details",
          description: "Provide amount and valid SegWit BTC address",
          note: "Minimum withdrawal: 0.0001 BTC"
        },
        {
          title: "Confirm Transaction",
          description: "Review details and confirm withdrawal",
          note: "Withdrawal fee: 10k sats for transaction costs"
        }
      ],
      keyPoints: [
        "Support for BTC and Rune withdrawals",
        "SegWit address format required",
        "Minimum withdrawal: 0.0001 BTC",
        "Network fee: 10,000 sats",
        "Instant processing after confirmation"
      ]
    }
  },
  {
    id: "referral",
    title: "/referral — Referral Program",
    icon: "👥",
    description: "Earn rewards by inviting friends",
    content: {
      overview: "Share your invite code and earn rewards when friends trade using PupsBot. Track your referral earnings and claim rewards directly to your wallet.",
      features: [
        {
          title: "Unique Invite Code",
          description: "Get your personal referral link to share"
        },
        {
          title: "Multi-level Rewards",
          description: "Earn from multiple referral levels"
        },
        {
          title: "Earnings Dashboard",
          description: "Track total earned and available to claim"
        },
        {
          title: "Instant Claims",
          description: "Withdraw earnings directly to your in-bot wallet"
        }
      ],
      steps: [
        {
          title: "Get Your Code",
          description: "Access /referral to view your unique invite link"
        },
        {
          title: "Share with Friends",
          description: "Send your referral link to potential users"
        },
        {
          title: "Track Earnings",
          description: "Monitor referrals and earnings per level"
        },
        {
          title: "Claim Rewards",
          description: "Click 'Claim to Wallet' to receive your earnings"
        }
      ]
    }
  },
  {
    id: "profile",
    title: "/profile — Manage Profile",
    icon: "👤",
    description: "Customize your PupsBot profile",
    content: {
      overview: "Manage your display name and profile picture. Personalize your PupsBot experience with custom settings.",
      features: [
        {
          title: "Display Name",
          description: "Set a custom name (max 20 characters)"
        },
        {
          title: "Profile Picture",
          description: "Upload and manage your profile image"
        },
        {
          title: "User ID",
          description: "View your unique identifier"
        }
      ],
      steps: [
        {
          title: "Access Profile",
          description: "Use /profile command or navigate from main menu"
        },
        {
          title: "Update Name",
          description: "Click 'Change Display Name' and enter new name"
        },
        {
          title: "Update Picture",
          description: "Upload a new profile picture"
        }
      ]
    }
  },
  {
    id: "autotpsl",
    title: "/autotpsl — Auto Take Profit/Stop Loss",
    icon: "🎯",
    description: "Set automated take profit and stop loss orders",
    content: {
      overview: "Automatically manage your Rune token positions with pre-configured take profit and stop loss orders. This advanced feature helps protect your investments and lock in profits without constant monitoring.",
      features: [
        {
          title: "Automated Risk Management",
          description: "Set stop loss levels to automatically limit potential losses"
        },
        {
          title: "Profit Taking",
          description: "Configure take profit targets to secure gains automatically"
        },
        {
          title: "Position Monitoring",
          description: "Continuously monitors your positions for trigger conditions"
        },
        {
          title: "Customizable Levels",
          description: "Set custom percentage or price-based triggers"
        }
      ],
      steps: [
        {
          title: "Access Auto TP/SL",
          description: "Use /autotpsl command or navigate from main menu"
        },
        {
          title: "Select Token",
          description: "Choose from your existing token positions"
        },
        {
          title: "Set Take Profit",
          description: "Define your profit target as percentage or price level",
          note: "Common settings: 25%, 50%, 100% profit targets"
        },
        {
          title: "Set Stop Loss",
          description: "Configure your maximum acceptable loss level",
          note: "Recommended: 10-20% stop loss to manage risk"
        },
        {
          title: "Confirm Settings",
          description: "Review and activate your automated trading rules"
        },
        {
          title: "Monitor Status",
          description: "Track active auto TP/SL orders from your positions"
        }
      ],
      keyPoints: [
        "Protect investments with automatic stop losses",
        "Lock in profits with take profit orders",
        "Runs 24/7 without manual intervention",
        "Customizable percentage or price triggers",
        "Can be modified or cancelled anytime",
        "Works with all supported Rune tokens",
        "Instant execution when conditions are met"
      ]
    }
  },
  {
    id: "trade",
    title: "/trade — Alternative Main Menu",
    icon: "💱",
    description: "Alternative entry point to main menu",
    content: {
      overview: "The /trade command provides the same functionality as /start, serving as an alternative entry point to PupsBot's main menu and trading features.",
      features: [
        {
          title: "Identical to /start",
          description: "Same interface and features as the main menu"
        },
        {
          title: "Quick Access",
          description: "Alternative command for faster menu access"
        },
        {
          title: "Full Trading Suite",
          description: "Access to all buy, sell, and portfolio features"
        }
      ],
      keyPoints: [
        "Identical functionality to /start command",
        "Alternative entry point for main menu",
        "Same account summary and navigation",
        "Quick access to all trading features"
      ]
    }
  },
  {
    id: "copytrade",
    title: "/copytrade — Copy Trading",
    icon: "👥",
    description: "Follow and copy successful traders",
    content: {
      overview: "Copy the trading strategies of successful traders on the platform. Automatically mirror their buy and sell decisions with customizable position sizing and risk management.",
      features: [
        {
          title: "Trader Discovery",
          description: "Browse and analyze top-performing traders"
        },
        {
          title: "Automated Copying",
          description: "Automatically execute the same trades as your chosen traders"
        },
        {
          title: "Risk Management",
          description: "Set custom position sizes and maximum exposure limits"
        },
        {
          title: "Performance Tracking",
          description: "Monitor your copy trading performance and statistics"
        }
      ],
      steps: [
        {
          title: "Access Copy Trade",
          description: "Use /copytrade command or navigate from main menu"
        },
        {
          title: "Browse Traders",
          description: "View top traders and their performance metrics"
        },
        {
          title: "Select Trader",
          description: "Choose a trader to copy based on their track record"
        },
        {
          title: "Configure Settings",
          description: "Set your position size and risk parameters",
          note: "Recommended: Start with smaller position sizes to test strategy"
        },
        {
          title: "Start Copying",
          description: "Begin automatically copying the trader's positions"
        },
        {
          title: "Monitor Performance",
          description: "Track your copy trading results and adjust as needed"
        }
      ],
      keyPoints: [
        "Copy trades from successful traders",
        "Customizable position sizing",
        "Real-time trade mirroring",
        "Performance analytics and tracking",
        "Risk management controls",
        "Can follow multiple traders simultaneously"
      ]
    }
  },
  {
    id: "wallets",
    title: "/wallets — Multiple Wallet Management",
    icon: "🗂️",
    description: "Manage multiple trading wallets",
    content: {
      overview: "Create and manage multiple isolated trading wallets within PupsBot. Each wallet operates independently with its own balance, positions, and trading history.",
      features: [
        {
          title: "Multiple Wallets",
          description: "Create and manage separate trading wallets"
        },
        {
          title: "Isolated Balances",
          description: "Each wallet maintains independent Bitcoin balances"
        },
        {
          title: "Strategy Separation",
          description: "Use different wallets for different trading strategies"
        },
        {
          title: "Easy Switching",
          description: "Quickly switch between wallets for trading"
        }
      ],
      steps: [
        {
          title: "Access Wallets",
          description: "Use /wallets command or navigate from main menu"
        },
        {
          title: "View Current Wallets",
          description: "See all your existing wallets and their balances"
        },
        {
          title: "Create New Wallet",
          description: "Add a new wallet with custom name and settings"
        },
        {
          title: "Switch Active Wallet",
          description: "Select which wallet to use for trading operations",
          note: "All trading commands will use the currently active wallet"
        },
        {
          title: "Manage Wallets",
          description: "Rename, delete, or modify wallet settings"
        }
      ],
      keyPoints: [
        "Create multiple isolated trading wallets",
        "Each wallet has independent Bitcoin balance",
        "Switch between wallets for different strategies",
        "All trading operations use the active wallet",
        "Separate positions and trading history per wallet"
      ]
    }
  },
  {
    id: "transfer",
    title: "/transfer — Inter-wallet Transfers",
    icon: "🔄",
    description: "Transfer Bitcoin between your wallets",
    content: {
      overview: "Transfer Bitcoin between your multiple wallets instantly. Manage your Bitcoin funds across different trading strategies and wallet configurations.",
      features: [
        {
          title: "Instant BTC Transfers",
          description: "Move Bitcoin between wallets immediately"
        },
        {
          title: "Bitcoin Only",
          description: "Currently supports Bitcoin transfers only"
        },
        {
          title: "No Transfer Fees",
          description: "Internal Bitcoin transfers between your wallets are free"
        },
        {
          title: "Transaction History",
          description: "Track all inter-wallet transfer history"
        }
      ],
      steps: [
        {
          title: "Access Transfer",
          description: "Use /transfer command or navigate from wallets menu"
        },
        {
          title: "Select Source Wallet",
          description: "Choose the wallet to transfer funds from"
        },
        {
          title: "Choose Destination",
          description: "Select the wallet to receive the Bitcoin"
        },
        {
          title: "Enter Amount",
          description: "Specify the Bitcoin amount to transfer between wallets"
        },
        {
          title: "Confirm Transfer",
          description: "Review details and execute the Bitcoin transfer",
          note: "Bitcoin transfers are instant and free between your wallets"
        }
      ],
      keyPoints: [
        "Instant Bitcoin transfers between your wallets",
        "Bitcoin only - Rune tokens stay in their original wallet",
        "No fees for internal Bitcoin transfers",
        "Complete transfer history tracking",
        "Helps manage Bitcoin allocation across trading strategies"
      ]
    }
  },
  {
    id: "help",
    title: "/help — Get Assistance",
    icon: "❓",
    description: "Access support and resources",
    content: {
      overview: "Get help with using PupsBot, view command list, and contact our support team for assistance.",
      features: [
        {
          title: "Command Reference",
          description: "Complete list of all available commands"
        },
        {
          title: "Direct Support",
          description: "Contact our support team instantly"
        },
        {
          title: "FAQ Access",
          description: "Common questions and solutions"
        }
      ],
      keyPoints: [
        "Access with /help command",
        "View all available commands",
        "Direct support contact",
        "Troubleshooting guides",
        "Community resources"
      ]
    }
  }
];

export const commandsList = [
  { command: "/start", description: "Open main menu" },
  { command: "/trade", description: "Alternative to /start" },
  { command: "/deposit", description: "Add funds to wallet" },
  { command: "/buy", description: "Purchase tokens" },
  { command: "/sell", description: "Sell token holdings" },
  { command: "/positions", description: "View your portfolio" },
  { command: "/withdraw", description: "Transfer funds out" },
  { command: "/autotpsl", description: "Auto take profit/stop loss" },
  { command: "/copytrade", description: "Copy successful traders" },
  { command: "/wallets", description: "Manage multiple wallets" },
  { command: "/transfer", description: "Transfer between wallets" },
  { command: "/referral", description: "Referral program" },
  { command: "/profile", description: "Manage profile" },
  { command: "/help", description: "Get assistance" }
];