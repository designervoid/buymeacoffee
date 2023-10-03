import './App.css';
import TonConnectButton from './components/TonConnectButton';
import { useTonConnectUI, useTonConnectedWallet } from './context/TonConnectUI';
import { TGSPlayer } from './components/TGSPlayer';

import { createSignal, onMount } from 'solid-js';
import { request, gql } from 'graphql-request'
import { toNano } from 'ton-core'

const endpoint = 'https://dton.io/graphql/'

const query = gql`
  query data {
    account_states(
      account_state_state_init_code_method_name: "get_nft_data"
      parsed_nft_content_offchain_url: "https://nft.fragment.com/username/designervoid.json",
    ) {
      nft_address: address
      nft_workchain: workchain
      nft_index: parsed_nft_index
      
      collection_address: parsed_nft_collection_address_address
      collection_workchain: parsed_nft_collection_address_workchain
      
      parsed_nft_owner_address_workchain
      parsed_nft_owner_address_address
      
      parsed_nft_content_storage_type
      parsed_nft_content_offchain_url: parsed_nft_content_offchain_url
      
      lt
    }
  }
`

export interface TelegramUsernameNft {
  nft_address:                        string;
  nft_workchain:                      number;
  nft_index:                          string;
  collection_address:                 string;
  collection_workchain:               number;
  parsed_nft_owner_address_workchain: number;
  parsed_nft_owner_address_address:   string;
  parsed_nft_content_storage_type:    string;
  parsed_nft_content_offchain_url:    string;
  lt:                                 number;
}

export interface TelegramUsernameNftAccountStates {
  account_states: [TelegramUsernameNft];
};

function App() {
  const { connectedWallet } = useTonConnectedWallet();
  const [tonConnectUI] = useTonConnectUI();

  const [walletDonateRaw, setWalletDonateRaw] = createSignal<undefined | TelegramUsernameNftAccountStates>(undefined);
  const [donationAmount, setDonationAmount] = createSignal("1");

  const donate = () => {
    const walletDonateRawReaded = walletDonateRaw();
    if (walletDonateRawReaded && donationAmount()) {
      const template = `${walletDonateRawReaded?.account_states[0].parsed_nft_owner_address_workchain}:${walletDonateRawReaded?.account_states[0].parsed_nft_owner_address_address}`; // excepted designervoid.t.me, but will show doge-jetton.t.me

      const nanoAmount = (toNano(donationAmount())).toString();

      console.log(nanoAmount);

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
          {
              address: template, // destination address will be doge-jetton.t.me in @wallet bot
              amount: toNano(donationAmount()).toString() // toncoin in nanotons
          }
        ]
      };

      tonConnectUI.sendTransaction(tx)
    }
  }

  const handleInput = (e: InputEvent & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
  }) => {
    let value = e.currentTarget.value;
    value = value.replace(/[^\d.]/g, '');
    const isValid = /^(\d+(\.\d{0,2})?)?$/.test(value);

    if (isValid) {
      setDonationAmount(value);
      return;
    } else {
      e.target.value = donationAmount();
      alert('Invalid value!');
    }
  };

  onMount(() => {
    const run = async () => {
      const t = await request<TelegramUsernameNftAccountStates>(endpoint, query);
      setWalletDonateRaw(t);
    }
    run();
  })

  return (
    <div class="bg-bg-gray min-h-screen p-4 w-screen">
      <div class="flex flex-col items-center w-full">
        <TonConnectButton />
      </div>
      {connectedWallet() && <div class="flex flex-col items-center mb-4 w-full">
        <TGSPlayer tgsPath="/lottie/Coffee.tgs" className="mb-2 w-20 h-20" />
        <input
            type="text"
            value={donationAmount()}
            onInput={handleInput}
            class="mb-2 text-center text-black px-4 py-2 border border-main-blue rounded-full"
            placeholder="Enter amount (TON)"
            min="0.1" step="0.1"
            pattern="\d+(\.\d{0,2})?"
        />
        <button
          onClick={donate}
          class="bg-gradient-to-r from-gradient-left to-gradient-right text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out hover:bg-main-blue active:bg-main-blue focus:outline-none"
        >
          Donate on a coffee
        </button>
      </div>}
    </div>
  )
}

export default App
