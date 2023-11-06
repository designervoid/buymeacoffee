import './App.css';
import TonConnectButton from './components/TonConnectButton';
import { useTonConnectUI, useTonConnectedWallet } from './context/TonConnectUI';
import { TGSPlayer } from './components/TGSPlayer';

import { createSignal, onMount } from 'solid-js';
import { Coins } from 'ton3-core';

import WebApp from '@twa-dev/sdk';

WebApp.ready();

const address = 'EQCy_jkW-aeL88vemIpoefVf_8-hTSg_CQ6wpZifdJdDUZR-';

function App() {
  const { wallet, restored } = useTonConnectedWallet();
  const [tonConnectUI] = useTonConnectUI();

  const [donationAmount, setDonationAmount] = createSignal<undefined | string>(undefined);

  const donate = async () => {
    const donationAmountReaded = donationAmount();

    if (Number(donationAmountReaded) <= 0) {
      alert('Input correct amount!');

      return;
    }

    if (donationAmountReaded) {
      const nanoAmount = (new Coins(donationAmountReaded).toNano());

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
          {
              address, // destination address will be dogejetton.t.me in @wallet bot
              amount: nanoAmount, // toncoin in nanotons
          }
        ]
      };

      try {
        await tonConnectUI.sendTransaction(tx);
      } catch (err) {
        console.error(err);
      }
    }
  }

  const handleInput = (e: Event & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
  }) => {
    let value = e.currentTarget.value;
    setDonationAmount(value);
  };

  onMount(() => {
    WebApp.expand();
  })

  return (
    <div class="bg-gray min-h-screen p-4 w-screen flex flex-col items-center justify-center">
      <div class="flex flex-col items-center w-full">
        <TonConnectButton />
      </div>
      <TGSPlayer tgsPath="/lottie/Coffee.tgs" className="w-20 h-20" />
      {(restored() && (wallet() !== null ? <div class="flex flex-col items-center mb-4 w-full">
        <input
            value={donationAmount()}
            onChange={handleInput}
            class="mb-2 text-center text-black px-4 py-2 border border-main-blue rounded-full"
            placeholder="Enter amount (TON)"
            type="number" step="0.001"
        />
        <button
          onClick={donate}
          class="bg-main-gradient text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out hover:bg-main-blue active:bg-main-blue focus:outline-none disabled:bg-gray"
        >
          Donate on a coffee
        </button>
      </div> : <span class="mt-4 text-black text-lg text-center">
          To buy coffee for 
          <a href="https://t.me/designervoid" class="text-main-blue font-bold hover:underline">@designervoid</a>, 
          you need to connect a wallet.
      </span>))}
    </div>
  )
}

export default App
